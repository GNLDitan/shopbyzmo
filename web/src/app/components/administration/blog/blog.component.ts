import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Blog } from 'src/app/classes/blog';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { BlogService } from 'src/app/services/blog.service';
import { environment } from 'src/environments/environment';
import { NavigationService } from 'src/app/services/navigation.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SitemapService } from 'src/app/services/sitemap.service';
import { Sitemap } from 'src/app/classes/sitemap';
import { Frequency } from 'src/app/enums/frequency.enum';
import { SitemapProc } from 'src/app/enums/sitemap-proc.enum';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  public blogs: Array<Blog>;
  filter: FilterSetting;
  blogImageFolderPath: any;
  config: any;

  constructor(
    private blogService: BlogService,
    private navigationService: NavigationService,
    private confirmationService: ConfirmationService,
    private SpinnerService: NgxSpinnerService,
    private toasterService: ToasterService,
    private _http: HttpClient,
    private sitemapService: SitemapService) {
    this.blogs = new Array();
    this.filter = new FilterSetting();

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.blogs.length
    };
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  ngOnInit() {
    this.blogImageFolderPath = environment.blogFolderPath;
    this.getBlogs();
  }

  getBlogs() {
    this.filter.limit = 9999999;
    this.SpinnerService.show();
    this.blogService.getBlogsListRange(this.filter).then((blogs: any) => {
      this.blogs = blogs;
      this.SpinnerService.hide();
    });
    console.log(this.blogs.length);
  }

  getFullPath(filename: any): string {
    return this.blogImageFolderPath + filename;
  }

  deleteBlog(blog: Blog) {
    const dialogQuestion = 'Are you sure to delete this blog?';
    const dialogMessage = 'Selected blog will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      blog.title, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.blogService.deleteBlogById(blog.id).then((success: any) => {
          if (success) {
            const index = this.blogs.findIndex(x => x.id === blog.id);
            this.blogs.splice(index, 1);
            this.config = {
              itemsPerPage: 10,
              currentPage: 1,
              totalItems: this.blogs.length
            };

            // For dynamic sitemap (s)
            const sMap = new Sitemap();
            sMap.loc.push(`${environment.webUrl}/blog/content/${blog.id}/${blog.titleUrl}`);
            sMap.lastmod.push(new Date().toISOString().split('T')[0]);
            sMap.changefreq.push(Frequency.daily);
            sMap.priority.push('0.9');

            this.sitemapService.sitemapHandler(sMap, SitemapProc.remove);
            // For dynamic sitemap (e)

            this.toasterService.alert('success', 'deleting blog');
          }
        });
      }
    }).catch(() => { });
  }
}
