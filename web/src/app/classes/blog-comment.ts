export class BlogComment {
    id: number;
    userId: number;
    userName: string;
    blogId: number;
    commentContent: string;
    parentId: number;
    commentId: number;
    fromUserId: number;
    dateTime: Date;
    groupId: number;

    constructor() {
        this.groupId = 0;
    }
}
