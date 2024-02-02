import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/app.utils';
import { BraintreePayment } from 'src/app/classes/braintree-payment';
import { LayawayTransactionFee } from 'src/app/classes/layaway-transaction-fee';
import { PaymentTotal } from 'src/app/classes/payment-total';
import { PreOrderTransactionFee } from 'src/app/classes/pre-order-transactionFee';
import { DataService } from 'src/app/services/data.service';
import { OrderService } from 'src/app/services/order.service';
import { PaymentService } from 'src/app/services/payment.service';
import { ShippingService } from 'src/app/services/shipping.service';

@Component({
  selector: 'app-full-payment',
  templateUrl: './full-payment.component.html',
  styleUrls: ['./full-payment.component.scss']
})
export class FullPaymentComponent implements OnInit {

  paymentTotalSubscription: Subscription;
  paymentTotal: PaymentTotal;
  public transactionFee: number;
  public finalAmount: number;
  public transactionAmount: number;
  constructor(public dataService: DataService,
    public paymentService: PaymentService,
    public shippingService: ShippingService,
    public orderService: OrderService) {
    this.paymentTotal = new PaymentTotal();
  }

  ngOnInit() {
    this.paymentTotalSubscription = this.dataService.selectedPaymentTotal$.subscribe((paymentTotal) => {
      this.paymentTotal = paymentTotal;

      this.orderService.getOrderById(this.paymentTotal.orderId).then((orderDetails: any) => {


        if (paymentTotal.paymentMethod.withTransactionFee) {
          this.transactionFee = this.shippingService.computeTransactionFee(paymentTotal.paymentMethod.transactionFee, paymentTotal.amount);
          this.finalAmount = parseFloat((this.transactionFee + paymentTotal.amount).toFixed(2));
        }

        if (paymentTotal.paymentType === Utils.PAYMENT_TYPE.preOrder) {
          var preOrderTransaction = new PreOrderTransactionFee();
          preOrderTransaction.amount = this.transactionFee;
          preOrderTransaction.orderId = this.paymentTotal.orderId;
          preOrderTransaction.productId = this.paymentTotal.productId;
        } else {
          var layawayTransaction = new LayawayTransactionFee();
          layawayTransaction.amount = this.transactionFee;
          layawayTransaction.orderId = this.paymentTotal.orderId;
          layawayTransaction.productId = this.paymentTotal.productId;
        }
        // Request
        let braintreePayment = new BraintreePayment();
        this.transactionAmount = paymentTotal.amount;

        braintreePayment.amount = this.finalAmount > 0 ? this.finalAmount : this.transactionAmount;
        braintreePayment.currency = 'PHP';
        braintreePayment.orderId = paymentTotal.orderId;
        braintreePayment.productId = paymentTotal.productId;
        braintreePayment.paymentType = paymentTotal.paymentType;
        braintreePayment.isTotal = true;
        braintreePayment.withTransactionFee = paymentTotal.paymentMethod.withTransactionFee;
        braintreePayment.preOrderTransactionFee = preOrderTransaction;
        braintreePayment.layawayTransactionFee = layawayTransaction;
        braintreePayment.Order = orderDetails;

        this.dataService.setBraintreePayment(braintreePayment);
      });
    });
  }

  ngOnDestroy() {
    this.paymentTotalSubscription.unsubscribe();
  }

}
