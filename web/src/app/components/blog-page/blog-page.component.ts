import { Component, OnInit, ViewChild, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Blog } from 'src/app/classes/blog';
import { environment } from 'src/environments/environment';

import * as AOS from 'aos';
import { NavigationService } from 'src/app/services/navigation.service';
import { BlogService } from 'src/app/services/blog.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.scss']
})
export class BlogPageComponent implements OnInit {

  blogs: Array<Blog>;
  blogFolderPath: string;
  currentDate: Date;
  filter: FilterSetting;
  lastScrollTop: number;
  inputSearchProduct: string;
  dataOffset = new BehaviorSubject(new FilterSetting());
  showNoResults: boolean;
  constructor(
    public navigationService: NavigationService,
    public metaService: MetaTagService,
    private domService: DomService,
    public blogService: BlogService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document) {
    this.blogs = new Array();
    this.blogFolderPath = environment.blogFolderPath;
    this.currentDate = new Date();
    this.filter = new FilterSetting();



    if (isPlatformBrowser(this.platformId)) {

      this.setInfiniteScroll();
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const footer = this.document.getElementsByClassName('footer-container')[0] as any;
      const st = window.pageYOffset || this.document.documentElement.scrollTop;
      // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
      if (st > this.lastScrollTop) {
        if ((window.innerHeight + window.pageYOffset + (footer.offsetHeight / 2)) >= this.document.body.offsetHeight) {
          this.filter.offset = this.blogs.length + this.filter.offset + 1;
          this.dataOffset.next(this.filter);
        }
      }
      this.lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setH1Body('Shop Byzmo Blogs');
      this.domService.setCanonicalURL(`${environment.webUrl}/blog`);

      this.metaService.setTitle('Blog - Shop Byzmo')
      this.metaService.setSocialMediaTags(`${environment.webUrl}/blog`,
        'Blog - Shop Byzmo',
        'Be updated in our latest release of our integrity toys and fashionable dolls!',
        `${environment.webUrl}/assets/img/byzmo_header.png`);

      AOS.init();
    }
  }

  /* Removed for SEO crawl
  goToContent(blogs: any) {
    this.navigationService.toBlogContent(blogs);
  }
  */

  setInfiniteScroll() {
    const a = this.dataOffset.subscribe((filter: any) => {
      this.getBlog(filter);
    });
  }

  getBlog(filter: any) {
    this.blogService.getBlogsListRangeDate(filter).then((blogs: any) => {

      blogs.map((blog) => {
        const desc = blog.blogContents.filter(x => x.typeId === 1).length > 0
          ? blog.blogContents.filter(x => x.typeId === 1)[0].description : '';
        const div = this.document.createElement('div');
        let len = 0;
        div.innerHTML = desc;
        len = div.innerText.length;
        blog.displayDescription = div.innerText;
        // blog.displayDescription = div.innerText.substr(0, 250) + (len > 250 ? '...' : '');
        blog.coverFileName = this.blogFolderPath + blog.coverFileName;
      });
      this.blogs = this.blogs.concat(blogs);
      this.showNoResults = this.blogs.length === 0;
    });
  }

  setFilter() {
    this.blogs = new Array();
    this.filter = new FilterSetting();
    this.filter.blogName = this.inputSearchProduct;
    this.dataOffset.next(this.filter);
  }


}
