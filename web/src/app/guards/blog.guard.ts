import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { BlogService } from '../services/blog.service';
import { Blog } from '../classes/blog';

@Injectable({
  providedIn: 'root'
})
export class BlogGuard implements CanActivate {

  constructor(private dataService: DataService,
    private blogService: BlogService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const param: any = next.params.id;
    this.blogService.getBlogById(param).then((blog: Blog) => {
      if (blog != null) {
        this.dataService.setBlog(blog);
      } else return false;
    });
    return true;
  }

}
