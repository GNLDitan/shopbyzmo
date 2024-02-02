import { SitemapProc } from "../enums/sitemap-proc.enum";

export class Sitemap {
    loc: Array<string>;
    lastmod: Array<string>;
    changefreq: Array<string>;
    priority: Array<string>;

    constructor() {
        this.loc = new Array<string>();
        this.lastmod = new Array<string>();
        this.changefreq = new Array<string>();
        this.priority = new Array<string>();
    }
}