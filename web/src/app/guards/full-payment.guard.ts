import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { OrderService } from '../services/order.service';
import { Order } from '../classes/order';
import { ToasterService } from '../services/toaster.service';
import { AuthenticationService } from '../services/auth.service';
import { NavigationService } from '../services/navigation.service';
import { LayAwaySchedule } from '../classes/layaway-schedule';
import { PaymentService } from '../services/payment.service';
import { PaymentTotal } from '../classes/payment-total';

@Injectable({
    providedIn: 'root'
})
export class FullPaymentGuard implements CanActivate {
    constructor(private dataService: DataService,
        private paymentService: PaymentService,
        private toasterService: ToasterService,
        private authenticationService: AuthenticationService,
        private navigationService: NavigationService) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const securityid: string = next.params.securityid;
        const productid: number = parseInt(next.params.productid);
        const paymenttype: any = next.params.paymenttype;
        const producttype: any = next.params.producttype;

        var payment = new PaymentTotal();
        payment.securityId = securityid;
        payment.productId = productid;
        payment.paymentType = paymenttype;
        payment.productType = producttype;

        if (this.authenticationService.validateUser()) {
            return this.paymentService.getPaymentTotal(payment).then((paymentTotal: PaymentTotal) => {
                if (paymentTotal != null) {
                    this.dataService.setPaymentTotal(paymentTotal);
                    return true;
                } else {
                    this.toasterService.alert('error', 'Error while processing your payment order. Please try again later')
                    return false;
                }
            }).catch((error) => {
                this.toasterService.alert('error', error.statusText);
                return false;
            });
        } else {
            // this.navigationService.toLayawayTotalGuest(securityid, productid);
            return false;
        }
    }

}
