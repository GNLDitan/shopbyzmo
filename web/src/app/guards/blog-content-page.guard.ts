

import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { DataService } from '../services/data.service';
import { BlogService } from '../services/blog.service';
import { Blog } from '../classes/blog';
import { Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { FacebookScraperService } from '../services/facebookScraper.service';


@Injectable({
    providedIn: 'root'
})
export class BlogContentPageGuard implements CanActivate {

    constructor(private dataService: DataService,
        private blogService: BlogService,
        private metaTagService: Meta,
        @Inject(DOCUMENT) public document,
        private facebookScarper: FacebookScraperService) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const param: any = next.params.id;

        return this.blogService.getBlogById(param).then((blog: Blog) => {
            if (blog != null) {
                this.dataService.setBlog(blog);
                let len = 0;
                let desc = blog.blogContents.filter(x => x.typeId === 1).length > 0 ? blog.blogContents.filter(x => x.typeId === 1)[0].description : '';
                let coverFileName = environment.blogFolderPath + blog.coverFileName;
                let div = this.document.createElement('div');
                div.innerHTML = desc;
                if (div.innerText != null) {
                    len = div.innerText.length;
                    desc = div.innerText.substr(0, 250) + (len > 250 ? '...' : '');
                }


                let title = blog.title.replace(/[^a-zA-Z ]/g, "");
                title = title.replace(/\s+/g, '-');
                this.metaTagService.updateTag(
                    { property: 'og:url', content: environment.webUrl + state.url }
                );
                this.metaTagService.updateTag(
                    { property: 'og:title', content: blog.title }
                );
                this.metaTagService.updateTag(
                    { property: 'og:image', content: coverFileName }
                );

                this.facebookScarper.scraper(environment.webUrl + state.url);
                return true;
            } else return false;
        });
    }
}