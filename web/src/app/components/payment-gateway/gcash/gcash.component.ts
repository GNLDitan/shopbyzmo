import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/app.utils';
import { BraintreePayment } from 'src/app/classes/braintree-payment';
import { GCashPayment } from 'src/app/classes/gcash-payment';
import { Address, Billing, PaymentResource } from 'src/app/classes/paymongo';
import { DataService } from 'src/app/services/data.service';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymongoService } from 'src/app/services/paymongo.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gcash',
  templateUrl: './gcash.component.html',
  styleUrls: ['./gcash.component.scss']
})
export class GcashComponent implements OnInit, OnDestroy {
  checkoutUrl: string;
  paymentIntentResource: PaymentResource;
  payment: BraintreePayment;
  selectedOrder: Subscription;
  gcashPayment: GCashPayment;
  isLoading: boolean;
  constructor(private paymongoService: PaymongoService,
              private dataService: DataService,
              private paymentService: PaymentService) {
    this.payment = new BraintreePayment();
    this.selectedOrder = new Subscription();
    this.paymentIntentResource = new PaymentResource();
    this.gcashPayment = new GCashPayment();
  }

  ngOnInit() {
    this.selectedOrder = this.dataService.selectedBraintreePayment$.subscribe((payment) => {
      if (payment.hasOwnProperty('paymentType')) {
        this.isLoading = true;
        this.payment = payment;
        this.paymentSource();
        let data = {
          'data': this.paymentIntentResource
        };
        this.paymongoService.createSourceResources(data).then((response: any) => {
          this.gcashPayment.sourceId = response.data.id;
          this.paymentService.createGCashPayment(this.gcashPayment).then(() => {
            this.checkoutUrl = response.data.attributes.redirect.checkout_url;
            this.isLoading = false;
          }).catch((error: any) => {
            error.errors[0].detail;
            this.isLoading = false;
          });
        }).catch((error: any) => {
          error.errors[0].detail;
          this.isLoading = false;
        });
      }
    });
  }

  ngOnDestroy() {
    this.selectedOrder.unsubscribe();
  }

  proceed() {
    this.paymentService.createGCashPayment(this.gcashPayment).then(() => {
      window.location.href = this.checkoutUrl;
    });
  }

  paymentSource() {
    let refid = 0;
    const billing = new Billing();
    const address = new Address();
    billing.email = this.payment.Order.shippingDetails.email;
    billing.name = this.payment.Order.shippingDetails.completeName;
    billing.phone = this.payment.Order.shippingDetails.mobileNumber;
    address.city = this.payment.Order.shippingDetails.city;
    address.country = 'PH';
    address.line1 = this.payment.Order.shippingDetails.address;
    address.line2 = 'N/A';
    address.postal_code = this.payment.Order.shippingDetails.postalCode;
    address.state = this.payment.Order.shippingDetails.states;
    billing.address = address;

    if (this.payment.isTotal) {
      refid = 0
    }
    else if (this.payment.paymentType == 'order') {
      refid = this.payment.orderId
 }
    else if (this.payment.paymentType == 'layaway') {
      refid = this.payment.layAwayId
 }
    else if (this.payment.paymentType == 'pre-order') {
      refid = this.payment.preOrderId
 }


    let successUrl = `${environment.webUrl}/order/payment-success?orderid=${this.payment.orderId}&type=${this.payment.paymentType}&refid=${refid}`;
    let id = this.payment.Order.id;
    this.paymentIntentResource.attributes.type = 'gcash';
    this.paymentIntentResource.attributes.amount = Utils.fullAmount(this.payment.amount);
    this.paymentIntentResource.attributes.currency = 'PHP';
    this.paymentIntentResource.attributes.redirect.success = successUrl;
    this.paymentIntentResource.attributes.redirect.failed = `${environment.webUrl}/order/payment-failed`;
    this.paymentIntentResource.attributes.statement_descriptor = 'Shop Byzmo';
    this.paymentIntentResource.attributes.livemode = environment.production;
    this.paymentIntentResource.attributes.created_at = 1586097138;
    this.paymentIntentResource.attributes.created_at = 1586097138;
    this.paymentIntentResource.attributes.billing = billing;

    this.gcashPayment.orderId = this.payment.orderId;
    this.gcashPayment.paymentType = this.payment.paymentType;
    this.gcashPayment.refId = refid;
    this.gcashPayment.isTotal = this.payment.isTotal;
    this.gcashPayment.paymentId = '';
    this.gcashPayment.productId = this.payment.productId;
  }


  createPaymentSource() {

  }

}
