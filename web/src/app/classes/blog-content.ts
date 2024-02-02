import { FileMapper } from './file-mapper';

export class BlogContent {
    id: number;
    blogId: number;
    headerText: string;
    description: string;
    contentImages: Array<FileMapper>;
    typeId: number;
    type: string;
    sortId: number;
    isDeleted: boolean;
    isNew: boolean;
    videoLink: string;
    embeddedUrl: any;
    constructor() {
        this.contentImages = new Array<FileMapper>();
        this.videoLink = '';
    }
}
