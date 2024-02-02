import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileService } from './file.service';
import { Utils } from '../app.utils';
import { Blog } from '../classes/blog';
import { ImageViewer } from '../classes/image-viewer';
import { FileMapper } from '../classes/file-mapper';
import { FilterSetting } from '../classes/filter-settings';
import { Tag } from '../classes/tag';
import { BlogComment } from '../classes/blog-comment';
import { BlogContent } from '../classes/blog-content';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  api: string;
  fileLanding: string;

  constructor(private http: HttpClient,
    private fileService: FileService) {
    this.api = '/blog';
    this.fileLanding = Utils.FILE_LANDING.blog;
  }

  getBlogsListRange(filter: FilterSetting) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getblogslistrange`, filter)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getBlogsListRangeDate(filter: FilterSetting) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getblogslistrangedate`, filter)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  addBlog(blog: Blog, coverImageFile: ImageViewer, blobRecords: ImageViewer[] = null) {
    const contentImage = new Array<FileMapper>();
    return new Promise((resolve, reject) => {

      if (!Utils.isNullOrUndefined(coverImageFile.file)) {
        this.fileService.upload(coverImageFile.file, this.fileLanding).then((coverimg: FileMapper) => {
          blog.coverFileName = coverimg.fileName;
          blog.coverId = coverimg.id;

          if (blobRecords.length > 0) {
            let index = 1;
            for (const record of blobRecords) {
              this.fileService.upload(record.file, this.fileLanding).then((img: FileMapper) => {
                img.key = record.key; // sortId
                contentImage.push(img);

                if (index == blobRecords.length) {
                  this.createBlog(blog).then((blog: Blog) => {

                    contentImage.map((blogImage) => {
                      blogImage.key = blog.blogContents.filter(x => x.sortId == blogImage.key)[0].id; // contentid
                    });

                    this.createBlogContentImages(contentImage).then((blog) => resolve(blog), error => reject(error));
                  });

                }

                index++;
              }, error => reject(error));
            }
          } else {

            this.createBlog(blog).then(blog => resolve(blog), error => reject(error));

          }

        });

      }
    });
  }

  editBlog(blog: Blog, coverImageFile: ImageViewer, blobRecords: ImageViewer[] = null, removedTags: Tag[]) {
    const contentImage = new Array<FileMapper>();
    removedTags = removedTags.filter(x => x.id > 0);
    let imageBlobs = blobRecords.filter(x => x.file != null);
    return new Promise((resolve, reject) => {
      if (!Utils.isNullOrUndefined(coverImageFile.file)) {
        this.fileService.upload(coverImageFile.file, this.fileLanding).then((coverimg: FileMapper) => {
          blog.coverFileName = coverimg.fileName;
          blog.coverId = coverimg.id;

          if (imageBlobs.length > 0) {
            let index = 1;
            for (const record of imageBlobs) {
              this.fileService.upload(record.file, this.fileLanding).then((img: FileMapper) => {
                img.key = record.key; // sortId
                contentImage.push(img);
                if (index == imageBlobs.length) {
                  this.updateBlog(blog).then((blog: Blog) => {

                    contentImage.map((blogImage) => {
                      blogImage.key = blog.blogContents.filter(x => x.sortId == blogImage.key)[0].id; // contentid
                    });

                    if (removedTags.length > 0) {
                      this.deleteBlogTags(removedTags);
                    }
                    this.createBlogContentImages(contentImage).then((blog) => resolve(blog), error => reject(error));
                  });
                }
                index++;
              }, error => reject(error));
            }
          }
          else {
            this.updateBlog(blog).then(blog => resolve(blog), error => reject(error));

          }

        });

      } else {

        if (imageBlobs.length > 0) {
          let index = 1;
          for (const record of imageBlobs) {
            this.fileService.upload(record.file, this.fileLanding).then((img: FileMapper) => {
              img.key = record.key; // sortId
              contentImage.push(img);

              if (index == imageBlobs.length) {
                this.updateBlog(blog).then((blog: Blog) => {

                  contentImage.map((blogImage) => {
                    blogImage.key = blog.blogContents.filter(x => x.sortId == blogImage.key)[0].id; // contentid
                  });

                  if (removedTags.length > 0) {
                    this.deleteBlogTags(removedTags);
                  }

                  this.createBlogContentImages(contentImage).then((blog) => resolve(blog), error => reject(error));

                });
              }
              index++;
            }, error => reject(error));
          }
        } else {
          if (removedTags.length > 0) {
            this.deleteBlogTags(removedTags);
          }
          this.updateBlog(blog).then(blog => resolve(blog), error => reject(error));
        }
      }
    });
  }

  createBlog(blog: Blog) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createblog`, blog)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  createBlogContentImages(blobRecords: FileMapper[] = null) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createblogimages`, blobRecords)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getBlogById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getblogbyid/${id}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getBlogByTitle(title: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getblogbytitle/${title}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updateBlog(blog: Blog) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updateblog`, blog)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  deleteBlogImages(imgUrls: any) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteblogimages`, imgUrls)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteBlogById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteblogbyid`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }
  getTrendingBlogContent() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/gettrendingblogcontent`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getMostBlogContent() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getmostblogcontent`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getPopularContent() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getpopularcontent`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteBlogTags(tags: Tag[]) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteblogtags`, tags)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getTopTags(tag) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/gettoptags/${tag}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createBlogComment(blogComment: BlogComment) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createblogcomment`, blogComment)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getBlogCommentsById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getblogcommentsbyid/${id}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }
  deleteBlogCommentById(blogComment: BlogComment) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteblogcommentbyid`, blogComment)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  addPreviewImages(blogContents: Array<BlogContent>, blobRecords: ImageViewer[] = null) {
    return new Promise((resolve, reject) => {
      if (blobRecords.length > 0) {
        try {
          const contentImages = new Array<FileMapper>();
          let imageBlobs = blobRecords.filter(x => x.file != null);
          let index = 1;
          for (const record of imageBlobs) {
            this.fileService.upload(record.file, this.fileLanding).then((img: FileMapper) => {
              img.key = record.key; // sortId
              contentImages.push(img);

              if (index == blobRecords.length) {
                // contentImages.map((blogImage) => {
                //   blogImage.key = blogContents.filter(x => x.sortId == blogImage.key)[0].id; // contentid
                // });
                resolve(contentImages)
              }

              index++;
            })
          }
        } catch (e) {
          reject(e)
        }
      }
    })

  }
}
