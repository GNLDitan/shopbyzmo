import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { LandingService } from '../services/landing.service';
import { FileMapper } from '../classes/file-mapper';
import { OrderService } from '../services/order.service';
import { Order } from '../classes/order';

@Injectable({
    providedIn: 'root'
})
export class GCashSuccessGuard implements CanActivate {

    constructor(private dataService: DataService,
        private orderService: OrderService) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const orderid: any = next.queryParams.orderid;

        this.orderService.getOrderById(orderid).then((order: Order) => {
            if (order != null) {
                this.dataService.setOrder(order);
                return true;
            } else return false;
        });



        return true;
    }
}
