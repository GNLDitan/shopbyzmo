import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { PreOrderSchedule } from 'src/app/classes/pre-order-schedule';
import { BraintreePayment } from 'src/app/classes/braintree-payment';
import { Utils } from 'src/app/app.utils';
import { Product } from 'src/app/classes/product';
import { ProductService } from 'src/app/services/product.service';
import { ShippingService } from 'src/app/services/shipping.service';
import { PreOrderTransactionFee } from 'src/app/classes/pre-order-transactionFee';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-pre-order-payment',
  templateUrl: './pre-order-payment.component.html',
  styleUrls: ['./pre-order-payment.component.scss']
})
export class PreOrderPaymentComponent implements OnInit {

  preOrderSubscription: Subscription;
  preOrderSched: PreOrderSchedule;
  public product: Product;
  public transactionFee: number;
  public finalAmount: number;
  constructor(
    public dataService: DataService,
    public productService: ProductService,
    public shippingService: ShippingService,
    public orderService: OrderService) {
    this.preOrderSched = new PreOrderSchedule();
    this.product = new Product();
  }

  ngOnInit() {
    this.preOrderSubscription = this.dataService.selectedPreOrderSched$.subscribe((result: PreOrderSchedule) => {
      this.preOrderSched = result;
      this.preOrderSched.paymentTermDesc = Utils.PREORDER_TERM.filter(x => x.code === result.paymentTerm)[0].description;
      this.orderService.getOrderById(this.preOrderSched.orderId).then((orderDetails: any) => {
        this.productService.getProductById(this.preOrderSched.productId).then((product: Product) => {
          this.product = product;
        });

        if (result.paymentMethod.withTransactionFee) {
          this.transactionFee = this.shippingService.computeTransactionFee(result.paymentMethod.transactionFee, this.preOrderSched.amount);
          this.finalAmount = parseFloat((this.transactionFee + this.preOrderSched.amount).toFixed(2));
        }
        const preorderTransaction = new PreOrderTransactionFee();
        preorderTransaction.amount = this.transactionFee;
        preorderTransaction.preOrderId = this.preOrderSched.id;
        preorderTransaction.orderId = this.preOrderSched.orderId;
        preorderTransaction.productId = this.preOrderSched.productId;

        // Request
        const braintreePayment = new BraintreePayment();
        braintreePayment.amount = this.transactionFee > 0 ? this.finalAmount : this.preOrderSched.amount;
        braintreePayment.currency = 'PHP';
        braintreePayment.orderId = this.preOrderSched.orderId;
        braintreePayment.paymentType = Utils.PAYMENT_TYPE.preOrder;
        braintreePayment.preOrderId = this.preOrderSched.id;
        braintreePayment.preOrderTransactionFee = preorderTransaction;
        braintreePayment.withTransactionFee = result.paymentMethod.withTransactionFee;
        braintreePayment.Order = orderDetails;
        this.dataService.setBraintreePayment(braintreePayment);
      });

    });
  }

}
