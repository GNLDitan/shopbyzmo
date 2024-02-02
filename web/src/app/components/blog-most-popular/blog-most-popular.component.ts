import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Blog } from 'src/app/classes/blog';
import { environment } from 'src/environments/environment';
import { NavigationService } from 'src/app/services/navigation.service';
import { BlogService } from 'src/app/services/blog.service';
import { DataService } from 'src/app/services/data.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-blog-most-popular',
  templateUrl: './blog-most-popular.component.html',
  styleUrls: ['./blog-most-popular.component.scss']
})
export class BlogMostPopularComponent implements OnInit {

  mostPopular: Array<Blog>;
  blogFolderPath: string;
  currentDate: Date;

  constructor(private navigationService: NavigationService,
    public blogService: BlogService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataService: DataService) {
    this.mostPopular = new Array();
    this.blogFolderPath = environment.blogFolderPath;
    this.currentDate = new Date();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getMostPopular();
    }
  }


  getMostPopular() {
    this.blogService.getMostBlogContent().then((result: any) => {
      this.mostPopular = result;
      this.mostPopular.map((content) => {
        content.coverFileName = this.blogFolderPath + content.coverFileName;
      });
    })
  }

  /* Removed for SEO crawl
  goToContent(blogs: any) {
    this.navigationService.toBlogContent(blogs);
    //this.dataService.setBlog(blogs);
  }
  */
}
