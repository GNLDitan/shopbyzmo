import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { Blog } from 'src/app/classes/blog';
import { BlogContent } from 'src/app/classes/blog-content';
import { environment } from 'src/environments/environment';
import { BlogService } from 'src/app/services/blog.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { DataService } from 'src/app/services/data.service';
import { Comment } from 'less-offset-comments';
import { CommentService } from 'src/app/services/comment.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { Utils } from 'src/app/app.utils';
import { DComment, RootComment } from 'src/app/classes/d-comment';
import { Subscription } from 'rxjs';
import { BlogComment } from 'src/app/classes/blog-comment';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { EmbedVideoService } from 'src/app/services/embed-video.service';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomService } from 'src/app/services/dom-service';
import { MetaTagService } from 'src/app/services/meta-tag.service';

@Component({
  selector: 'app-blog-content-page',
  templateUrl: './blog-content-page.component.html',
  styleUrls: ['./blog-content-page.component.scss']
})
export class BlogContentPageComponent implements OnInit, OnDestroy {

  blog: Blog;
  contents: Array<BlogContent>;
  currentDate: Date;
  blogFolderPath: string;
  filter: FilterSetting;
  selectedBlog: Subscription;
  rootComment = new RootComment;
  comments: Comment[] = [];
  blogCommentForm: FormGroup;
  user: User;
  count: number;
  blogComment: BlogComment;
  groupId: number;
  selectedImage: string;
  isLoadComment: boolean;
  currentUrl: string;
  constructor(
    public blogService: BlogService, public dataService: DataService,
    private commentService: CommentService, private formBuilder: FormBuilder,
    private userService: UserService, public metaTagService: Meta,
    private sanitizer: DomSanitizer,
    private embedVideoService: EmbedVideoService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document,
    public router: Router,
    private domService: DomService,
    private metaService: MetaTagService) {
    this.blog = new Blog();
    this.contents = new Array();
    this.blogFolderPath = environment.blogFolderPath;
    this.filter = new FilterSetting();

    this.user = new User();
    this.comments = new Array();
    this.blogComment = new BlogComment();
    this.blogCommentForm = this.formBuilder.group({
      userId: [1],
      commentContent: ['']
    });
    this.groupId = 0;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkUser();
      this.subscribeUser();
      this.currentDate = new Date();

      this.currentUrl = window.location.href;
      this.selectedBlog = this.dataService.selectedBlog$.subscribe((blog: Blog) => {
        if (blog.hasOwnProperty('id')) {
          this.blog = blog;
          this.blog.coverFileName = this.blogFolderPath + blog.coverFileName;
          this.blog.blogContents.filter(x => (x.typeId === 2 || x.typeId === 3)).map((content) => {
            content.contentImages.map((cimage) => {
              cimage.fileName = this.blogFolderPath + cimage.fileName;
            });

            if (content.typeId === 3) {
              content.embeddedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(content.videoLink));
            }
          });

          let blogDescription = "";

          if (this.blog.blogContents.length > 0) {
            blogDescription = this.blog.blogContents[0].description.replace(/(<([^>]+)>|&nbsp;)/gi, "");
          }

          this.domService.setH1Body(`Shop Byzmo ${this.blog.title}`);
          this.domService.setCanonicalURL(`${environment.webUrl}/blog/content/${this.blog.id}/${this.blog.title}`);

          this.metaService.setTitle(`${this.blog.title} - Shop Byzmo`)
          this.metaService.setSocialMediaTags(`${environment.webUrl}/blog/content/${this.blog.id}/${this.blog.title}`,
            `${this.blog.title} - Shop Byzmo`,
            blogDescription,
            this.blog.coverFileName);

          this.loadComments();
        }
      });

      this.router.events.subscribe((val: any) => {
        if (val.hasOwnProperty('state')) {
          this.isLoadComment = false;
        }
      });
    }
  }



  checkUser() {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        this.dataService.setUser(success);
      }, (error) => {
        console.log(error.error);
      });
    }

  }

  subscribeUser() {
    this.dataService.user$.subscribe(next => {
      this.user = next;
    });
  }

  ngOnDestroy() {
    if (this.selectedBlog) {
      this.selectedBlog.unsubscribe();
      this.dataService.clearBlog();

    }
  }

  onSubmit() {

    this.rootComment = this.blogCommentForm.getRawValue();
    this.rootComment.commentId = 1;
    const uname = this.user.id > 0 ? this.user.name : 'Guest';

    const comment = new DComment(this.rootComment.userId, uname, this.blog.id, this.rootComment.commentContent, 0, this.rootComment.commentId, this.groupId + 1);
    comment.blogId = this.blog.id;
    this.blogComment.blogId = this.blog.id;
    this.blogComment.commentContent = comment.commentContent;
    this.blogComment.commentId = comment.commentId;
    this.blogComment.userId = comment.userId;
    this.blogComment.parentId = comment.parentId;
    this.blogComment.fromUserId = this.user.id;
    this.blogComment.groupId = comment.groupId;
    this.blogService.createBlogComment(this.blogComment).then((blogComment: any) => {
      if (!Utils.isNullOrUndefined(blogComment)) {

        this.comments.unshift(comment);
        comment.userId = this.rootComment.userId;
        this.blogCommentForm.controls.commentContent.setValue('');
        this.comments = new Array();
        this.blogService.getBlogCommentsById(blogComment.blogId).then((result: any) => {

          // tslint:disable-next-line: only-arrow-functions
          this.groupId = (result.sort(function (a, b) {
            // tslint:disable-next-line: radix
            return parseInt(b.groupId) - parseInt(a.groupId);
          }))[0].groupId;
          this.comments = this.commentService.getComments(result);
        });
      }
    });

  }

  updateComments($event: any) {
    if ($event != null) {
      this.comments.map((comm) => {
        if (comm.id === $event.id) {
          comm.viewReply = $event.viewReply;
        } else {
          comm.viewReply = false;
        }

        comm.children.map((ch) => {
          ch.viewReply = false;
        });
      });
    }
  }



  openModal(imageUrl: string) {
    this.selectedImage = imageUrl;
    this.document.body.classList.add('goofy');
  }

  closeModal() {
    this.selectedImage = null;
    this.document.body.classList.remove('goofy');
  }

  getEmbeddedUrl(videoLink: string) {
    let embedUrl;
    embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.embedVideoService.embedVideo(videoLink));

    return embedUrl;
  }

  loadComments() {
    this.isLoadComment = true;
    this.blogService.getBlogCommentsById(this.blog.id).then((result: any) => {
      if (result.length > 0) {
        this.groupId = (result.sort(function (a, b) {
          return parseInt(b.groupId) - parseInt(a.groupId);
        }))[0].groupId;
        this.comments = this.commentService.getComments(result);
      }
    });
  }
}
