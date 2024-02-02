import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { PaymentService } from '../services/payment.service';
import { PaymentMethod } from '../classes/payment-method';

@Injectable({
  providedIn: 'root'
})
export class PaymentGuard implements CanActivate {

  constructor(private dataService: DataService,
    private paymentService: PaymentService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const param: any = next.params.id;
    this.paymentService.getPaymentMethodById(param).then((paymentMethod: PaymentMethod) => {
      if (paymentMethod != null) {
        this.dataService.setPaymentMethod(paymentMethod);
      } else return false;
    });
    return true;
  }
}
