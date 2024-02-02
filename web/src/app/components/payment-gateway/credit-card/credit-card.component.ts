import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { BraintreeService } from 'src/app/services/braintree.service';
import { CurrenyService } from 'src/app/services/currency.service';
import { DataService } from 'src/app/services/data.service';
import { PaymentDetails } from 'src/app/classes/payment-details';
import { OrderService } from 'src/app/services/order.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { PaymentService } from 'src/app/services/payment.service';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from 'src/app/app.utils';
import { BraintreePayment } from 'src/app/classes/braintree-payment';
import { PayPalPayment } from 'src/app/classes/paypal-payment';

declare const paypal: any;

@Component({
  selector: 'app-credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss']
})
export class CreditCardComponent implements OnInit, OnDestroy, AfterViewInit {

  selectedOrder: Subscription;
  // hasLayaway: boolean;
  payment: BraintreePayment;
  paymentType: any;
  punits: any;
  isLoad: boolean;
  isScriptDone: Subscription;

  constructor(
    public braintTreeService: BraintreeService,
    public currencyService: CurrenyService,
    public dataService: DataService,
    public paymentService: PaymentService,
    public toasterService: ToasterService,
    public navigationService: NavigationService,
    private SpinnerService: NgxSpinnerService,
    private orderService: OrderService
  ) {
    this.payment = new BraintreePayment();
    this.punits = {};
  }

  ngOnInit() {
    this.paymentType = Utils.PAYMENT_TYPE;
    

    this.selectedOrder = this.dataService.selectedBraintreePayment$.subscribe((payment) => {
      this.payment = payment;
      if (this.payment.hasOwnProperty('amount')) {
        this.constructPurchase();
        // this.dataService.selectedCreditCardMethod$.subscribe((paymentMethod) => {
        //   if (paymentMethod.hasOwnProperty('isPaymongo')) {
        //     if (paymentMethod.isPaymongo) {
        //       this.navigationService.toPaymentCreditCardPaymongo(payment.Order.securityId)
        //     } else {
        //       this.constructPurchase();
        //     }
        //   }
        // });
      }
    });
  }

  ngAfterViewInit() {
    this.paypalButtons();
  }

  constructPurchase() {
    /** Amount **/
    let description = ''

    if (!Utils.isArrayNullOrUndefinedOrEmpty(this.payment.Order))
      description = this.payment.Order.orderCart.map(x => x.product.productName).join(' + ');

    this.punits = {};
    this.punits.reference_id = `order_number#${this.payment.orderId}-type_${this.payment.paymentType}`;
    this.punits.description = 'Payment for order no#' + this.payment.orderId;
    this.punits.amount = { value: this.payment.amount.toString(), currency_code: Utils.BASE_CURRENCY };
    this.punits.payment_descriptor = "Shop Byzmo";
  }


  paypalButtons() {
    let parent = this;
    var button = paypal.Buttons({
      fundingSource: paypal.FUNDING.CARD,
      createOrder: function (data, actions) {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [parent.punits],
          experience: {
            input_fields: {
              no_shipping: 1
            }
          }
        });
      },
      onApprove: function (data, actions) {
        // This function captures the funds from the transaction.
        return actions.order.capture().then(function (paymentResult) {
          parent.SpinnerService.show();

          const paymentDetails = new PaymentDetails();
          paymentDetails.paypalPayment = new PayPalPayment();
          paymentDetails.orderId = parent.payment.orderId;
          paymentDetails.paymentMethod = parent.payment.paymentType;
          paymentDetails.layawayId = parent.payment.layAwayId;
          paymentDetails.amountPaid = parent.payment.amount;
          paymentDetails.preOrderId = parent.payment.preOrderId;
          paymentDetails.isTotal = parent.payment.isTotal;
          paymentDetails.productId = parent.payment.productId;
          //* Paypal Details *//
          paymentDetails.paypalPayment.paypalId = paymentResult.id;
          paymentDetails.paypalPayment.payerId = paymentResult.payer.payer_id;
          paymentDetails.paypalPayment.intent = paymentResult.intent;
          paymentDetails.paypalPayment.createTime = paymentResult.create_time;

          // * Post Payment to database * //
          if (parent.payment.paymentType == parent.paymentType.order) {
            parent.paymentService.completePayment(paymentDetails).then((result) => {
              parent.SpinnerService.hide();
              parent.navigationService.toOrderComplete(parent.payment.orderId);
            }).catch(() => {
              parent.SpinnerService.hide();
              parent.toasterService.alert('error', 'Error while processing your payment. Please try again later');
            });
          } else if (parent.payment.paymentType == parent.paymentType.preOrder) {
            paymentDetails.preOrderTransactionFee = parent.payment.preOrderTransactionFee;
            parent.paymentService.paymentPreOrderSchedule(paymentDetails).then(() => {
              parent.SpinnerService.hide();
              parent.navigationService.toPaymentComplete(parent.payment.orderId);
            }).catch(() => {
              parent.SpinnerService.hide();
              parent.toasterService.alert('error', 'Error while processing your payment. Please try again later');
            });
          } else {
            paymentDetails.layawayTransactionFee = parent.payment.layawayTransactionFee;
            parent.paymentService.paymentLayawaySchedule(paymentDetails).then(() => {
              parent.SpinnerService.hide();
              parent.navigationService.toPaymentComplete(parent.payment.orderId);
            }).catch(() => {
              parent.SpinnerService.hide();
              parent.toasterService.alert('error', 'Error while processing your payment. Please try again later');
            });
          }

        });
      }
    });

    if (button.isEligible()) {
      // Render the standalone button for that funding source
      button.render('#paypal-button-container');
    }
  }


  ngOnDestroy() {
    this.selectedOrder.unsubscribe();
  }



}
