import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth.service';
import { Order } from 'src/app/classes/order';
import { OrderService } from 'src/app/services/order.service';
import { Utils } from 'src/app/app.utils';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { LayAwayService } from 'src/app/services/layaway.service';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';

@Component({
  selector: 'app-login-guest',
  templateUrl: './login-guest.component.html',
  styleUrls: ['./login-guest.component.scss']
})
export class LoginGuestComponent implements OnInit {
  order: Order;
  tagPayment: string;
  layawayId: number;
  preOrderId: number;
  constructor(
    public authenticationService: AuthenticationService,
    public orderService: OrderService,
    public navigationService: NavigationService,
    public toasterService: ToasterService,
    public layAwayService: LayAwayService,
    public route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMaps: any) => {
      const params = paramMaps.params.id.split('-');
      this.tagPayment = params[0];
      const id = params[1];

      if (params[0] === Utils.PAYMENT_TYPE.order) {
        this.orderService.getOrderBySecurityId(id).then((order: any) => {
          this.order = order;
        });
      } else if (params[0] === Utils.PAYMENT_TYPE.preOrder) {
        this.layawayId = id;
      } else {
        this.layawayId = id;
      }
    });

  }


  loginAsGuest() {

    this.authenticationService.loginGuestToken().then(() => {
      this.continuePayment();
    }).catch(() => {
      this.toasterService.alert('error', 'Error while trying to load your payment. Please try again later');
    });

  }


  continuePayment() {
    if (this.tagPayment === Utils.PAYMENT_TYPE.order) {
      if (!Utils.isArrayNullOrUndefinedOrEmpty(this.order.paymentMethodName)) {
        if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
            this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
          this.navigationService.toPaymentPaypal(this.order.securityId);
        } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {
          // Is Paymongo API
          var isPaymongo = JSON.parse(localStorage.getItem(Utils.LS_ISPAYMONGO)) == true
          if (isPaymongo) {
            this.navigationService.toPaymentCreditCardPaymongo(this.order.securityId)
          } else this.navigationService.toPaymentCreditCard(this.order.securityId);

        } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GCash ||
                   this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
          this.navigationService.toPaymentGcash(this.order.securityId);
        } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay) {
          this.navigationService.toPaymentGrabPay(this.order.securityId);
        } else {
          this.navigationService.toOrderComplete(this.order.id);
        }
      }
    } else if (this.tagPayment === Utils.PAYMENT_TYPE.layaway) {
      this.navigationService.toPaymentDetails(this.layawayId, Utils.PAYMENT_TYPE.layaway);
    } else if (this.tagPayment === Utils.PAYMENT_TYPE.preOrder) {
      this.navigationService.toPaymentDetails(this.layawayId, Utils.PAYMENT_TYPE.preOrder);
    }


  }

}
