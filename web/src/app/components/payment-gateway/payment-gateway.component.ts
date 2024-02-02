import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/classes/order';
import { PaymongoService } from 'src/app/services/paymongo.service';
import { Subscription } from 'rxjs';
import { ShippingDetails } from 'src/app/classes/shipping-details';
import { DataService } from 'src/app/services/data.service';
import { ShippingService } from 'src/app/services/shipping.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { Cart } from 'src/app/classes/cart';
import { Utils } from 'src/app/app.utils';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { Discount } from 'src/app/classes/discount';
import { BraintreePayment } from 'src/app/classes/braintree-payment';

@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.component.html',
  styleUrls: ['./payment-gateway.component.scss']
})
export class PaymentGatewayComponent implements OnInit, OnDestroy {
  orderSubcribe: Subscription;
  shippingDetails: ShippingDetails;
  public activeOrder: Order;
  public hasLayaway: boolean;
  public currentDate: Date;
  public transactionAmount: number;
  public finalAmount: number;
  public transactionFee: number;
  public shippingAddress: string;
  constructor(
    private dataService: DataService,
    private shippingService: ShippingService,
    public navigationService: NavigationService,
    public orderService: OrderService) {
    this.orderSubcribe = new Subscription();
    this.activeOrder = new Order();
    this.shippingDetails = new ShippingDetails();
    this.currentDate = new Date();
  }

  ngOnInit() {

    this.orderSubcribe = this.dataService.selectedOrder$.subscribe((next) => {
      Object.assign(this.activeOrder, next);
      this.hasLayaway = false;

      this.activeOrder.orderCart.map((crt: Cart) => {
        const totalPrice = crt.onSale ? crt.salesPrice : crt.price;
        crt.totalPrice = totalPrice;
        crt.totalAmount = (totalPrice * crt.quantity);

        if (crt.isLayAway) {
          this.hasLayaway = true;
        }
      });

      this.transactionAmount = this.hasLayaway ? this.activeOrder.amountToPay : this.activeOrder.totalPrice;
      this.finalAmount = this.activeOrder.finalAmount;
      this.transactionFee = this.activeOrder.transactionFee;

      // Request
      const braintreePayment = new BraintreePayment();
      braintreePayment.amount = this.finalAmount > 0 ? this.finalAmount : this.transactionAmount;
      braintreePayment.currency = 'PHP';
      braintreePayment.orderId = this.activeOrder.id;
      braintreePayment.paymentType = Utils.PAYMENT_TYPE.order;
      braintreePayment.Order = this.activeOrder;

      this.dataService.setBraintreePayment(braintreePayment);
      const state = this.activeOrder.shippingDetails.states;
      const province = this.activeOrder.shippingDetails.province;
      const hasStates = !Utils.isStringNullOrEmpty(state);

      const zipCode = this.activeOrder.shippingDetails.zipCode.toString();
      const postalCode = this.activeOrder.shippingDetails.postalCode;
      const hasZipCode = !Utils.isStringNullOrEmpty(zipCode);

      this.shippingAddress = this.activeOrder.shippingDetails.address.concat(' ')
        .concat(this.activeOrder.shippingDetails.barangay).concat(' ')
        .concat(this.activeOrder.shippingDetails.city).concat(' ')
        .concat(hasStates ? state : province).concat(' ')
        .concat(hasZipCode ? zipCode : postalCode).concat(', ')
        .concat(this.activeOrder.shippingDetails.countryCode);


    });
  }

  ngOnDestroy() {
    this.orderSubcribe.unsubscribe();

  }

  toAPaymentMethod() {
    this.navigationService.toOtherPaymentMethod(this.activeOrder.securityId);
  }

  isNullOrUndefined(data) {
    return Utils.isNullOrUndefined(data);
  }

  goToProduct() {
    this.navigationService.toProducts();
  }

}
