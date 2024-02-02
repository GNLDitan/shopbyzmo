import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { OrderService } from '../services/order.service';
import { Order } from '../classes/order';

@Injectable({
  providedIn: 'root'
})
export class OrderGuard implements CanActivate {
  constructor(private dataService: DataService,
    private orderService: OrderService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const param: any = next.params.id;
    this.orderService.getOrderById(param).then((order: Order) => {
      if (order != null) {
        this.dataService.setOrder(order);
      } else return false;
    });
    return true;
  }

}
