import { DefaultCommentFromDb, DefaultComment } from 'comments-to-tree';
import { Comment } from 'less-offset-comments';
import { now } from 'moment';

export class RootComment {
    userId: number = 1;
    userName: string;
    commentContent: string;
    blogId: number;
    commentId: number;
}

export class DComment {
    wantDel: boolean;
    viewReply: boolean;
    constructor(public userId: number,
        public userName: string,
        public blogId: number,
        public commentContent: string,
        public parentId: number,
        public commentId: number,
        public groupId: number = 0,
        public parent: DComment = null,
        public children: DComment[] = [],
        public fromUserId: number = 0,
        public dateTime: Date = new Date(),
        public id: number = 0) {

    }
}

export interface CommentFromDb extends DefaultCommentFromDb {
    userId: number;
    blogId: number;
    commentContent: string;
    userName: string;
    fromUserId: number;
    dateTime: Date;
    groupId: number;
    id: number;
}

export interface CommentTree extends DefaultComment, Comment {
    blogId: number;
    commentContent: string;
    userName: string;
    fromUserId: number;
    dateTime: Date;
    groupId: number;
    id: number;
}
