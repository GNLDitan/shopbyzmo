import { Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ContentType, CONTENT_TYPE } from 'src/app/classes/content-type';
import { BlogContent } from 'src/app/classes/blog-content';
import { DataService } from 'src/app/services/data.service';
import { Subscription, Subject, of } from 'rxjs';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { Utils } from 'src/app/app.utils';
import { environment } from 'src/environments/environment';
import { map, debounceTime, distinctUntilChanged, mergeMap, delay } from 'rxjs/operators';
import { EmbedVideoService } from 'src/app/services/embed-video.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToasterService } from 'src/app/services/toaster.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';

@Component({
  selector: 'app-blog-content',
  templateUrl: './blog-content.component.html',
  styleUrls: ['./blog-content.component.scss']
})
export class BlogContentComponent implements OnInit, AfterViewInit {

  @ViewChild('quillEditor', { static: false }) quillEditor: any;
  @Input() contentCount: number;
  @Input() selectedContentImages: ImageViewer[];
  @Output() content = new EventEmitter<BlogContent>();
  @Output() contentImages = new EventEmitter<Array<ImageViewer>>();
  @Output() viewContentInfo = new EventEmitter<boolean>();
  @Output() contentRemovedImageUrls = new EventEmitter<any>();

  blogFolderPath: string;
  contentType: ContentType[];
  editor_modules = {};
  selectedContentSubscription: Subscription;
  contentForm: FormGroup;
  isUploading: boolean;
  imageBlobs: ImageViewer[];
  removedImageUrls: any;
  isSaveDisabled: boolean;
  isImage: boolean;
  embeddedUrl: SafeResourceUrl;

  private currentQuillBody: '';
  private selectedContent: BlogContent;

  constructor(private formBuilder: FormBuilder,
    private dataService: DataService,
    private embedVideoService: EmbedVideoService,
    private sanitizer: DomSanitizer,
    private toasterService: ToasterService,
    private confirmationService: ConfirmationService) {
    this.contentType = CONTENT_TYPE;
    this.isUploading = false;
    this.isSaveDisabled = false;
    this.imageBlobs = [];
    this.removedImageUrls = [];
    this.isImage = false;
    this.editor_modules = {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          ['link'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ color: [] }, { background: [] }],
          ['clean']
        ]
      }
    };

    this.contentForm = this.formBuilder.group({
      typeId: [1],
      type: [''],
      headerText: ['', Validators.required],
      description: [''],
      contentImages: [''],
      videoLink: ['']
    });

    this.selectedContent = new BlogContent();
    this.embeddedUrl = '';
  }

  ngOnInit() {
    this.blogFolderPath = environment.blogFolderPath;
    this.loadContentInfo();
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    this.embeddedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(pastedText));
  }

  onChange(event: any) {
    if (event.target.value != '') {
      this.embeddedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(event.target.value));
    }
  }

  ngOnDestroy() {
    this.viewContentInfo.unsubscribe();
    this.dataService.setSelectedContent(new BlogContent());
  }

  ngAfterViewInit() {

    if (!Utils.isNullOrUndefined(this.quillEditor)) {
      this.quillEditor.elementRef.nativeElement
        .querySelector('.ql-editor').classList
        .add('form-control');
    }

  }

  loadContentInfo() {

    this.selectedContentSubscription = this.dataService.selectedContent$.subscribe((dataComponent: any) => {
      if (!Utils.isNullOrUndefined(dataComponent)) {
        this.selectedContent = dataComponent;
        if (Number(dataComponent.typeId) == 1 || Utils.isNullOrUndefined(Number(dataComponent.typeId))) {
          this.setValidators(1);
        }
        else if (Number(dataComponent.typeId) === 2) {
          this.imageBlobs = [];
          this.setValidators(Number(dataComponent.typeId));
          dataComponent.contentImages.map((img) => {
            const image = new ImageViewer();
            image.imageUrl = img.fileName;
            image.key = dataComponent.sortId
            this.imageBlobs.push(image);
            this.isImage = true;
          });

          if (this.selectedContentImages != null) {
            if (this.selectedContentImages.length > 0) {
              this.selectedContentImages.map((img) => {
                const image = new ImageViewer();
                image.imageUrl = img.imageUrl;
                image.key = dataComponent.sortId
                this.imageBlobs.push(image);
                this.isImage = true;
              });
            }
          }

        } else if (Number(dataComponent.typeId) == 3) {
          this.setValidators(Number(dataComponent.typeId));
          this.embeddedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(this.selectedContent.videoLink));
        }
        this.contentForm.patchValue(this.selectedContent);
      }

    });
  }

  onEditorCreated(event: any) {
    if (event != null) {
      event.root.innerHTML = this.contentForm.controls.description.value
    }
  }

  infoCancel() {
    const dialogQuestion = 'Are you sure to discard this content';
    const dialogMessage = 'Content will not be saved.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      null, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.viewContentInfo.emit(false);
      }
    }).catch(() => { });

  }

  createUpdateHandler() {
    const contentForm = this.contentForm.getRawValue();
    this.currentQuillBody = contentForm.typeId == 1 ? this.quillEditor.quillEditor.root.innerHTML : '';
    let isValid = this.validateContent();
    if (this.contentForm.valid && isValid) {

      if ((this.selectedContent.id === undefined || this.selectedContent.id === 0)) {
        this.createContent();
      } else {
        this.updateContent();
      }
    }


  }

  createContent() {
    let newContent = new BlogContent();
    const contentForm = this.contentForm.getRawValue();

    newContent = contentForm;
    newContent.id = Utils.isNullOrUndefined(this.selectedContent.id) ? this.contentCount + 1 : this.selectedContent.id;
    newContent.description = this.currentQuillBody;
    newContent.typeId = this.contentForm.controls.typeId.value;
    newContent.sortId = this.contentCount + 1;
    newContent.isNew = true;
    newContent.videoLink = this.contentForm.controls.videoLink.value;
    if (Number(contentForm.typeId) === 2) {
      this.imageBlobs.map((images) => {
        images.key = newContent.sortId;
      });

    }

    this.content.emit(newContent);
    this.contentImages.emit(this.imageBlobs);
    this.viewContentInfo.emit(false);
    //this.infoCancel();
  }

  updateContent() {
    let updateContent = new BlogContent();

    const contentForm = this.contentForm.getRawValue();

    updateContent = contentForm;
    updateContent.id = Utils.isNullOrUndefined(this.selectedContent.id) ? this.contentCount + 1 : this.selectedContent.id;
    updateContent.description = this.currentQuillBody;
    updateContent.typeId = Number(contentForm.typeId);
    updateContent.sortId = this.selectedContent.sortId;
    updateContent.isNew = Utils.isNullOrUndefined(this.selectedContent.id) ? true : false;
    updateContent.videoLink = this.contentForm.controls.videoLink.value;
    if (Number(contentForm.typeId) === 2) {
      this.imageBlobs.map((images) => {
        images.key = updateContent.sortId;
      });

    }

    this.content.emit(updateContent);
    this.contentImages.emit(this.imageBlobs);
    this.contentRemovedImageUrls.emit(this.removedImageUrls);
    this.viewContentInfo.emit(false);
  }

  validateContent() {
    const contentForm = this.contentForm.getRawValue();

    if (Number(contentForm.typeId) == 2) {
      if (this.imageBlobs.length === 0 || Utils.isNullOrUndefined(this.imageBlobs)) {
        this.toasterService.alert('danger', 'Please add image first.');
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  uploadImages(fileEvent: any) {

    const files = fileEvent.target.files;
    this.isUploading = true;
    for (let i = 0; i < files.length; i++) {
      const newImageBlob = new ImageViewer();
      newImageBlob.file = files.item(i);

      this.imageBlobs.push(newImageBlob);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageBlobs.find(f => f.file === files.item(i)).imageUrl = event.target.result;
        if (i === files.length - 1) {
          this.isUploading = false;
          fileEvent.target.value = '';
        }
      };
      reader.readAsDataURL(newImageBlob.file);
      this.isSaveDisabled = false;
    }
  }

  removeImages(imageUrl: string) {
    if (Utils.isStringNullOrEmpty(imageUrl)) {
      return;
    }
    this.removedImageUrls.push(imageUrl);
    const imageViewIndex = this.imageBlobs.findIndex(f => f.imageUrl === imageUrl);
    if (imageViewIndex > -1) {
      this.imageBlobs.splice(imageViewIndex, 1);
      this.contentForm.controls.contentImages.value.splice(imageViewIndex, 1);
    }
    this.isSaveDisabled = this.imageBlobs.length > 0 ? false : true;
  }

  onOptionsSelected(value: any) {
    if (value == 1) {
      this.imageBlobs = [];
      this.isImage = false;
      this.contentForm.controls.videoLink.setValue('');
      this.embeddedUrl = '';
      this.setValidators(value);
    } else if (value == 2) {
      this.setValidators(value);
      this.isImage = true;
    }
    else if (value == 3) {
      this.contentForm.controls.description.setValue('');
      this.isImage = false;
      this.setValidators(value);
    }
  }

  setValidators(type: number) {
    if (type == 1) {
      this.contentForm.controls.description.setValidators([Validators.required]);
      this.contentForm.controls.description.updateValueAndValidity();
      this.contentForm.controls.videoLink.clearValidators();
      this.contentForm.controls.videoLink.updateValueAndValidity();
    } else if (type == 2) {
      this.contentForm.controls.description.clearValidators();
      this.contentForm.controls.description.updateValueAndValidity();
      this.contentForm.controls.videoLink.clearValidators();
      this.contentForm.controls.videoLink.updateValueAndValidity();
    }
    else if (type == 3) {
      this.contentForm.controls.videoLink.setValidators([Validators.required]);
      this.contentForm.controls.videoLink.updateValueAndValidity();
      this.contentForm.controls.description.clearValidators();
      this.contentForm.controls.description.updateValueAndValidity();
    }
  }

  getEmbeddedUrl(videoLink: string) {
    var embedUrl;
    embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(videoLink));

    return embedUrl;
  }
}
