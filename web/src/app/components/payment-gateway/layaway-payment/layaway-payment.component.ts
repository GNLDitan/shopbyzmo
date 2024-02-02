import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { OrderService } from 'src/app/services/order.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/classes/product';
import { BraintreePayment } from 'src/app/classes/braintree-payment';
import { Utils } from 'src/app/app.utils';
import { ShippingService } from 'src/app/services/shipping.service';
import { LayawayTransactionFee } from 'src/app/classes/layaway-transaction-fee';

@Component({
  selector: 'app-layaway-payment',
  templateUrl: './layaway-payment.component.html',
  styleUrls: ['./layaway-payment.component.scss']
})
export class LayawayPaymentComponent implements OnInit, OnDestroy {
  public layAwaySched: LayAwaySchedule;
  layAwaySubscription: Subscription;
  product: Product;
  transactionFee: number;
  finalAmount: number;
  constructor(public dataService: DataService,
              public productService: ProductService,
              public shippingService: ShippingService,
              public orderService: OrderService) {
    this.layAwaySched = new LayAwaySchedule();
    this.product = new Product();
  }

  ngOnInit() {
    this.layAwaySubscription = this.dataService.selectedLayAwaySched$.subscribe((result: any) => {
      this.layAwaySched = result;
      this.orderService.getOrderById(this.layAwaySched.orderId).then((orderDetails: any) => {
        this.productService.getProductById(this.layAwaySched.productId).then((product: Product) => {
          this.product = product;
        });
        if (result.paymentMethod.withTransactionFee) {
          this.transactionFee = this.shippingService.computeTransactionFee(result.paymentMethod.transactionFee, this.layAwaySched.monthly);
          this.finalAmount = parseFloat((this.transactionFee + this.layAwaySched.monthly).toFixed(2));
        }
        const layawayTransaction = new LayawayTransactionFee();
        layawayTransaction.amount = this.transactionFee;
        layawayTransaction.layawayId = this.layAwaySched.id;
        layawayTransaction.orderId = this.layAwaySched.orderId;
        layawayTransaction.productId = this.layAwaySched.productId;

        // Request
        const braintreePayment = new BraintreePayment()
        braintreePayment.amount = this.transactionFee > 0 ? this.finalAmount : this.layAwaySched.monthly;
        braintreePayment.currency = 'PHP';
        braintreePayment.orderId = this.layAwaySched.orderId;
        braintreePayment.paymentType = Utils.PAYMENT_TYPE.layaway;
        braintreePayment.layAwayId = this.layAwaySched.id;
        braintreePayment.withTransactionFee = result.paymentMethod.withTransactionFee;
        braintreePayment.layawayTransactionFee = layawayTransaction;
        braintreePayment.Order = orderDetails;
        this.dataService.setBraintreePayment(braintreePayment);
      });
    });
  }

  ngOnDestroy() {
    this.layAwaySubscription.unsubscribe();
  }

}
