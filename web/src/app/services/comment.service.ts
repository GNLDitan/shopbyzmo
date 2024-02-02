import { Injectable } from '@angular/core';
import { Comment } from 'less-offset-comments';
import { DefaultComment, DefaultCommentsToTree } from 'comments-to-tree';
import { CommentFromDb, CommentTree, DComment } from '../classes/d-comment';
import { BlogService } from './blog.service';
import { BlogComment } from '../classes/blog-comment';


export class CommentsToTree extends DefaultCommentsToTree {
  protected static transform(allCommentsFromDb: CommentFromDb[]): CommentTree[] {
    return allCommentsFromDb.map(commentFromDb => {
      return {
        commentId: commentFromDb.commentId,
        userId: commentFromDb.userId,
        parentId: commentFromDb.parentId || 0,
        children: [],
        commentContent: commentFromDb.commentContent,
        blogId: commentFromDb.blogId,
        userName: commentFromDb.userName,
        fromUserId: commentFromDb.fromUserId,
        dateTime: commentFromDb.dateTime,
        groupId: commentFromDb.groupId,
        id: commentFromDb.id
      }
    });
  }
}

@Injectable()
export class CommentService {
  commentsFromDb: CommentFromDb[] = [];

  constructor(private blogService: BlogService) {
    this.commentsFromDb = new Array();
  }

  getComments(blogComments: Array<BlogComment>) {
    this.commentsFromDb = new Array();
    blogComments.map((comment) => {
      var comments: CommentFromDb = {
        userId: comment.userId,
        parentId: comment.parentId,
        commentId: comment.commentId,
        blogId: comment.blogId,
        commentContent: comment.commentContent,
        userName: comment.fromUserId > 0 ? comment.userName : 'Guest',
        fromUserId: comment.fromUserId,
        dateTime: comment.dateTime,
        groupId: comment.groupId,
        id: comment.id
      };
      this.commentsFromDb.push(comments);
    });

    this.commentsFromDb.reverse();

    return CommentsToTree.getTree<CommentFromDb, CommentTree>(this.commentsFromDb);
  }
  // getComments(blogId: number) {
  //   this.commentsFromDb = new Array();

  //   return new Promise((resolve, reject) => {
  //     this.blogService.getBlogCommentsById(blogId).then((result: any) => {

  //       result.map((comment) => {
  //         var comments: CommentFromDb = {
  //           userId: comment.userId,
  //           parentId: comment.parentId,
  //           commentId: comment.commentId,
  //           blogId: comment.blogId,
  //           commentContent: comment.commentContent,
  //           userName: comment.fromUserId > 0 ? comment.userName : 'Guest',
  //           fromUserId: comment.fromUserId,
  //           dateTime: comment.dateTime,
  //           groupId: comment.groupId,
  //           id: comment.id
  //         };
  //         this.commentsFromDb.push(comments);
  //       });

  //       if (result == null)
  //         reject()
  //       else if (result.length > 0) {
  //         this.commentsFromDb.reverse();
  //         resolve(CommentsToTree.getTree<CommentFromDb, CommentTree>(this.commentsFromDb));
  //         console.log(CommentsToTree.getTree<CommentFromDb, CommentTree>(this.commentsFromDb));
  //       }

  //     });
  //   });
  // }

}
