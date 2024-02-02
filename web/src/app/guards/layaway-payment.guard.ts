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

@Injectable({
    providedIn: 'root'
})
export class LayawayPaymentGuard implements CanActivate {
    constructor(private dataService: DataService,
        private orderService: OrderService,
        private toasterService: ToasterService,
        private authenticationService: AuthenticationService,
        private navigationService: NavigationService) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const param: any = next.params.id;

        if (this.authenticationService.validateUser()) {
            return this.orderService.getLayawayScheduleById(param).then((sched: LayAwaySchedule) => {
                if (sched != null) {
                    if (sched.isCleared) {
                        this.navigationService.toPaymentComplete(sched.id)
                    } else {
                        this.dataService.setLayawaySchedule(sched);
                        return true;
                    }
                } else {
                    this.toasterService.alert('error', 'Error while processing your payment order. Please try again later')
                    return false;
                }
            }).catch((error) => {
                this.toasterService.alert('error', error.statusText);
                return false;
            });
        } else {
            this.navigationService.toLayawayLoginGuest(param);
            return false;
        }
    }

}
