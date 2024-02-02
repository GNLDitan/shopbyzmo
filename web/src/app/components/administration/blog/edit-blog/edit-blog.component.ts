import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { Blog } from 'src/app/classes/blog';
import { BlogContent } from 'src/app/classes/blog-content';
import { ValidatorService } from 'src/app/services/validator.service';
import { DataService } from 'src/app/services/data.service';
import { BlogService } from 'src/app/services/blog.service';
import { environment } from 'src/environments/environment';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Utils } from 'src/app/app.utils';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Tag } from 'src/app/classes/tag';
import { $ } from 'protractor';
import { FileMapper } from 'src/app/classes/file-mapper';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.scss']
})
export class EditBlogComponent implements OnInit, OnDestroy {
  // @ViewChild('quillEditor', { static: false }) quillEditor: any;
  blogFolderPath: string;
  blogForm: FormGroup;
  editor_modules = {};
  coverImageUrl: string;
  coverImageBlob: ImageViewer;
  fileLanding: string;
  blog: Blog;
  blogContents: Array<BlogContent>;
  imageBlobs: ImageViewer[];
  blogSubscription: any;
  removedImageUrls: any;

  designTags: Tag[];
  removedTags: Tag[];
  tagNameQuery: string;
  topSuggestedTags: Tag[];
  newTags: []
  selectedContentImages: ImageViewer[];
  isDisabled: boolean;

  embeddedUrl: string;

  public viewContentInfo = false;

  constructor(private formBuilder: FormBuilder,
    private validatorService: ValidatorService,
    private dataService: DataService,
    private blogService: BlogService,
    private navigationService: NavigationService,
    private toasterService: ToasterService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe) {

    this.coverImageUrl = '';
    this.coverImageBlob = new ImageViewer();
    this.blog = new Blog();
    this.imageBlobs = [];
    this.removedImageUrls = [];
    this.blogContents = new Array<BlogContent>();
    this.topSuggestedTags = [];
    this.designTags = [];
    this.removedTags = [];
    this.newTags = [];
    this.tagNameQuery = '';
    this.isDisabled = true;
    this.selectedContentImages = [];
    // this.editor_modules = {
    //   toolbar: {
    //     container: [
    //       ['bold', 'italic', 'underline'],
    //       [{ header: 1 }, { header: 2 }],
    //       [{ list: 'ordered' }, { list: 'bullet' }],
    //       [{ align: [] }],
    //       [{ size: ['small', false, 'large', 'huge'] }],
    //       [{ color: [] }, { background: [] }],
    //       ['clean']
    //     ]
    //   }
    // };


    this.blogForm = this.formBuilder.group({
      id: [0],
      title: ['', Validators.required],
      // description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      allDay: [false],
      coverId: [0],
      coverFileName: [''],
      isActive: [true],
      isDraft: [false]
    });

    this.blogForm.controls['allDay'].patchValue(false);
  }

  ngOnInit() {
    this.viewContentInfo = false;
    this.blogFolderPath = environment.blogFolderPath;
    this.subscribeBlog();
  }

  // ngAfterViewInit() {
  //   this.quillEditor.elementRef.nativeElement
  //     .querySelector('.ql-editor').classList
  //     .add('form-control');
  // }

  ngOnDestroy() {
    this.dataService.selectedBlog$.subscribe();
  }

  // onEditorCreated(event: any) {
  //   if (event != null) {
  //     event.root.innerHTML = this.blogForm.controls.description.value;
  //   }
  // }

  uploadCoverImage(fileEvent: any) {

    this.coverImageBlob.file = fileEvent.target.files.item(0);

    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.coverImageBlob.imageUrl = event.target.result;
      this.coverImageUrl = event.target.result;
      fileEvent.target.value = '';
    };
    reader.readAsDataURL(this.coverImageBlob.file);

  }

  subscribeBlog() {
    this.blogSubscription = this.dataService.selectedBlog$.subscribe((blog: any) => {
      this.imageBlobs = [];
      if (blog.hasOwnProperty('id')) {
        this.blog = blog;
        this.coverImageBlob.imageUrl = this.blogFolderPath + this.blog.coverFileName;
        this.coverImageUrl = this.coverImageBlob.imageUrl;
        this.designTags = blog.tags;
        this.blogForm.patchValue(this.blog);
        if (!this.blog.allDay) {
          this.blogForm.controls.endDate.setValue(this.datePipe.transform(this.blog.startDate, "MM-dd-yyyy"));
        }
        blog.blogContents.map((blc) => {
          //blc.embeddedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(blc.videoLink));
          if (blc.typeId === 2) {
            blc.contentImages.map((img) => {
              if (img != null) {
                const image = new ImageViewer();
                img.fileName = img.fileName.includes(this.blogFolderPath) ? img.fileName : this.blogFolderPath + img.fileName;
                image.imageUrl = img.fileName;
                image.key = blc.sortId
                this.imageBlobs.push(image);
              }
            });

          }

        });

        this.blogContents = blog.blogContents;
        console.log(this.blog);
        this.isDisabled = this.blogContents.length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
      }
    });

  }

  contentInfo(content: BlogContent = null) {
    this.selectedContentImages = [];
    const info = content != null ? content : new BlogContent();
    let selectedImages = this.imageBlobs.filter(x => x.key == info.sortId && x.file !== null);
    selectedImages.map((img) => {
      this.selectedContentImages.push(img);
    });
    this.dataService.setSelectedContent(info);
    this.viewContentInfo = true;
  }

  cancelViewContentInfo($event: any) {
    if ($event != null) {
      this.viewContentInfo = $event;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.sortContent();
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

  }

  contentHandler($event: any) {
    if ($event != null) {
      this.blogContents = (Utils.ArrayObjectUpdater(this.blogContents, $event));
      this.sortContent();
      this.isDisabled = this.blogContents.length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
    }
  }

  contentImageHandler($event: any) {
    if ($event != null) {
      for (let i = 0; i < $event.length; i++) {
        const imageViewIndex = this.imageBlobs.findIndex(f => f.imageUrl === $event[i].imageUrl);
        if (imageViewIndex === -1) {
          this.imageBlobs.push($event[i]);
        }

      }
      this.isDisabled = this.blogContents.length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
    }
  }

  removedImageHandler($event: any) {
    if ($event != null) {
      for (let i = 0; i < $event.length; i++) {
        this.removedImageUrls.push($event[i]);
        const imageViewIndex = this.imageBlobs.findIndex(f => f.imageUrl === $event[i]);
        if (imageViewIndex > -1) {
          this.imageBlobs.splice(imageViewIndex, 1);
        }
      }
    }
  }

  removeContainer(container: BlogContent, contentTypeId: number) {
    this.blogContents.map((blc) => {
      blc.isDeleted = blc.id == container.id ? true : blc.isDeleted;
    });
    this.sortContent();
    this.isDisabled = this.blogContents.filter(x => !x.isDeleted).length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
  }

  undoRemove(container: BlogContent) {
    this.blogContents.map((blc) => {
      blc.isDeleted = blc.id == container.id ? false : blc.isDeleted;
    });
    this.sortContent();
    this.isDisabled = this.blogContents.length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
  }

  save(isDraft: boolean) {

    if ((this.viewContentInfo || this.blogContents.filter(x => !x.isDeleted).length === 0) && this.blogForm.valid) {
      this.toasterService.alert('danger', 'please save blog content first.');
      return;
    }
    else if ((this.coverImageUrl === null || this.coverImageUrl == '') && this.blogForm.valid) {
      this.toasterService.alert('danger', 'please add cover image.');
      return;
    } else if (!this.blogForm.valid) {
      this.toasterService.alert('danger', 'please fill up required fields.');
      return;
    }


    if (this.blogForm.valid) {
      this.blog = this.blogForm.getRawValue();
      this.blog.isDraft = isDraft;
      this.blog.tags = this.designTags;
      this.blog.endDate = this.blog.allDay ? this.blog.endDate : null;
      this.blog.blogContents = this.blogContents;
      this.blog.titleUrl = Utils.encodeBlogUrl(this.blog.title);
      
      this.blogService.editBlog(this.blog, this.coverImageBlob, this.imageBlobs, this.removedTags).then((blog: any) => {

        if (this.removedImageUrls.length > 0) {
          this.blogService.deleteBlogImages(this.removedImageUrls).then(() => {
            if (!Utils.isNullOrUndefined(blog)) {
              this.toasterService.alert('success', 'updating blog');
              this.navigationService.toAdminBlog();
            } else {
              this.toasterService.alert('danger', 'updating blog');
            }
          });
        } else {
          if (!Utils.isNullOrUndefined(blog)) {
            this.toasterService.alert('success', 'updating blog');
            this.navigationService.toAdminBlog();
          } else {
            this.toasterService.alert('danger', 'updating blog');
          }
        }
      });
    }
  }

  sortContent() {

    var imageBlob = [];
    var deleteCount = 0;

    this.blogContents.map((blg: any) => {
      let newSortId = this.blogContents.findIndex((data) => data.id === blg.id) + 1;
      deleteCount = blg.isDeleted ? deleteCount + 1 : deleteCount;

      this.imageBlobs.filter(x => x.key == blg.sortId).map((img: any) => {
        imageBlob.push({
          file: img.file,
          imageUrl: img.imageUrl,
          isDefaultImage: null,
          key: !blg.isDeleted ? (newSortId > deleteCount && deleteCount > 0 ? newSortId - 1 : newSortId) : this.blogContents.length
        });

      });

      blg.sortId = !blg.isDeleted ? (newSortId > deleteCount && deleteCount > 0 ? newSortId - 1 : newSortId) : this.blogContents.length;

    });

    this.blogContents = this.blogContents.sort((a, b) => a.sortId < b.sortId ? -1 : a.sortId > b.sortId ? 1 : 0);
    this.imageBlobs = imageBlob;
    this.imageBlobs = this.imageBlobs.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  }

  getTopSuggestedTags() {
    this.topSuggestedTags = [];
    if (Utils.isStringNullOrEmpty(this.tagNameQuery)) {
      return;
    }
    this.blogService.getTopTags(this.tagNameQuery).then((tags: any) => {
      this.topSuggestedTags = tags;
    });
  }


  addTag() {
    if (this.designTags.filter(x => x.name === this.tagNameQuery).length <= 0) {
      var designTags = new Tag();
      designTags.id = 0;
      designTags.name = this.tagNameQuery;
      this.designTags.push(designTags)
      this.removedTags.filter(x => x.name === this.tagNameQuery)
        .map((x, i) => {
          this.removedTags.splice(i, 1);
        });
      this.tagNameQuery = '';
    }
  }

  removeTag(tag: Tag) {
    if (!Utils.isNullOrUndefined(this.designTags)) {
      this.designTags.splice(this.designTags.indexOf(tag), 1);
      this.removedTags.push(tag);
    }
  }

  addSuggestedTag(tag: Tag) {
    this.designTags.push(tag)
  }

  previewBlog() {

    this.blog = this.blogForm.getRawValue();
    let contentImages = new Array<FileMapper>();
    console.log(this.blog);
    this.blog.blogContents = this.blogContents.filter(x => !x.isDeleted);
    if (this.imageBlobs.filter(x => x.file != null).length > 0) {
      this.blogService.addPreviewImages(this.blogContents, this.imageBlobs.filter(x => x.file != null)).then((images: any) => {
        images.map((img) => {
          contentImages.push(img);
        });

        contentImages.map((imgs) => {
          imgs.fileName = this.blogFolderPath + imgs.fileName;
        })

        console.log(contentImages);
        this.blog.blogContents.map((content) => {
          content.contentImages = new Array<FileMapper>();
          if (Number(content.typeId) === 2) {
            contentImages.filter(x => x.key === content.sortId).map((ct) => {
              content.contentImages.push(ct);
            })
          }
        })
      });
    }


  }

  // getEmbeddedUrl(videoLink: string) {
  //   var embedUrl;
  //   embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(videoLink));

  //   return embedUrl;
  // }
}
