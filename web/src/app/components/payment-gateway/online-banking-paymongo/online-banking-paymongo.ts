import { Component, HostListener, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AttachPaymentIntentData, PaymentIntentData, PaymentIntentResource } from 'paymongoo/dist/payment-intents';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/app.utils';
import { BraintreePayment } from 'src/app/classes/braintree-payment';
import { CreditCard } from 'src/app/classes/credit-card';
import { CreditCardPayment } from 'src/app/classes/credit-card-payment';
import { GCashPayment } from 'src/app/classes/gcash-payment';
import { PaymentDetails } from 'src/app/classes/payment-details';
import { Address, AttachPaymentIntent, Billing, CreditCardAttributes, CreditCardDetails, LineItem, PaymentMethod, PaymentResource } from 'src/app/classes/paymongo';
import { PaymongoBankPayment } from 'src/app/classes/paymongo-bank-payment';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymongoService } from 'src/app/services/paymongo.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { environment } from 'src/environments/environment';
import { isNullOrUndefined } from 'util';


// https://developers.paymongo.com/docs/pipm-workflow
@Component({
  selector: 'app-online-banking-paymongo',
  templateUrl: './online-banking-paymongo.html',
  styleUrls: ['./online-banking-paymongo.scss']
})
export class OnlineBankingPaymongoComponent implements OnInit, OnDestroy {

  checkoutUrl: string;
  paymentIntentResource: PaymentResource;
  paymentMethod: PaymentMethod;
  paymentIntentAttach: AttachPaymentIntent;
  payment: BraintreePayment;
  paymentType: any;
  onlineBankingPayment: CreditCardPayment;

  selectedOrder: Subscription;
  paymongoBankPayment: PaymongoBankPayment;
  isLoading: boolean;

  paymentCheckoutId: string;
  

  constructor(private paymongoService: PaymongoService,
              private dataService: DataService,
              private toasterService: ToasterService,
              private paymentService: PaymentService) {
    this.payment = new BraintreePayment();
    this.selectedOrder = new Subscription();
    this.paymentIntentResource = new PaymentResource();
    this.paymongoBankPayment = new PaymongoBankPayment();
    this.payment = new BraintreePayment();
    this.paymentIntentAttach = new AttachPaymentIntent();
    this.paymentType = Utils.PAYMENT_TYPE;
    this.onlineBankingPayment = new CreditCardPayment();
  }

  ngOnInit() {
    this.selectedOrder = this.dataService.selectedBraintreePayment$.subscribe((payment) => {
      if (payment.hasOwnProperty('paymentType')) {
        this.payment = payment;
      }
    });
  }

  ngOnDestroy() {
    this.selectedOrder.unsubscribe();
  }

  proceedToPayment() {
    this.constructPaymentEntites()
  }

  constructPaymentEntites() {
    this.isLoading = true;
    this.createCheckoutEntity()
    this.payPaymongoOnlineBanking()
  }

  payPaymongoOnlineBanking() {
      this.paymongoService.createCheckoutSession(this.paymentMethod).then((response: any) => {
        if(response.data) {
          this.paymentCheckoutId = response.data.id;
          this.onlineBankingPayment.paymentId = response.data.id;
          this.onlineBankingPayment.sourceId = response.data.id;
          this.paymentService.createOnlineBankingPayment(this.onlineBankingPayment).then(() => {
            this.checkoutUrl = response.data.attributes.checkout_url;
            this.isLoading = false;
            window.location.href  = this.checkoutUrl
          });
        } else {
          this.toasterService.alert('error', response.errors[0].detail);
          this.isLoading = false;
        }
          
      }).catch((error: any) => {
        error.errors[0].detail;
        this.isLoading = false;
      });
  }

  proceed() {
    
  }


  // Link https://developers.paymongo.com/recipes/create-a-payment-method-recipe
  createCheckoutEntity() {
    let refid = 0;
    
    // Details //
    const attributes = new CreditCardAttributes();
    
  
    // Billing Address//
    const address = new Address();
    address.city = this.payment.Order.shippingDetails.city;
    address.country = 'PH';
    address.line1 = this.payment.Order.shippingDetails.address;
    address.line2 = 'N/A';
    address.postal_code = this.payment.Order.shippingDetails.postalCode;
    address.state = this.payment.Order.shippingDetails.states;


    // Billing //
    const billing = new Billing();
    billing.email = this.payment.Order.shippingDetails.email;
    billing.name = this.payment.Order.shippingDetails.completeName;
    billing.phone = this.payment.Order.shippingDetails.mobileNumber;
    billing.address = address;

    attributes.billing = billing;

    // Payment Method //

    this.paymentMethod = new PaymentMethod(); 
  
    this.paymentMethod.attributes = attributes;
    this.paymentMethod.attributes.type = "card";
    this.paymentMethod.attributes.livemode = environment.production;

    this.paymentMethod.attributes.payment_method_types = ["dob_ubp", "dob"];
    
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

    let successUrl = `${environment.webUrl}/order/creditcard/payment-success?orderid=${this.payment.orderId}&type=${this.payment.paymentType}&refid=${refid}`;
    this.paymentMethod.attributes.cancel_url = `${environment.webUrl}/order/payment-gateway/${this.payment.Order.securityId}/credit-card-v2`;
    this.paymentMethod.attributes.success_url =  successUrl;

    attributes.reference_number = refid.toString();


    var lineItem = new LineItem()
    lineItem.amount = Utils.fullAmount(this.payment.amount);
    lineItem.currency = 'PHP';
    lineItem.name = 'Order #'+ this.payment.orderId;
    lineItem.quantity = 1;

    attributes.line_items = [lineItem]
    this.paymentMethod.attributes = attributes;



    this.onlineBankingPayment.orderId = this.payment.orderId;
    this.onlineBankingPayment.paymentType = this.payment.paymentType;
    this.onlineBankingPayment.refId = refid;
    this.onlineBankingPayment.isTotal = this.payment.isTotal;
    this.onlineBankingPayment.paymentId = '';
    this.onlineBankingPayment.productId = this.payment.productId;

  }

 
}
