import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cart } from 'src/app/classes/cart';
import { CartService } from 'src/app/services/cart.service';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/classes/user';
import { environment } from 'src/environments/environment';
import { LayAwayService } from 'src/app/services/layaway.service';
import { LayAway } from 'src/app/classes/layaway';
import { LayAwayDates } from 'src/app/classes/layaway-date';
import { Utils } from 'src/app/app.utils';
import { ToasterService } from 'src/app/services/toaster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/classes/product';
import { Shipping } from 'src/app/classes/shipping';
import { ProductService } from 'src/app/services/product.service';
import { Discount } from 'src/app/classes/discount';
import { NavigationService } from 'src/app/services/navigation.service';
import { IpService } from 'src/app/services/ip.service';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { Subscription } from 'rxjs';
import { ShippingService } from 'src/app/services/shipping.service';
import { ShippingDetails } from 'src/app/classes/shipping-details';
import { ShippingAddress } from 'src/app/classes/shipping-address';
import { PaymentMethod } from 'src/app/classes/payment-method';

@Component({
  selector: 'app-shipping-page',
  templateUrl: './shipping-page.component.html',
  styleUrls: ['./shipping-page.component.scss']
})
export class ShippingPageComponent implements OnInit, OnDestroy {
  cart: Cart[];
  user: User;
  productPrice: number;
  sumTotalPrice = 0;
  cartTotalPrice: number;
  productFolder: string;
  layAway: LayAway;
  layAwayDates: Array<LayAwayDates>;
  daysList: any;
  isGuest: boolean;
  isShipMethod: boolean;
  shippingAmount: number;
  activeShipping: Shipping;
  shippingSubscribe: any;
  discountCode: string;
  selectedDiscount: Discount;
  discountAmount: number;
  amountToPay: number;
  trnRtFee: number;
  insuranceFee: number;
  fnlAmtTp: number;
  isWithLayAway: boolean;
  ipAddress: string;
  layAwaySchedule: Array<LayAwaySchedule>;
  disableDiscount: boolean;
  selectedIP: Subscription;
  discountNoteEnable: boolean;
  isWithPreOrder: boolean;
  activeShippingDetails: ShippingDetails;
  selectedShipping: Subscription;
  selectedPaymentMethod: Subscription;
  selectedShippingAddress: Subscription;
  selectedInstruction: Subscription;
  hasLayaway: boolean;
  constructor(
    private cartService: CartService,
    private toasterService: ToasterService,
    private dataService: DataService,
    private router: Router,
    private layAwayService: LayAwayService,
    private navigationService: NavigationService,
    private productService: ProductService,
    private ipService: IpService,
    private shippingService: ShippingService) {
    this.cart = new Array();
    this.user = new User();
    this.layAway = new LayAway();
    this.layAwayDates = new Array();
    this.daysList = new Array();
    this.activeShipping = new Shipping();
    this.selectedDiscount = new Discount();
    this.layAwaySchedule = new Array();
    this.ipAddress = '';
    this.discountCode = '';
    this.selectedIP = new Subscription();
    this.activeShippingDetails = new ShippingDetails();

    this.selectedShipping = new Subscription();
    this.selectedPaymentMethod = new Subscription();
    this.selectedShippingAddress = new Subscription();
    this.selectedInstruction = new Subscription();
    this.shippingSubscribe = new Subscription();
  }

  ngOnInit() {
    this.loadAll();

  }

  ngOnDestroy() {
    this.selectedShipping.unsubscribe();
    this.selectedPaymentMethod.unsubscribe();
    this.selectedShippingAddress.unsubscribe();
    this.selectedInstruction.unsubscribe();
    this.shippingSubscribe.unsubscribe();
  }

  subscribeUser() {
    this.dataService.user$.subscribe(next => {
      this.user = next;
      this.cartService.getCarts(this.user, this.ipAddress);
    });
  }

  loadCart() {

    this.shippingSubscribe = this.dataService.productCart$.subscribe((carts: any) => {
      this.loadItemCart(carts);
    });

  }
  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          this.productFolder = environment.productFolderPath;
          this.subscribeUser();
          this.loadCart();

          this.router.events.subscribe((val: any) => {
            if (val.hasOwnProperty('state')) {
              if (val.state._root.value._routerState.url !== '/Shipping/information/shipping-method' ||
                val.state._root.value._routerState.url !== '/Shipping/information/shipping-method/payment'
              ) {
                this.isShipMethod = true;
              } else {
                this.isShipMethod = false;
              }
            }

          });
          this.selectedShipping = this.dataService.selectedShippingAddress$.subscribe((address: any) => {
            if (address.hasOwnProperty('address')) {
              for (const keys of Object.keys(address)) {
                this.activeShippingDetails[keys] = Object.assign(address)[keys];
              }
              this.setShippingDetails();
            }
          });

          this.selectedPaymentMethod = this.dataService.selectedPaymentMethod$.subscribe((pmethod: any) => {
            if (pmethod.hasOwnProperty('description')) {
              this.activeShippingDetails.paymentMethod = pmethod.id;
              this.activeShippingDetails.paymentMethodDetails = pmethod;
              this.computeTotal();
            }
          });
          this.selectedShipping = this.dataService.selectedShipping$.subscribe((shipping: any) => {
            if (shipping.hasOwnProperty('description')) {
              this.activeShipping = shipping;
              this.activeShippingDetails.shippingMethodDetails = shipping;
              this.activeShippingDetails.shippingMethodDescription = shipping.description;
              this.activeShippingDetails.shippingMethod = this.activeShipping.id;
              this.activeShippingDetails.trackingUrl = this.activeShipping.trackingUrl;
              this.activeShippingDetails.shippingName = this.activeShipping.shippingName;
              this.computeTotal();

            }
          });
          this.selectedInstruction = this.dataService.selectedSpecialInstruction$.subscribe((inst) => {
            this.activeShippingDetails.specialInstruction = inst;
            this.setShippingDetails();
          });
        }
      }

    });
  }

  loadItemCart(cart) {
    Object.assign(this.layAway, this.dataService.allLayAway);
    this.cart = cart;
    this.isWithLayAway = this.cart.filter(x => x.isLayAway).length >= 1 ? true : false;
    this.isWithPreOrder = this.cart.filter(x => x.product.preOrder).length >= 1 ? true : false;
    const parent = this;
    this.sumTotalPrice = 0;
    this.cartTotalPrice = 0;
    let productPrice = 0;
    this.hasLayaway = false;
    this.cart.map((crt: Cart) => {
      const totalPrice = (crt.product.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) ? crt.product.preOrderDepositAmount
        : (crt.product.onSale ? crt.product.salesPrice : crt.product.price);

      crt.totalPrice = totalPrice;
      crt.totalAmount = (totalPrice * crt.quantity);
      productPrice = crt.product.onSale ? crt.product.salesPrice : crt.product.price;

      parent.sumTotalPrice = parent.sumTotalPrice + (totalPrice * crt.quantity);
      parent.cartTotalPrice += (productPrice * crt.quantity);

      if (crt.hasRushFee) {
        crt.totalPrice = crt.totalPrice + (crt.product.rushFee * crt.quantity);
        parent.sumTotalPrice += (crt.product.rushFee * crt.quantity);
        parent.cartTotalPrice += (crt.product.rushFee * crt.quantity);
      }

      const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
        ? crt.product.productImages.find(x => x.isDefaultImage) :
        crt.product.productImages[0];
      crt.product.currentImageUrl = this.productFolder + currentImage.fileName;

      if (crt.isLayAway || crt.product.onSale) {
        this.discountNoteEnable = true;
      }

      // if(!this.activeShippingDetails.hasMinimumAmount) {
      //     if(crt.totalAmount <= 100)
      //     this.activeShippingDetails.hasMinimumAmount = true
      // }

      if (crt.isLayAway) {
        this.hasLayaway = true;
        // this.disableDiscount = true;
        this.layAway.maxNumberOfInstallmentPayment = crt.numberOfInstallment;
        this.layAway.datesOfPayment = crt.datesOfPayment;
        crt.layAway = this.layAwayService.getLayAwayDetails(this.layAway, crt.product, crt.quantity);
        crt.layAwaySchedule = this.layAwayService.getLayAwaySchedule(this.layAway, crt.layAway.monthly, crt.layAway);
        crt.layAwaySchedule.forEach((sched) => {
          sched.productId = crt.product.id;

          if (!this.activeShippingDetails.hasMinimumAmount) {
              if (sched.monthly <= 100) {
              this.activeShippingDetails.hasMinimumAmount = true;
              }
          }
        });

        this.daysList.push({
          id: crt.datesOfPayment,
          value: Utils.numericSuffix(crt.datesOfPayment) + ' of the month'
        });
      }
      if (crt.product.preOrder || (!crt.isLayAway && crt.product.preOrderLayaway)) {
        this.disableDiscount = true;
        crt.preOrderSchedule = this.productService.generatePreOrderSchedule(crt.product.price, crt.product.preOrderDepositAmount,
          this.shippingAmount, crt.product.id, crt.quantity);
        if (crt.hasRushFee) {
          crt.totalAmount += crt.rushFee;
        }
        for (const pre of crt.preOrderSchedule) {
          if (!this.activeShippingDetails.hasMinimumAmount) {
              if (pre.amount <= 100) {
               this.activeShippingDetails.hasMinimumAmount = true;
              }
          }
        }
      }


    });

    if (this.cart.filter(x => !x.isLayAway && !x.product.onSale).length === 0
      && this.cart.filter(x => x.isLayAway || x.product.onSale).length > 0) {
      this.disableDiscount = true;
    }
    let total = 0;

    for (const itm of this.cart) {
      total += Number(itm.quantity);
    }

    this.cart.map((cr) => {
      cr.cartCount = total;
    });
    this.computeTotal();
  }



  computeTotal() {
    const qty = this.cart.reduce((a, b) => {
      return a + b.quantity;
    }, 0);


    let insurance = 0;
    if (this.activeShippingDetails.hasInsurance) {
      insurance = this.shippingService.computeShippingInsurance(this.cartTotalPrice, this.activeShipping);
    }
    const shipping = this.shippingService.computeShippingBreakDown(this.activeShipping, qty);
    const breakDown = this.shippingService.computeTotalBreakDown(this.cart,
        shipping.amount,
        this.selectedDiscount,
        this.activeShippingDetails.paymentMethodDetails,
        insurance);

    this.productPrice = breakDown.subTotal;
    this.shippingAmount = breakDown.shippingAmount;
    this.sumTotalPrice = breakDown.totalAmount;
    this.discountAmount = breakDown.discountAmt;
    this.amountToPay = breakDown.amountToPay;
    this.trnRtFee = breakDown.trnRtFee;
    this.insuranceFee = breakDown.insurance;
    this.fnlAmtTp = breakDown.fnlAmtTp;

    this.activeShippingDetails.discountAmount = breakDown.discountAmt;
    this.activeShippingDetails.shippingAmount = breakDown.shippingAmount;
    this.activeShippingDetails.subTotal = breakDown.subTotal;
    this.activeShippingDetails.amountToPay = breakDown.amountToPay;
    this.activeShippingDetails.total = breakDown.totalAmount;
    this.activeShippingDetails.transactionFee = breakDown.trnRtFee;
    this.activeShippingDetails.insuranceFee = breakDown.insurance;
    this.activeShippingDetails.finalAmount = breakDown.fnlAmtTp;

    const amt = this.hasLayaway ? breakDown.amountToPay : this.sumTotalPrice;

    if (!this.activeShippingDetails.hasMinimumAmount) {
      if (amt <= 100) {
      this.activeShippingDetails.hasMinimumAmount = true;
      }
    }

    this.setShippingDetails();

  }

  setShippingDetails() {
    this.dataService.setActiveShippingDetails(this.activeShippingDetails);
  }

  applyDiscount() {
    const origDate = new Date().toISOString().split('T')[0];

    if (this.discountCode === '') {
      this.selectedDiscount = new Discount();
      this.discountAmount = 0;
      this.activeShippingDetails.discountAmount = 0;
      this.activeShippingDetails.discountCode = '';
      this.activeShippingDetails.discount = this.selectedDiscount;
      this.computeTotal();
    } else {
      this.productService.getAllDiscountByCode(this.discountCode).then((discount: Discount) => {
        if (discount !== null) {
          const startDate = new Date(discount.startDate.toString().split('T')[0]);
          const endDate = new Date(discount.endDate.toString().split('T')[0]);
          const currDate = new Date(origDate);
          if (!discount.isActive || !(startDate <= currDate && currDate <= endDate)) {
            this.toasterService.alert('error', 'Invalid Discount Code');
            this.selectedDiscount = new Discount();
          } else {
            this.selectedDiscount = discount;
          }
        } else {
          this.selectedDiscount = new Discount();
          this.toasterService.alert('error', 'Invalid Discount Code');
        }

        this.activeShippingDetails.discountCode = this.selectedDiscount.code;
        this.activeShippingDetails.discount = this.selectedDiscount;

        this.computeTotal();
      }).catch(() => {
        this.toasterService.alert('error', 'Invalid Discount Code');
      });
    }

  }



  toCart() {
    this.navigationService.toCart();
  }
}
