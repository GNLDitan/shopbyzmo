import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { Order } from 'src/app/classes/order';
import { DataService } from 'src/app/services/data.service';
import { Utils } from 'src/app/app.utils';
import { Subscription } from 'rxjs';
import { LayAway } from 'src/app/classes/layaway';
import { LayAwayDates } from 'src/app/classes/layaway-date';
import { LayAwayService } from 'src/app/services/layaway.service';
import { Cart } from 'src/app/classes/cart';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/services/product.service';
import { Discount } from 'src/app/classes/discount';
import { NavigationService } from 'src/app/services/navigation.service';
import { User } from 'src/app/classes/user';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { PreOrderSchedule } from 'src/app/classes/pre-order-schedule';

@Component({
  selector: 'app-client-order-info-view',
  templateUrl: './client-order-info-view.component.html',
  styleUrls: ['./client-order-info-view.component.scss']
})
export class ClientOrderInfoViewComponent implements OnInit {

  selectedContentSubscription: Subscription;
  layAway: LayAway;
  layAwayDates: Array<LayAwayDates>;
  order: Order;
  productFolder: string;
  selectedDiscount: Discount;
  shippingAmount: number;
  subTotal: number;
  sumTotalPrice: number;
  discountAmount: number;
  amountToPay: number;
  isWithLayAway: boolean;
  itemNumber: string;
  cart: Cart;
  user: User;
  completeName: string;
  shippingMethodDescription: string;
  email: string;
  note: string;
  specialInstruction: string;
  isOnlinePayment: boolean;
  facebookName: string;

  constructor(
    private confirmationService: ConfirmationService,
    private dataService: DataService,
    private layAwayService: LayAwayService,
    private productService: ProductService,
    private navigationService: NavigationService,
    public route: ActivatedRoute,
    private orderService: OrderService,
    private userService: UserService) {

    this.layAway = new LayAway();
    this.layAwayDates = Array();
    this.productFolder = environment.productFolderPath;
    this.selectedDiscount = new Discount();
    this.cart = new Cart();
    this.order = new Order();
    this.user = new User();
  }

  ngOnInit() {
    this.checkUser();
    this.subscribeUser();
    this.loadContentInfo();
  }

  checkUser() {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        this.dataService.setUser(success);
      }, (error) => {
        console.log(error.error);
      });
    }

  }

  subscribeUser() {
    this.dataService.user$.subscribe(next => {
      this.user = next;
    });
  }

  loadContentInfo() {
    this.route.paramMap.subscribe((paramMaps: any) => {
      const id = paramMaps.params.id;
      this.orderService.getOrderBySecurityId(id).then((order: any) => {
        if (order.hasOwnProperty('id')) {
          const amountToPay = 0;
          const nonRefundDepositTotal = 0;
          this.order = order;

          if (this.order.statusId === 1) {
            this.note = 'Your Order is Confirmed';
          } else if (this.order.statusId === 2) {
            this.note = 'Thank you for your Payment! 	The Items in your order will now be prepared for Shipping.';
          } else if (this.order.statusId === 3) {
            this.note = 'Your Order is on the way!';
          } else if (this.order.statusId === 5) {
            this.note = 'Your Order is cancelled';
          }
          this.isOnlinePayment = (this.order.paymentMethodName.indexOf('Bank') === -1 && this.order.paymentMethodName.indexOf('OTC') === -1) || this.order.paymentMethodName === Utils.ONLINE_PAYMENT.OnlineBanking;
          this.completeName = this.order.shippingDetails.completeName;
          this.shippingMethodDescription = this.order.shippingDetails.shippingName;
          this.specialInstruction = this.order.shippingDetails.specialInstruction;
          this.email = this.order.shippingDetails.email;
          this.facebookName = this.order.shippingDetails.facebookName;
          this.order.orderCart.map((crt: Cart) => {
            const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
              ? crt.product.productImages.find(x => x.isDefaultImage) :
              crt.product.productImages[0];
            crt.product.currentImageUrl = this.productFolder + currentImage.fileName;

            const totalPrice = crt.onSale && !crt.preOrder ? crt.salesPrice : crt.price;
            crt.totalPrice = totalPrice;
            crt.totalAmount = (crt.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) ? (crt.origPrice * crt.quantity) + crt.rushFee : (totalPrice * crt.quantity);

            if (crt.preOrder || (crt.preOrderLayaway && !crt.isLayAway) ) {
              crt.preOrderSchedule.map((sched) => {
                sched.paymentTermDesc = Utils.PREORDER_TERM.filter(x => x.code === sched.paymentTerm)[0].description;

                if (sched.paymentTerm === 'DP') {
                  sched.dpWithRushFee = sched.amount + crt.rushFee;
                  sched.amount = sched.dpWithRushFee;
                }
              });
            }

            // if (crt.isLayAway && !Utils.isNullOrUndefined(crt.layAwaySchedule)) {
            //   nonRefundDepositTotal = 0;
            //   crt.layAwaySchedule.map((sched: LayAwaySchedule) => {
            //     if (sched.isNonRefundDeposit && sched.productId == crt.product.id) {
            //       nonRefundDepositTotal += sched.monthly;
            //     }
            //   });
            // }
            // amountToPay = crt.isLayAway ? amountToPay + nonRefundDepositTotal : amountToPay + crt.totalAmount;
          });

          this.order.layaway = this.order.orderCart.filter(x => x.isLayAway).length >= 1 ? true : false;
          // if (!Utils.isNullOrUndefined(this.order.shippingDetails.discountCode)) {
          //   this.productService.getAllDiscountByCode(this.order.shippingDetails.discountCode).then((discount: Discount) => {
          //     if (discount !== null) {
          //       this.selectedDiscount = discount;
          //     } else {
          //       this.selectedDiscount = new Discount();
          //     }

          //     const orderBreakDown = this.orderService.computeOrderBreakDown(this.order, this.selectedDiscount, amountToPay);
          //     this.order.shippingAmount = orderBreakDown.shippingAmount;
          //     this.order.totalPrice = orderBreakDown.totalPrice;
          //     this.order.discountAmount = orderBreakDown.discountAmount;
          //     this.order.amountToPay = orderBreakDown.amountToPay;
          //   });
          // } else {
          //   this.selectedDiscount = new Discount();
          //   const orderBreakDown = this.orderService.computeOrderBreakDown(this.order, this.selectedDiscount, amountToPay);
          //   this.order.shippingAmount = orderBreakDown.shippingAmount;
          //   this.order.totalPrice = orderBreakDown.totalPrice;
          //   this.order.discountAmount = orderBreakDown.discountAmount;
          //   this.order.amountToPay = orderBreakDown.amountToPay;
          // }

          this.order.shippingAmount = this.order.shippingDetails.shippingAmount;
          this.order.totalPrice = this.order.shippingDetails.total;
          this.order.discountAmount = this.order.shippingDetails.discountAmount;
          this.order.amountToPay = this.order.shippingDetails.amountToPay;
          this.order.insuranceFee = this.order.shippingDetails.insuranceFee;
          let preOrderSum = 0;
          for (const pre of this.order.orderCart.filter(x => x.preOrder || (x.preOrderLayaway && !x.isLayAway))) {
            preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
          }
          this.subTotal = preOrderSum > 0 ? preOrderSum : this.order.shippingDetails.subTotal;

          this.order.totalPrice = preOrderSum > 0 ? (this.subTotal - this.order.discountAmount) + this.order.shippingAmount + this.order.insuranceFee
            : this.order.totalPrice;

        }

      });
    });

  }

  viewLayAway(cart: Cart) {
    this.itemNumber = cart.product.itemNumber;
    this.cart = cart;
  }

  getDays(paymentDay: any) {
    return Utils.numericSuffix(paymentDay) + ' of the month';
  }

  infoCancel() {
    this.navigationService.toClientOrder();
  }

  payNow(sched: LayAwaySchedule) {
    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
      this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
      this.navigationService.toPaymentOtherPaypal(sched.id, Utils.PAYMENT_TYPE.layaway);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {
      // Is Paymongo Endpoint
      var isPaymongo = JSON.parse(localStorage.getItem(Utils.LS_ISPAYMONGO)) == true
      if (isPaymongo) {
        this.navigationService.toPaymentOtherCreditCardPaymongo(sched.id, Utils.PAYMENT_TYPE.layaway)
      } else this.navigationService.toPaymentOtherCreditCard(sched.id, Utils.PAYMENT_TYPE.layaway)

    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GCash ||
      this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
      this.navigationService.toPaymentOtherGCash(sched.id, Utils.PAYMENT_TYPE.layaway);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay) {
      this.navigationService.toPaymentOtherGrabPay(sched.id, Utils.PAYMENT_TYPE.layaway);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.OnlineBanking) {
      this.navigationService.toPaymentOtherOnlineBankingPaymongo(sched.id, Utils.PAYMENT_TYPE.layaway);
    }
  }


  payNowPreOrder(sched: PreOrderSchedule) {
    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
        this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
      this.navigationService.toPaymentOtherPaypal(sched.id, Utils.PAYMENT_TYPE.preOrder);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {
      // Is Paymongo Endpoint
      var isPaymongo = JSON.parse(localStorage.getItem(Utils.LS_ISPAYMONGO)) == true
      if (isPaymongo) {
        this.navigationService.toPaymentOtherCreditCardPaymongo(sched.id, Utils.PAYMENT_TYPE.preOrder)
      } else this.navigationService.toPaymentOtherCreditCard(sched.id, Utils.PAYMENT_TYPE.preOrder);


    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GCash ||
               this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
      this.navigationService.toPaymentOtherGCash(sched.id, Utils.PAYMENT_TYPE.preOrder);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay) {
      this.navigationService.toPaymentOtherGrabPay(sched.id, Utils.PAYMENT_TYPE.preOrder);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.OnlineBanking) {
      this.navigationService.toPaymentOtherOnlineBankingPaymongo(sched.id, Utils.PAYMENT_TYPE.preOrder);
    }
    
  }

}
