import { Component, OnInit, OnDestroy } from '@angular/core';
import { Order } from 'src/app/classes/order';
import { DataService } from 'src/app/services/data.service';
import { Utils } from 'src/app/app.utils';
import { utils } from 'protractor';
import { NavigationService } from 'src/app/services/navigation.service';
import { OrderService } from 'src/app/services/order.service';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { IpService } from 'src/app/services/ip.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { Discount } from 'src/app/classes/discount';
import { Cart } from 'src/app/classes/cart';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { ProductService } from 'src/app/services/product.service';
import { Subscription } from 'rxjs';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-client-order',
  templateUrl: './client-order.component.html',
  styleUrls: ['./client-order.component.scss']
})
export class ClientOrderComponent implements OnInit {
  orders: Array<Order>;
  ordersSubscription: any;
  statusList: any;
  paymentStatusList: any;
  order: Order;
  userIp: string;
  user: User;
  ipAddress: string;
  filter: FilterSetting;
  config: any;
  PayNowEnable: boolean;
  selectedIP: Subscription;
  // public viewContentInfo = false;
  constructor(
    private dataService: DataService,
    private navigationService: NavigationService,
    private orderService: OrderService,
    private userService: UserService,
    private ipService: IpService,
    private productService: ProductService,
    private toasterService: ToasterService) {

    this.orders = new Array<Order>();
    this.statusList = Utils.ORDER_STATUS;
    this.paymentStatusList = Utils.PAYMENT_STATUS;
    this.order = new Order();
    this.userIp = '';
    this.user = new User();

    this.filter = new FilterSetting();

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.orders.length
    };

    this.selectedIP = new Subscription();
  }

  ngOnInit() {
    // this.viewContentInfo = false;
    // this.checkUser();
    this.loadAll();
  }
  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          this.checkUser(this.ipAddress);
        }
      }

    });
  }

  checkUser(ipAddress: string) {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        if (!Utils.isNullOrUndefined(success)) {
          this.user = success;
          this.userIp = this.user.id.toString().concat('-', ipAddress);
          this.getOrders(this.userIp);
        }
      }, (error) => {
        console.log(error.error);
      });
    }

  }

  // subscribeUser(ipAddress: string) {
  //   this.dataService.user$.subscribe(next => {
  //     this.user = next;
  //     this.userIp = this.user.id.toString().concat('-', ipAddress);
  //     this.getOrders(this.userIp);
  //   })
  // }

  getOrders(userIp: string) {

    // this.ordersSubscription = this.dataService.selectedClientOrders$.subscribe((orders: Array<Order>) => {

    //   if (!Utils.isNullOrUndefined(orders)) {
    //     this.orders = orders;
    //     console.log(this.orders);
    //   }

    // });
    this.filter.limit = 99999999;
    this.filter.searchInput = this.userIp;
    this.orderService.getOrdersByUserId(this.filter).then((orders: Array<Order>) => {
      if (orders != null) {
        this.orders = orders;
        this.orders.map((ord: Order) => {
          ord.layaway = ord.orderCart.filter(x => x.isLayAway).length >= 1 ? true : false;
          ord.withPreOrder = ord.orderCart.filter(x => x.preOrder).length >= 1 ? true : false;
          ord.preOrderLayaway = ord.orderCart.filter(x => x.preOrderLayaway).length >= 1 ? true : false;
          if (ord.preOrderLayaway) {
            ord.withPreOrder = true;
          }
          ord.trackingUrl = ord.shippingDetails.trackingUrl;

          if (ord.paymentStatusId === 1 && ord.statusId === 5) {
            ord.paynowEnable = false;
          } else if (ord.paymentStatusId === 1 && ord.statusId <= 3) {
            ord.paynowEnable = true;
          } else {
            ord.paynowEnable = false;
          }
          // ord.paynowEnable = ord.paymentStatusId == 1 && ord.statusId != 4 ? true : false;
          if (ord.paynowEnable) {
            if ((ord.paymentMethodName.indexOf('Bank') !== -1 || ord.paymentMethodName.indexOf('OTC') !== -1) && ord.paymentMethodName !== Utils.ONLINE_PAYMENT.OnlineBanking) {
              ord.paynowEnable = false;
            }

          }

          let preOrderSum = 0;
          for (const pre of ord.orderCart.filter(x => x.preOrder)) {
            preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
          }
          for (const pre of ord.orderCart.filter(x => x.preOrderLayaway && !x.isLayAway)) {
            preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
          }

          ord.totalPrice = preOrderSum > 0 ? (preOrderSum - ord.shippingDetails.discountAmount) + ord.shippingDetails.shippingAmount
            : ord.totalPrice;
          // let amountToPay = 0;
          // let nonRefundDepositTotal = 0;
          // let selectedDiscount = new Discount();
          // ord.orderCart.map((crt: Cart) => {

          //   if (crt.isLayAway && !Utils.isNullOrUndefined(crt.layAwaySchedule)) {
          //     nonRefundDepositTotal = 0;
          //     crt.layAwaySchedule.map((sched: LayAwaySchedule) => {
          //       if (sched.isNonRefundDeposit && sched.productId == crt.product.id) {
          //         nonRefundDepositTotal += sched.monthly;
          //       }
          //     });
          //   }
          //   amountToPay = crt.isLayAway ? amountToPay + nonRefundDepositTotal : amountToPay + crt.totalAmount;
          // });

          // if (!Utils.isNullOrUndefined(ord.shippingDetails.discountCode)) {
          //   this.productService.getAllDiscountByCode(ord.shippingDetails.discountCode).then((discount: Discount) => {
          //     if (discount !== null) {
          //       selectedDiscount = discount;
          //     } else {
          //       selectedDiscount = new Discount();
          //     }

          //     const orderBreakDown = this.orderService.computeOrderBreakDown(ord, selectedDiscount, amountToPay);
          //     ord.shippingAmount = orderBreakDown.shippingAmount;
          //     ord.totalPrice = orderBreakDown.totalPrice;
          //     ord.discountAmount = orderBreakDown.discountAmount;
          //     ord.amountToPay = orderBreakDown.amountToPay;
          //   });
          // } else {
          //   selectedDiscount = new Discount();
          //   const orderBreakDown = this.orderService.computeOrderBreakDown(ord, selectedDiscount, amountToPay);
          //   ord.shippingAmount = orderBreakDown.shippingAmount;
          //   ord.totalPrice = orderBreakDown.totalPrice;
          //   ord.discountAmount = orderBreakDown.discountAmount;
          //   ord.amountToPay = orderBreakDown.amountToPay;
          // }
          // else if (ord.paymentStatusId === 3) {
          //   ord.paynowEnable = false;
          // }
          // else if (ord.paymentMethodName.indexOf('Bank') === 0 && ord.paymentStatusId < 3) {
          //   ord.paynowEnable = false;
          // }
          // else if (ord.statusId === 5) {
          //   ord.paynowEnable = false;
          // }
        });

      }
    });
  }

  getStatus(statusId: any): string {
    let status = '';
    this.statusList.filter(x => x.id === statusId).map((st: any) => {
      status = st.description;
    });
    return status;
  }

  getPaymentStatus(statusId: any): string {
    let paymentStatus = '';
    this.paymentStatusList.filter(x => x.id === statusId).map((st: any) => {
      paymentStatus = st.description;
    });
    return paymentStatus;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }
  // viewOrder(order: Order) {
  //   const info = order != null ? order : new Order();
  //   this.dataService.setOrder(info);
  //   this.viewContentInfo = true;
  // }

  // cancelViewContentInfo($event: any) {
  //   if ($event != null) {
  //     this.viewContentInfo = $event;
  //   }
  // }

  payNow(order: Order) {
    if (order.paymongoStatus === 2) {
      this.toasterService.alert('info', 'Your payment is on process.');
      return;
    }

    if (order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
        order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
      this.navigationService.toPaymentPaypal(order.securityId);
    } else if (order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {

      // Is Paymongo API
      var isPaymongo = JSON.parse(localStorage.getItem(Utils.LS_ISPAYMONGO)) == true
      if (isPaymongo) {
        this.navigationService.toPaymentCreditCardPaymongo(order.securityId)
      } else  this.navigationService.toPaymentCreditCard(order.securityId);
      
    } else if (order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCash.toLowerCase() ||
        order.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
      this.navigationService.toPaymentGcash(order.securityId);
    } else if (order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay) {
      this.navigationService.toPaymentGrabPay(order.securityId);
    } else if (order.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.OnlineBanking) {
      this.navigationService.toPaymentOnlineBankingPaymongo(order.securityId);
    }else {
      this.navigationService.toOrderComplete(order.id);
    }
  }

  toClientOrderInfo(order: Order) {

    this.navigationService.toClientOrderInfo(order);
  }

  review(order: Order) {
    this.navigationService.toCustomerOrderReviews(order);
  }

}

