import { Component, OnInit } from '@angular/core';
import { Blog } from 'src/app/classes/blog';
import { environment } from 'src/environments/environment';
import { BlogService } from 'src/app/services/blog.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-blog-trending',
  templateUrl: './blog-trending.component.html',
  styleUrls: ['./blog-trending.component.scss']
})
export class BlogTrendingComponent implements OnInit {

  trending: Array<Blog>;
  blogFolderPath: string;
  currentDate: Date;

  constructor(public blogService: BlogService, private navigationService: NavigationService,
    private dataService: DataService) {
    this.trending = new Array();
    this.blogFolderPath = environment.blogFolderPath;
    this.currentDate = new Date();
  }

  ngOnInit() {

    this.blogService.getTrendingBlogContent().then((result: any) => {
      this.trending = result;
      this.trending.map((content) => {
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
