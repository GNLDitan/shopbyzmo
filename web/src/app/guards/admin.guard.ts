import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';
import { Utils } from '../app.utils';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const email = localStorage.getItem(Utils.LS_EMAIL);

    if (Utils.isArrayNullOrUndefinedOrEmpty(email)) {
      return false;
    }

    return this.userService.getUserByEmail(email).then((success: any) => {
      return success.isAdmin;
    });
  }
}
