import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/services/validator.service';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { Blog } from 'src/app/classes/blog';
import { BlogService } from 'src/app/services/blog.service';
import { BlogContent } from 'src/app/classes/blog-content';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Utils } from 'src/app/app.utils';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Tag } from 'src/app/classes/tag';
import { DatePipe } from '@angular/common';
import { FileMapper } from 'src/app/classes/file-mapper';
import { environment } from 'src/environments/environment';
import { ContentType } from 'src/app/classes/content-type';
import { SitemapService } from 'src/app/services/sitemap.service';
import { Sitemap } from 'src/app/classes/sitemap';
import { Frequency } from 'src/app/enums/frequency.enum';
import { SitemapProc } from 'src/app/enums/sitemap-proc.enum';

@Component({
  selector: 'app-add-blog',
  templateUrl: './add-blog.component.html',
  styleUrls: ['./add-blog.component.scss']
})
export class AddBlogComponent implements OnInit {
  // @ViewChild('quillEditor', { static: false }) quillEditor: any;
  blogForm: FormGroup;
  editorModules = {};
  coverImageUrl: string;
  coverImageBlob: ImageViewer;
  fileLanding: string;
  blog: Blog;
  blogContents: Array<BlogContent>;
  imageBlobs: ImageViewer[];

  designTags: Tag[];
  removedTags: Tag[];
  tagNameQuery: string;
  topSuggestedTags: Tag[];
  newTags: [];
  valuedate = new Date();
  isDisabled: boolean;
  blogFolderPath: string;
  isDraft: boolean;
  public viewContentInfo = false;


  constructor(
    private formBuilder: FormBuilder,
    private validatorService: ValidatorService,
    private dataService: DataService,
    private blogService: BlogService,
    private navigationService: NavigationService,
    private toasterService: ToasterService,
    private datePipe: DatePipe,
    private sitemapService: SitemapService) {

    this.coverImageUrl = '';
    this.coverImageBlob = new ImageViewer();
    this.blog = new Blog();
    this.imageBlobs = [];
    this.blogContents = new Array<BlogContent>();
    this.topSuggestedTags = [];
    this.designTags = [];
    this.removedTags = [];
    this.newTags = [];
    this.tagNameQuery = '';
    this.isDisabled = true;
    this.blogFolderPath = environment.blogFolderPath;
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
      title: ['', Validators.required],
      // description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      allDay: [false],
      isActive: [true]
    });

    this.blogForm.controls.allDay.patchValue(false);
  }

  ngOnInit() {
    this.viewContentInfo = false;
    this.blogForm.controls.startDate.setValue(this.datePipe.transform(this.valuedate, 'MM-dd-yyyy'));
    this.blogForm.controls.endDate.setValue(this.datePipe.transform(this.valuedate, 'MM-dd-yyyy'));
  }

  save(isDraft: boolean) {


    if ((this.viewContentInfo || this.blogContents.length === 0) && this.blogForm.valid) {
      this.toasterService.alert('danger', 'please save blog content first.');
      return;
    } else if ((this.coverImageUrl === null || this.coverImageUrl === '') && this.blogForm.valid) {
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

      this.blogService.addBlog(this.blog, this.coverImageBlob, this.imageBlobs).then((blog: any) => {
        if (!Utils.isNullOrUndefined(blog)) {
          this.toasterService.alert('success', 'saving blog');

          // For dynamic sitemap (s)
          const sMap = new Sitemap();
          sMap.loc.push(`${environment.webUrl}/blog/content/${blog.id}/${blog.titleUrl}`);
          sMap.lastmod.push(new Date().toISOString().split('T')[0]);
          sMap.changefreq.push(Frequency.daily);
          sMap.priority.push('0.9');

          this.sitemapService.sitemapHandler(sMap, SitemapProc.add);
          // For dynamic sitemap (e)


          this.navigationService.toAdminBlog();
        } else {
          this.toasterService.alert('danger', 'saving blog');
        }
      });
    }
  }

  // ngAfterViewInit() {
  //   this.quillEditor.elementRef.nativeElement
  //     .querySelector('.ql-editor').classList
  //     .add('form-control');
  // }

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
      this.isDisabled = this.blogContents.length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
    };
    reader.readAsDataURL(this.coverImageBlob.file);

  }

  contentInfo(content: BlogContent = null) {
    const info = content != null ? content : new BlogContent();
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
      const blogContentData = event.container.data as any;
      const imageBlob = [];


      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      this.blogContents.map((blg: any) => {
        const newSortId = blogContentData.findIndex((data) => data.id === blg.id) + 1;

        this.imageBlobs.filter(x => x.key === blg.sortId).map((img: any) => {
          const a = img;
          imageBlob.push({
            file: img.file,
            imageUrl: img.imageUrl,
            isDefaultImage: null,
            key: newSortId
          });

        });

        blg.sortId = newSortId;

      });

      this.blogContents = this.blogContents.sort((a, b) => a.sortId < b.sortId ? -1 : a.sortId > b.sortId ? 1 : 0);

      this.imageBlobs = imageBlob;

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
      this.isDisabled = this.blogContents.length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
    }
  }

  contentImageHandler($event: any) {
    if ($event != null) {
      for (const item of $event) {
        this.imageBlobs.push(item);
      }
      this.isDisabled = this.blogContents.length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
    }
  }

  removeContainer(container: BlogContent, contentTypeId: number) {
    this.blogContents = this.blogContents.filter(x => x !== container);

    if (contentTypeId === 2) {
      this.imageBlobs = this.imageBlobs.filter(x => x.key !== container.sortId);
    }

    this.blogContents.map((blg: any) => {
      const imageBlob = [];

      const newSortId = this.blogContents.findIndex((data) => data.id === blg.id) + 1;

      this.imageBlobs.filter(x => x.key === blg.sortId).map((img: any) => {
        const a = img;
        imageBlob.push({
          file: img.file,
          imageUrl: img.imageUrl,
          isDefaultImage: null,
          key: newSortId
        });

      });

      blg.sortId = newSortId;


    });

    this.blogContents = this.blogContents.sort((a, b) => a.sortId < b.sortId ? -1 : a.sortId > b.sortId ? 1 : 0);
    this.isDisabled = this.blogContents.length === 0 || Utils.isNullOrUndefined(this.coverImageUrl) ? true : false;
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
      const designTags = new Tag();
      designTags.id = 0;
      designTags.name = this.tagNameQuery;
      this.designTags.push(designTags);
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
    this.designTags.push(tag);
  }

  previewBlog() {

    this.blog = this.blogForm.getRawValue();
    const contentImages = new Array<FileMapper>();
    this.blog.blogContents = this.blogContents.filter(x => !x.isDeleted);
    if (this.imageBlobs.length > 0) {
      this.blogService.addPreviewImages(this.blogContents, this.imageBlobs).then((images: any) => {

        images.map((img) => {
          contentImages.push(img);
        });

        contentImages.map((imgs) => {
          imgs.fileName = this.blogFolderPath + imgs.fileName;
        });

        console.log(contentImages);
        this.blog.blogContents.map((content) => {
          content.contentImages = new Array<FileMapper>();
          if (Number(content.typeId) === 2) {
            contentImages.filter(x => x.key === content.sortId).map((ct) => {
              content.contentImages.push(ct);
            });
          }
        });
      });
    }

  }

  // getEmbeddedUrl(videoLink: string) {
  //   var embedUrl;
  //   embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(videoLink));

  //   return embedUrl;
  // }

}


