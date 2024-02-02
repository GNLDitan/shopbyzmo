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
import { ToasterService } from 'src/app/services/toaster.service';
import { PaymentService } from 'src/app/services/payment.service';
import { PreOrderSchedule } from 'src/app/classes/pre-order-schedule';

@Component({
  selector: 'app-client-order-info',
  templateUrl: './client-order-info.component.html',
  styleUrls: ['./client-order-info.component.scss']
})
export class ClientOrderInfoComponent implements OnInit {
  @Output() viewContentInfo = new EventEmitter<boolean>();

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
  specialInstruction: string;
  facebookName: string;
  isUpdateDisabled: boolean;
  public isOnlinePayment: boolean;
  public clearOption: Array<any>;
  public totalPending: number;

  constructor(
    private confirmationService: ConfirmationService,
    private dataService: DataService,
    private productService: ProductService,
    private navigationService: NavigationService,
    public route: ActivatedRoute,
    private orderService: OrderService,
    private userService: UserService,
    private toasterService: ToasterService,
    private paymentService: PaymentService) {

    this.layAway = new LayAway();
    this.layAwayDates = Array();
    this.productFolder = environment.productFolderPath;
    this.selectedDiscount = new Discount();
    this.cart = new Cart();
    this.order = new Order();
    this.user = new User();
    this.clearOption = new Array();

  }

  ngOnInit() {
    this.clearOption.push({
      id: true,
      value: 'Paid'
    }, {
      id: false,
      value: 'Unpaid'
    });
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
          this.completeName = this.order.shippingDetails.completeName;
          this.shippingMethodDescription = this.order.shippingDetails.shippingName;
          this.specialInstruction = this.order.shippingDetails.specialInstruction;
          this.facebookName = this.order.shippingDetails.facebookName;
          this.isOnlinePayment = (this.order.paymentMethodName.indexOf('Bank') === -1 && this.order.paymentMethodName.indexOf('OTC') === -1)
              || this.order.paymentMethodName === Utils.ONLINE_PAYMENT.OnlineBanking;
          this.order.orderCart.map((crt: Cart) => {
            const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
              ? crt.product.productImages.find(x => x.isDefaultImage) :
              crt.product.productImages[0];
            crt.product.currentImageUrl = this.productFolder + currentImage.fileName;
            if (crt.preOrder || (crt.preOrderLayaway && !crt.isLayAway)) {
              crt.preOrderSchedule.map((sched) => {
                sched.paymentTermDesc = Utils.PREORDER_TERM.filter(x => x.code === sched.paymentTerm)[0].description;

                if (sched.paymentTerm === 'DP') {
                  sched.dpWithRushFee = sched.amount + crt.rushFee;
                  sched.amount = sched.dpWithRushFee;
                }

              });
            }

            const totalPrice = crt.onSale && !(crt.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) ? crt.salesPrice : crt.price;
            crt.totalPrice = totalPrice;
            crt.totalAmount = (crt.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) ? (crt.origPrice * crt.quantity) + crt.rushFee : (totalPrice * crt.quantity);
            // if (crt.isLayAway && !Utils.isNullOrUndefined(crt.layAwaySchedule)) {
            //   nonRefundDepositTotal = 0;
            //   crt.layAwaySchedule.map((sched: LayAwaySchedule) => {
            //     if (sched.isNonRefundDeposit && sched.productId === crt.product.id) {
            //       nonRefundDepositTotal += sched.monthly;
            //     }
            //   });
            // }


            // amountToPay = crt.isLayAway ? amountToPay + nonRefundDepositTotal : amountToPay + crt.totalAmount;
          });

          if (this.order.statusId === 1) {
            this.isUpdateDisabled = false;
          } else {
            this.isUpdateDisabled = true;
          }
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
          // this.order.finalAmount =
          let preOrderSum = 0;
          for (const pre of this.order.orderCart.filter(x => x.preOrder)) {
            preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
          }
          for (const pre of this.order.orderCart.filter(x => x.preOrderLayaway && !x.isLayAway)) {
            preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
          }
          this.subTotal = preOrderSum > 0 ? preOrderSum : this.order.shippingDetails.subTotal;

          this.order.totalPrice = preOrderSum > 0 ? (this.subTotal - this.order.shippingDetails.discountAmount) + this.order.shippingDetails.shippingAmount +
          this.order.insuranceFee : this.order.totalPrice;
        }

      });
    });

  }

  viewLayAway(cart: Cart) {
    this.itemNumber = cart.product.itemNumber;
    this.cart = cart;
    if (cart.isLayAway) {
      this.totalPending = cart.layAwaySchedule
        .filter(x => !x.isCleared && !x.isNonRefundDeposit && x.paymongoStatus != 2)
        .map(x => x.monthly)
        .reduce((a, b) => {
          return a + b;
        }, 0);
    }
    if (cart.preOrder) {
      this.totalPending = cart.preOrderSchedule
        .filter(x => !x.isCleared && x.paymentTerm != 'DP' && x.paymongoStatus != 2)
        .map(x => x.amount)
        .reduce((a, b) => {
          return a + b;
        }, 0);
    }
    if (cart.preOrderLayaway && !cart.isLayAway) {
      this.totalPending = cart.preOrderSchedule
        .filter(x => !x.isCleared && x.paymentTerm != 'DP' && x.paymongoStatus != 2)
        .map(x => x.amount)
        .reduce((a, b) => {
          return a + b;
        }, 0);
    }

  }


  payRemaining(isLayaway: boolean) {

    if  (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay ||
      this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCash.toLowerCase() ||
      this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
      if (this.totalPending <= 100) {
        this.toasterService.alert('info', 'Cannot Proccess. Amount must be greater than 100.');
        return;
      }
    }
    const paymentType = isLayaway ? Utils.PAYMENT_TYPE.layaway : Utils.PAYMENT_TYPE.preOrder;
    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
        this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
      this.navigationService.toTotalPaymentPaypal(paymentType, this.order.securityId, this.cart.product.id, isLayaway ? 1 : 2);
    }
    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {
      // Is Paymongo Endpoint
      var isPaymongo = JSON.parse(localStorage.getItem(Utils.LS_ISPAYMONGO)) == true
      if (isPaymongo) {
        this.navigationService.toTotalPaymentCreditCardPaymongo(paymentType, this.order.securityId, this.cart.product.id, isLayaway ? 1 : 2)
      } else  this.navigationService.toTotalPaymentCreditCard(paymentType, this.order.securityId, this.cart.product.id, isLayaway ? 1 : 2)
    }
    if (this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCash.toLowerCase() ||
        this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
      this.navigationService.toTotalPaymentGCash(paymentType, this.order.securityId, this.cart.product.id, isLayaway ? 1 : 2);
    }
    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay) {
      this.navigationService.toTotalPaymentGrabPay(paymentType, this.order.securityId, this.cart.product.id, isLayaway ? 1 : 2);
    }
  }

  getDays(paymentDay: any) {
    return Utils.numericSuffix(paymentDay) + ' of the month';
  }

  infoCancel() {
    this.navigationService.toClientOrder();
  }

  cancelOrder() {
    const dialogQuestion = 'Are you sure to cancel this order?';
    const dialogMessage = 'Order will be cancelled.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      'ShopInventarys Order #' + this.order.id.toString(), // Highlighted text after title = nullable
      dialogDanger, // Danger text after message = nullable
      false,
      true
    ).then((confirmed: any) => {
      if (confirmed) {

        this.order.orderReason.reason = confirmed;
        this.order.orderReason.orderId = this.order.id;
        this.order.statusId = 5;
        this.orderService.adminSendEmail(this.order);
        this.orderService.updateOrder(this.order).then((order: any) => {
          if (!Utils.isNullOrUndefined(order)) {
            this.toasterService.alert('success', 'cancel order');
            this.navigationService.toClientOrder();
          } else {
            this.toasterService.alert('danger', 'cancel order');
          }
        });
      }
    }).catch(() => { });

  }

  payNow(sched: LayAwaySchedule) {
    if (sched.paymongoStatus === 2) {
      this.toasterService.alert('info', 'Your payment is on process.');
      return;
    }
    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay ||
       this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GCash ||
       this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
        if (sched.monthly <= 100) {
          this.toasterService.alert('info', 'Cannot Proccess. Amount must be greater than 100.');
          return;
        }
    }

    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
        this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
      this.navigationService.toPaymentOtherPaypal(sched.id, Utils.PAYMENT_TYPE.layaway);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {
        // Is Paymongo Endpoint
      var isPaymongo = JSON.parse(localStorage.getItem(Utils.LS_ISPAYMONGO)) == true
      if (isPaymongo) {
        this.navigationService.toPaymentOtherCreditCardPaymongo(sched.id, Utils.PAYMENT_TYPE.layaway);
      } else  this.navigationService.toPaymentOtherCreditCard(sched.id, Utils.PAYMENT_TYPE.layaway);

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
    if (sched.paymongoStatus == 2) {
      this.toasterService.alert('info', 'Your payment is on process.');
      return;
    }
    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay ||
      this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GCash ||
      this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
        if (sched.amount <= 100) {
          this.toasterService.alert('info', 'Cannot Proccess. Amount must be greater than 100.');
          return;
        }
    }

    if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
        this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
      this.navigationService.toPaymentOtherPaypal(sched.id, Utils.PAYMENT_TYPE.preOrder);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {

      // Is Paymongo Endpoint
    var isPaymongo = JSON.parse(localStorage.getItem(Utils.LS_ISPAYMONGO)) == true
    if (isPaymongo) {
      this.navigationService.toPaymentOtherCreditCardPaymongo(sched.id, Utils.PAYMENT_TYPE.preOrde)
    } else this.navigationService.toPaymentOtherCreditCard(sched.id, Utils.PAYMENT_TYPE.preOrder);

    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GCash ||
               this.order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
      this.navigationService.toPaymentOtherGCash(sched.id, Utils.PAYMENT_TYPE.preOrder);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay) {
      this.navigationService.toPaymentOtherGrabPay(sched.id, Utils.PAYMENT_TYPE.preOrder);
    } else if (this.order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.OnlineBanking) {
      this.navigationService.toPaymentOtherOnlineBankingPaymongo(sched.id, Utils.PAYMENT_TYPE.layaway);
    }
  }

  updatePaymentLayawaySchedule(layaway: LayAwaySchedule) {
    this.paymentService.updatePaymentLayawaySchedule(layaway).then(() => {
      this.toasterService.alert('success', 'save successfuly');
    }).catch((error) => {
      this.toasterService.alert('danger', error.statusText);
    });

  }
}
