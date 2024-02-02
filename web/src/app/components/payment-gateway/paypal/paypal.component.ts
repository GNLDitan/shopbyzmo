import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { BraintreeService } from 'src/app/services/braintree.service';

import { CurrenyService } from 'src/app/services/currency.service';
import { DataService } from 'src/app/services/data.service';
import { OrderService } from 'src/app/services/order.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { Subscription } from 'rxjs';
import { PaymentService } from 'src/app/services/payment.service';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from 'src/app/app.utils';
import { BraintreePayment } from 'src/app/classes/braintree-payment';
// import { ICreateOrderRequest, IPayPalConfig, IPurchaseUnit } from 'ngx-paypal';
import { PayPalPurchaseUnit } from 'src/app/classes/paypal-purchase';
import { PayPalPayment } from 'src/app/classes/paypal-payment';
import { PaymentDetails } from 'src/app/classes/payment-details';

declare const paypal: any;

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.scss']
})
export class PaypalComponent implements OnInit, OnDestroy, AfterViewInit {

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
      }
    });

    // this.isScriptDone = this.dataService.isScriptDone$.subscribe((isDone) => {
    //   this.isLoad = isDone;
    //   if (isDone) {
    //     this.paypalButtons()
    //   }
    // });

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
    this.punits.description = description;
    this.punits.amount = { value: this.payment.amount.toString(), currency_code: Utils.BASE_CURRENCY };
    this.punits.payment_descriptor = "Shop Byzmo";
  }

  paypalButtons() {
    let parent = this;
    var button = paypal.Buttons({
      fundingSource: paypal.FUNDING.PAYPAL,
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


  loadPaypalButton() {
    let parent = this;
    paypal.Button.render({
      env: environment.production ? 'production' : 'sandbox',
      client: {
        production: environment.paypalClientId,
        sandbox: environment.paypalClientId
      },
      locale: 'en_US',
      style: {
        size: 'responsive',
        layout: 'horizontal',
        fundingicons: 'true',
      },
      commit: true,
      funding: {
        allowed: [paypal.FUNDING.CARD],
        disallowed: [paypal.FUNDING.CREDIT]
      },
      payment: function (data, actions) {
        return actions.payment.create({
          payment: parent.punits,
          experience: {
            input_fields: {
              no_shipping: 1
            }
          }
        })
      },
      onAuthorize: function (data, actions) {
        return actions.payment.execute().then(function (payment) {
          const paymentDetails = new PaymentDetails();
          paymentDetails.orderId = parent.payment.orderId;
          paymentDetails.paymentMethod = payment.payer.payment_methodL;
          paymentDetails.layawayId = parent.payment.layAwayId;
          paymentDetails.amountPaid = parent.payment.amount;
          paymentDetails.preOrderId = parent.payment.preOrderId;
          paymentDetails.isTotal = parent.payment.isTotal;
          paymentDetails.productId = parent.payment.productId;
          //* Paypal Details *//
          paymentDetails.paypalPayment.cart = payment.cart;
          paymentDetails.paypalPayment.createTime = payment.create_time;
          paymentDetails.paypalPayment.paypalId = payment.id;
          paymentDetails.paypalPayment.intent = payment.intent;
          paymentDetails.paypalPayment.paymentMethod = payment.payer.payment_method;
          paymentDetails.paypalPayment.state = payment.payer.state;
          if (payment.payer.payment_method != 'paypal')
            paymentDetails.paypalPayment.payerId = payment.payer.payer_id;

          // * Post Payment to database * //
          parent.SpinnerService.show();
          if (parent.payment.paymentType === parent.paymentType.order) {
            parent.paymentService.completePayment(paymentDetails).then((result) => {
              parent.SpinnerService.hide();
              parent.navigationService.toOrderComplete(parent.payment.orderId);
            }).catch(() => {
              parent.SpinnerService.hide();
              parent.toasterService.alert('error', 'Error while processing your payment. Please try again later');
            });
          } else if (parent.payment.paymentType === parent.paymentType.preOrder) {
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
              // TODO: Send
            }).catch(() => {
              parent.SpinnerService.hide();
              parent.toasterService.alert('error', 'Error while processing your payment. Please try again later');
            });
          }

        });
      },
      onError: function (err) {
        console.log(err);
      },
      onCancel: function (data, actions) {
        // Show a cancel page or return to cart
      }
    }, '#paypal-button');
  }




  ngOnDestroy() {
    this.selectedOrder.unsubscribe();
  }


  // loadPaymentMethods() {
  //   const parent = this;
  //   braintree.client.create({
  //     authorization: environment.braintreeClientToken
  //   }, function (err, clientInstance) {
  //     braintree.paypalCheckout.create({
  //       client: clientInstance
  //     }, function (err, paypalCheckoutInstance) {
  //       paypalCheckoutInstance.loadPayPalSDK({
  //         vault: true
  //       }, function () {
  //         // Set up regular PayPal button
  //         paypal.Buttons({
  //           fundingSource: paypal.FUNDING.PAYPAL,

  //           createBillingAgreement() {
  //             return paypalCheckoutInstance.createPayment({
  //               flow: 'vault',
  //               payer: {
  //                 payment_method: 'paypal'
  //               }
  //             });
  //           },
  //           onApprove(data, actions) {
  //             return paypalCheckoutInstance.tokenizePayment(data, function (err, payload) {
  //               const nonce = new Nonce();
  //               nonce.nonce = payload.nonce;
  //               nonce.chargeAmount = parent.currencyService.moneyConvert(parent.payment.amount, 'PHP');
  //               parent.SpinnerService.show();
  //               parent.braintTreeService.creatPurchace(nonce).then((result: any) => {
  //                 const paymentDetails = new PaymentDetails();
  //                 paymentDetails.orderId = parent.payment.orderId;
  //                 paymentDetails.graphQLId = result.target.graphQLId;
  //                 paymentDetails.paymentId = result.target.id;
  //                 paymentDetails.paypalPayerId = result.target.payPalDetails.payerId;
  //                 paymentDetails.paypalPaymentId = result.target.payPalDetails.paymentId;
  //                 paymentDetails.paypalDebugId = result.target.payPalDetails.debugId;
  //                 paymentDetails.paymentMethod = paypal.FUNDING.PAYPAL;
  //                 paymentDetails.layawayId = parent.payment.layAwayId;
  //                 paymentDetails.amountPaid = parent.payment.amount;
  //                 paymentDetails.preOrderId = parent.payment.preOrderId;
  //                 paymentDetails.isTotal = parent.payment.isTotal;
  //                 paymentDetails.productId = parent.payment.productId;

  //                 if (parent.payment.paymentType == parent.paymentType.order) {
  //                   parent.paymentService.completePayment(paymentDetails).then((result) => {
  //                     parent.SpinnerService.hide();
  //                     parent.navigationService.toOrderComplete(parent.payment.orderId);
  //                   }).catch(() => {
  //                     parent.SpinnerService.hide();
  //                     parent.toasterService.alert('error', 'Error while processing your payment. Please try again later');
  //                   });
  //                 } else if (parent.payment.paymentType == parent.paymentType.preOrder) {
  //                   paymentDetails.preOrderTransactionFee = parent.payment.preOrderTransactionFee;
  //                   parent.paymentService.paymentPreOrderSchedule(paymentDetails).then(() => {
  //                     parent.SpinnerService.hide();
  //                     parent.navigationService.toPaymentComplete(parent.payment.orderId);
  //                   }).catch(() => {
  //                     parent.SpinnerService.hide();
  //                     parent.toasterService.alert('error', 'Error while processing your payment. Please try again later');
  //                   });
  //                 } else {
  //                   paymentDetails.layawayTransactionFee = parent.payment.layawayTransactionFee;
  //                   parent.paymentService.paymentLayawaySchedule(paymentDetails).then(() => {
  //                     parent.SpinnerService.hide();
  //                     parent.navigationService.toPaymentComplete(parent.payment.orderId);
  //                   }).catch(() => {
  //                     parent.SpinnerService.hide();
  //                     parent.toasterService.alert('error', 'Error while processing your payment. Please try again later');
  //                   });
  //                 }
  //               }).catch((error) => {
  //                 parent.SpinnerService.hide();
  //                 parent.toasterService.alert('error', 'Error while creating your purchase. Please try again later');
  //               });
  //             });
  //           },
  //         }).render('#paypal-button');
  //       });
  //     });
  //   });

  // }
}
