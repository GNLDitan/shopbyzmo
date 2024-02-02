import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Blog } from 'src/app/classes/blog';
import { BlogService } from 'src/app/services/blog.service';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-blog-popular-post',
  templateUrl: './blog-popular-post.component.html',
  styleUrls: ['./blog-popular-post.component.scss']
})
export class BlogPopularPostComponent implements OnInit {


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
    this.blogService.getPopularContent().then((result: any) => {
      this.mostPopular = result;
      this.mostPopular.map((content) => {
        content.coverFileName = this.blogFolderPath + content.coverFileName;
      });
    })
  }

  /* Removed for SEO crawl
  goToContent(blogs: any) {
    this.navigationService.toBlogContent(blogs);
  }
  */
}
