import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { ShippingService } from '../services/shipping.service';
import { Shipping } from '../classes/shipping';

@Injectable({
  providedIn: 'root'
})
export class ShippingGuard implements CanActivate {

  constructor(private dataService: DataService,
    private shippingService: ShippingService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const param: any = next.params.id;
    this.shippingService.getShippingById(param).then((shipping: Shipping) => {
      if (shipping != null) {
        this.dataService.setShipping(shipping);
      } else return false;
    });
    return true;
  }

}
