import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaymentMethod } from 'src/app/classes/payment-method';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { PaymentService } from 'src/app/services/payment.service';
import { Order } from 'src/app/classes/order';
import { DataService } from 'src/app/services/data.service';
import { Subscription } from 'rxjs';
import { NavigationService } from 'src/app/services/navigation.service';
import { Utils } from 'src/app/app.utils';

@Component({
  selector: 'app-other-payment-methods',
  templateUrl: './other-payment-methods.component.html',
  styleUrls: ['./other-payment-methods.component.scss']
})
export class OtherPaymentMethodsComponent implements OnInit, OnDestroy {
  modeOfPayments: Array<PaymentMethod>;
  filter: FilterSetting;
  selectedPayment: String;
  selectedOrder: Subscription;
  order: Order;

  constructor(public paymentService: PaymentService,
    public dataService: DataService,
    public navigationService: NavigationService) {
    this.modeOfPayments = new Array();
    this.filter = new FilterSetting();
    this.order = new Order();
    this.selectedPayment = '';
  }

  ngOnInit() {
    this.selectedOrder = this.dataService.selectedOrder$.subscribe((order) => {
      this.order = order;
    })

    this.loadPayments();
  }

  ngOnDestroy() {
    this.selectedOrder.unsubscribe();
  }

  loadPayments() {
    this.filter.limit = 9999999;
    this.paymentService.getPaymentMethodListRange(this.filter).then((result: any) => {
      this.modeOfPayments = result;
    });
  }

  selectedPayments(payment: PaymentMethod) {
    this.selectedPayment = payment.name;
  }

  continuePayment() {
    if (!Utils.isArrayNullOrUndefinedOrEmpty(this.selectedPayment)) {
      if (this.selectedPayment.trim() === Utils.ONLINE_PAYMENT.Paypal ||
          this.selectedPayment.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
        this.navigationService.toPaymentPaypal(this.order.securityId);
      } else if (this.selectedPayment.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {
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
      }  else {
        this.navigationService.toOrderComplete(this.order.securityId);
      }
    }
  }

}
