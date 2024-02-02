import { Injectable } from '@angular/core';
import { CanActivate, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Utils } from '../app.utils';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordGuard implements CanActivate {

  constructor(private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN)) &&
      !Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_EMAIL))) {
      this.router.navigate(['']).then();
      return false;
    }
    else { return true; }

  }

}
