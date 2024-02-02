import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { UserService } from './services/user.service';
import { Utils } from './app.utils';

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  requestUrl: string;
  constructor(private userService: UserService) {

    this.requestUrl = environment.serverUrl;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.get("skip")) {
      return next.handle(req);
    }

    const guestToken = localStorage.getItem('guesttoken');
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders();
    if (!req.url.includes('http') && (token != null || guestToken != null)) {
      if (Utils.isStringNullOrEmpty(guestToken))
        headers = headers.set('Authorization', 'Bearer ' + token);
      else headers = headers.set('Authorization', 'Bearer ' + guestToken);
    }

    req = req.clone({
      headers,
      url: (req.url.includes('http') ? '' : this.requestUrl) + req.url
    });

    return next.handle(req).pipe(catchError(error => {
      if (error.status === 401) {
        // TODO: Should not proceed to login page, the user must be notified that the request must be authorized first.
        this.userService.logout();
      }
      return throwError(error);
    }));
  }
}
