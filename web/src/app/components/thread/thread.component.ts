import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LessOffsetComments } from 'less-offset-comments';
import { DComment } from 'src/app/classes/d-comment';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BlogService } from 'src/app/services/blog.service';
import { Utils } from 'src/app/app.utils';
import { BlogComment } from 'src/app/classes/blog-comment';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'cst-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit {

  @Input() comments: DComment[];
  @Output() newcomment = new EventEmitter<DComment>();
  replyCommentForm: FormGroup;
  blogComment: BlogComment;
  count: number;
  user: User;
  userId: number;
  replyId: number;
  parentId: number;

  constructor(private formBuilder: FormBuilder,
    private blogService: BlogService,
    private userService: UserService,
    private dataService: DataService) {
    this.replyCommentForm = this.formBuilder.group({
      commentContent: ['']
    });

    this.blogComment = new BlogComment();
    this.user = new User();
    this.count = 1;
    this.userId = 0;
    this.parentId = 0;
  }

  ngOnInit() {
    this.checkUser();
    this.subscribeUser();

    if (this.comments.length > 0) {
      this.comments.forEach(comment => LessOffsetComments.updateOffset(comment));
    }

  }

  viewReply(comment: DComment) {
    comment.viewReply = true;
    this.newcomment.emit(comment);
  }

  updateComments($event: any) {
    if ($event != null) {
      this.comments.map((comm) => {
        comm.viewReply = false;
        comm.children.map((ch) => {
          if (ch.id === $event.id) {
            ch.viewReply = $event.viewReply
          } else {
            ch.viewReply = false;
          }
        })

      });
    }
  }

  ngOnDestroy() {
    this.newcomment.unsubscribe();
  }

  checkUser() {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        this.dataService.setUser(success);
      }, (error) => {
        this.dataService.setUser(new User());
        console.log(error.error);
      });
    }
  }

  subscribeUser() {
    this.dataService.user$.subscribe(next => {
      if (!Utils.isNullOrUndefined(next)) {
        this.user = next;
        this.userId = !Utils.isNullOrUndefined(this.user.id) ? this.user.id : 0;
      }
    })
  }

  onSubmit(parent: DComment) {
    let reply = this.replyCommentForm.getRawValue();
    let uname = this.user.id > 0 ? this.user.name : 'Guest';
    const child = new DComment(parent.userId + 1, uname, parent.blogId, reply.commentContent, parent.parentId + 1, parent.parentId + 2, parent.groupId, parent);

    this.userId = !Utils.isNullOrUndefined(this.user.id) ? this.user.id : 0;
    this.blogComment.blogId = parent.blogId;
    this.blogComment.commentContent = child.commentContent;
    this.blogComment.commentId = child.commentId
    this.blogComment.userId = child.userId;
    this.blogComment.parentId = child.parentId;
    this.blogComment.fromUserId = this.user.id;
    this.blogComment.groupId = parent.groupId;
    child.viewReply = false;
    child.fromUserId = !Utils.isNullOrUndefined(this.user.id) ? this.user.id : 0;
    this.blogService.createBlogComment(this.blogComment).then((blogComment: any) => {
      if (!Utils.isNullOrUndefined(blogComment)) {
        LessOffsetComments.unshiftComment(parent, child);
        this.replyCommentForm.controls.commentContent.setValue('');
      }
    });
    this.newcomment.emit(child);
  }

  onDelete(comment: DComment, index: number) {
    this.blogComment.id = comment.id;
    this.blogComment.groupId = comment.groupId;
    this.blogComment.blogId = comment.blogId;
    this.blogService.deleteBlogCommentById(this.blogComment).then((success: any) => {
      if (!Utils.isNullOrUndefined(success)) {
        LessOffsetComments.deleteComment(this.comments, comment, index);
      }
    });
  }

}
