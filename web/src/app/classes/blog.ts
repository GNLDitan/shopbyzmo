import { BlogContent } from './blog-content';
import { Tag } from './tag';

export class Blog {
    id: number;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    coverId: number;
    coverFileName: string;
    isactive: boolean;
    blogContents: Array<BlogContent>;
    tags: Tag[];
    isDraft: boolean;
    displayDescription: string;
    titleUrl: string;
    constructor() {
        this.blogContents = new Array<BlogContent>();
        this.tags = new Array<Tag>();
    }

}