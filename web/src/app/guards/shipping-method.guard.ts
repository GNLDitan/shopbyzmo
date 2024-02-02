import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { NavigationService } from '../services/navigation.service';
import { Utils } from '../app.utils';

@Injectable({
    providedIn: 'root'
})
export class ShippingMethodGuard implements CanActivate {

    constructor(private dataService: DataService,
        private navigationService: NavigationService) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (!Utils.isArrayNullOrUndefinedOrEmpty(this.dataService.activeShippingDetails.address) &&
            !Utils.isArrayNullOrUndefinedOrEmpty(this.dataService.activeShippingDetails.email) &&
            !Utils.isArrayNullOrUndefinedOrEmpty(this.dataService.activeShippingDetails.mobileNumber))
            return true;
        else this.navigationService.gotoShipping();
    }

}
