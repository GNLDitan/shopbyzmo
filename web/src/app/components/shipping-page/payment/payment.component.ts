import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ShippingDetails } from 'src/app/classes/shipping-details';
import { Shipping } from 'src/app/classes/shipping';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ShippingService } from 'src/app/services/shipping.service';
import { DataService } from 'src/app/services/data.service';
import { Validators, FormBuilder } from '@angular/forms';
import { ValidatorService } from 'src/app/services/validator.service';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymentMethod } from 'src/app/classes/payment-method';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/classes/order';
import { NavigationService } from 'src/app/services/navigation.service';
import { Cart } from 'src/app/classes/cart';
import { CartService } from 'src/app/services/cart.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { IpService } from 'src/app/services/ip.service';
import { environment } from 'src/environments/environment';
import { Discount } from 'src/app/classes/discount';
import { ProductService } from 'src/app/services/product.service';
import { CurrencyPipe, DOCUMENT } from '@angular/common';
import { Utils } from 'src/app/app.utils';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { NgxSpinnerService } from 'ngx-spinner';
import { utils } from 'protractor';
import { Subscription } from 'rxjs';
import { ShippingAddress } from 'src/app/classes/shipping-address';
import { DatePipe } from '@angular/common';
import { CurrenyService } from 'src/app/services/currency.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  shippingMethodForm: any;
  shippingDetails: ShippingDetails;
  shippings: Array<Shipping>;
  filter: FilterSetting;
  modeOfPayments: Array<PaymentMethod>;
  order: Order;
  cart: Cart[];
  ipAddress: string;
  productFolder: string;
  selectedDiscount: Discount;
  layAwaySchedule: Array<LayAwaySchedule>;
  selectedIP: Subscription;
  selectedShippingDetails: Subscription;
  cartSubscribe: Subscription;
  hasMinimum: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private validatorService: ValidatorService,
    private shippingService: ShippingService,
    private activeRoute: ActivatedRoute,
    private paymentService: PaymentService,
    private navigationService: NavigationService,
    private orderService: OrderService,
    private cartService: CartService,
    private toasterService: ToasterService,
    private ipService: IpService,
    private SpinnerService: NgxSpinnerService,
    private datePipe: DatePipe,
    private currencyService: CurrenyService,
    @Inject(DOCUMENT) private document) {

    this.modeOfPayments = new Array();
    this.filter = new FilterSetting();
    this.order = new Order();
    this.shippingMethodForm = this.formBuilder.group({
      id: [0],
      completeName: [''],
      shippingAddress: [''],
      email: ['', [Validators.required, validatorService.emailValidator]],
      mobileNumber: ['', [Validators.required]],
      shippingMethodDescription: ['', [Validators.required]],
      specialInstruction: ['', []],
      shippingName: ['', []],
      numCode: ['+63', Validators.required]
    });
    this.shippings = new Array();
    this.shippingDetails = new ShippingDetails();
    this.cart = new Array();
    this.productFolder = environment.productFolderPath;
    this.selectedDiscount = new Discount();
    this.layAwaySchedule = new Array();
    this.selectedIP = new Subscription();
    this.selectedShippingDetails = new Subscription();
    this.cartSubscribe = new Subscription();
  }

  ngOnInit() {
    this.loadAll();

  }

  ngOnDestroy() {
    this.selectedShippingDetails.unsubscribe();
    this.cartSubscribe.unsubscribe();
  }


  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          // this.ipAddress = ipAddress;
          // const id = this.activeRoute.snapshot.params.id;
          // this.shippingService.getShippingDetailsById(id).then((shipping: any) => {
          //   this.shippingDetails = shipping;
          //   const address = shipping.address.concat(' ')
          //     .concat(shipping.barangay).concat(' ')
          //     .concat(shipping.city).concat(' ')
          //     .concat(shipping.province).concat(' ')
          //     .concat(shipping.zipCode.toString()).concat(', ')
          //     .concat(shipping.countryCode);

          //   this.shippingMethodForm.patchValue(shipping);
          //   this.shippingMethodForm.controls.shippingAddress.setValue(address);

          //   this.dataService.setActiveShippingDetails(shipping);
          // });

          // this.dataService.selectedDiscount$.subscribe((discount: any) => {
          //   if (discount.hasOwnProperty('id')) {
          //     this.selectedDiscount = discount;
          //   }
          // });

          this.cartSubscribe = this.dataService.productCart$.subscribe((carts: any) => {
            this.cart = carts;
          });

          this.selectedShippingDetails = this.dataService.selectedShippingDetails$.subscribe((shipping: any) => {
            this.shippingDetails = shipping;
            const mobile = shipping.numCode + shipping.mobileNumber;
            const address = shipping.address.concat(' ')
              .concat(shipping.barangay).concat(' ')
              .concat(shipping.city).concat(' ')
              .concat(shipping.province).concat(' ')
              .concat(shipping.zipCode.toString()).concat(', ')
              .concat(shipping.countryCode);
            this.hasMinimum = shipping.hasMinimumAmount;
            this.shippingMethodForm.patchValue(shipping);
            this.shippingMethodForm.controls.mobileNumber.setValue(mobile);
            this.shippingMethodForm.controls.shippingAddress.setValue(address);
          });

          this.loadPayments();
        }
      }

    });
  }
  loadPayments() {
    this.filter.limit = 9999999;
    const parent = this;
    this.paymentService.getCheckoutPaymentMethodListRange(this.filter).then((result: any) => {
      if (!Utils.isNullOrUndefined(result)) {
        this.modeOfPayments = result;

        if (this.shippingDetails.paymentMethod > 0) {
          this.modeOfPayments.map((mod: any) => {
            mod.isSelected = mod.id === this.shippingDetails.paymentMethod;
          });
        } else {
          if (this.modeOfPayments.length > 0) {
            this.modeOfPayments[0].isSelected = true;
            this.dataService.setPaymentMethod(this.modeOfPayments[0]);
          }
        }

        this.modeOfPayments.map((mod: any) => {
          if (mod.name == 'GCash' || mod.name == 'GrabPay' ) {
              mod.hasMinimumAmount = parent.hasMinimum;
          }
        });
      }

    });
  }

  selectedPayments(payment: PaymentMethod) {
    this.shippingDetails.paymentMethod = payment.id;
    this.shippingDetails.emailInstruction = payment.emailInstruction;
    this.shippingDetails.paymentMethodDetails = payment;
    this.dataService.setPaymentMethod(payment);
  }


  completeOrder() {
    this.validateProducts();

  }
  convert(value: number) {
    return this.currencyService.priceConvert(value);
  }

  updateOrder() {
    let subTotal = 0;
    let shippingAmount = 0;
    subTotal = this.shippingDetails.subTotal;
    shippingAmount = this.shippingDetails.rate;
    this.order.dateOrder = new Date();
    this.order.shippingId = this.shippingDetails.id;
    this.order.statusId = 1;
    this.order.paymentStatusId = 1;
    this.order.orderCart = this.cart;
    this.order.ipAddress = this.ipAddress;
    this.order.shippingDetails = this.shippingDetails;
    this.order.isEmailSubscribe = this.shippingDetails.isEmailSubscribe;
    this.order.orderCart.map((crt: Cart) => {


      const totalPrice = crt.product.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway) ? crt.product.preOrderDepositAmount : (crt.product.onSale
        ? crt.product.salesPrice : crt.product.price);

      crt.totalPrice = totalPrice;
      crt.totalAmount = (totalPrice * crt.quantity);
      crt.paymentDates = this.getDays(crt.datesOfPayment);
      crt.onSale = crt.product.onSale;
      crt.price = (crt.product.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) ? crt.product.preOrderDepositAmount : crt.product.price;
      crt.salesPrice = crt.product.salesPrice;
      crt.preOrder = crt.product.preOrder;
      crt.origPrice = crt.product.price;
      crt.preOrderLayaway = crt.product.preOrderLayaway;

      if (crt.isLayAway) {
        crt.layAwaySchedule.map((sched: LayAwaySchedule) => {
          sched.date = new Date(Date.UTC(sched.date.getFullYear(), sched.date.getMonth(), sched.date.getDate()));
        });

      }

    });
    this.order.shippingAmount = this.shippingDetails.shippingAmount;
    this.order.insuranceFee = this.shippingDetails.insuranceFee;
    this.order.totalPrice = this.shippingDetails.total;
    this.order.discountAmount = this.shippingDetails.discountAmount;
    this.order.amountToPay = this.shippingDetails.amountToPay;
    this.order.transactionFee = this.shippingDetails.transactionFee;
    this.order.finalAmount = this.shippingDetails.finalAmount;
  }


  changeSpecialInstruction() {
    this.dataService.setSpecialInstruction(this.shippingMethodForm.controls.specialInstruction.value);
  }
  getDays(paymentDay: any) {
    return Utils.numericSuffix(paymentDay) + ' of the month';
  }
  validateProducts() {
    let isValid = false;
    this.SpinnerService.show();

    this.shippingDetails.paymentMethod = this.shippingDetails.paymentMethod === 0
      ? this.modeOfPayments.find(x => x.isSelected).id : this.shippingDetails.paymentMethod;
    this.shippingDetails.emailInstruction = Utils.isNullOrUndefined(this.shippingDetails.emailInstruction)
      || this.shippingDetails.emailInstruction === ''
      ? this.modeOfPayments.find(x => x.isSelected).emailInstruction : this.shippingDetails.emailInstruction;


    this.cartService.valdiateProduct(this.shippingDetails.userId).then((valid: any) => {
      isValid = valid;

      if (!isValid) {
        // tslint:disable-next-line: max-line-length
        this.toasterService.alert('warning', 'It seems like one or more items in your cart are now out of stock. Please refresh you cart to check the availability of the items.');
        this.SpinnerService.hide();
        return;
      } else {
        // if with discount applied on complete order
        // if (this.selectedDiscount.id > 0) {
        //   let amountToBeDiscounted = 0;
        //   let discount = 0;
        //   this.cart.map((crt: Cart) => {
        //     if (!crt.product.onSale && !crt.isLayAway) {
        //       amountToBeDiscounted = amountToBeDiscounted + crt.totalAmount;
        //     }
        //   });

        //   discount = this.selectedDiscount.amountTypeId === 1 ? this.selectedDiscount.amount
        //     : amountToBeDiscounted * (this.selectedDiscount.amount / 100);
        //   this.shippingDetails.total = this.cart.filter(x => x.preOrder).length > 0 ?
        //     (this.shippingDetails.subTotal - discount) : (this.shippingDetails.subTotal - discount) + this.shippingDetails.shippingAmount;

        //   this.shippingDetails.discountAmount = discount;
        //   this.shippingDetails.amountToPay = this.cart.filter(x => x.isLayAway).length > 0
        //     ? this.shippingDetails.amountToPay - discount : this.shippingDetails.total;

        // }

        if (this.shippingDetails.hasMinimumAmount &&
          (this.shippingDetails.paymentMethodDetails.name.trim() === Utils.ONLINE_PAYMENT.GrabPay ||
          this.shippingDetails.paymentMethodDetails.name.trim() === Utils.ONLINE_PAYMENT.GCash ||
          this.shippingDetails.paymentMethodDetails.name.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase() )
          ) {
          this.toasterService.alert('warning', 'Amount to Pay is not valid for Gcash/Grabpay payment, minimum amount is 100 pesos.');
          this.SpinnerService.hide();
          return;
        }
        this.shippingService.createShippingDetails(this.shippingDetails).then((shipping: any) => {
          this.shippingDetails.id = shipping.id;
          this.updateOrder();
          this.orderService.createOrder(this.order).then((result: Order) => {

            if (result.hasOwnProperty('id')) {
              try {
                if (result.id > 0) {
                  result.layaway = this.order.orderCart.filter(x => x.isLayAway).length >= 1 ? true : false;

                  result.withPreOrder = this.order.orderCart.filter(x => x.product.preOrder).length >= 1 ? true : false;
                  if (!result.withPreOrder) {
                    result.withPreOrder = this.order.orderCart.filter(x => (x.preOrderLayaway && !x.isLayAway)).length >= 1 ? true : false;
                  }

                  result.shippingDetails = this.shippingDetails;

                  this.order.orderCart.map((crt: Cart) => {
                    const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
                      ? crt.product.productImages.find(x => x.isDefaultImage) :
                      crt.product.productImages[0];
                    crt.product.currentImageUrl = currentImage.fileName;
                    const totalPrice = crt.onSale && !(crt.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) ?
                                        crt.salesPrice : crt.price;
                    crt.totalPrice = totalPrice;

                    crt.totalAmount = crt.product.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway) ?
                          (crt.product.price * crt.quantity) + crt.rushFee : (totalPrice * crt.quantity);

                    // pre order with rush fee display in email
                    if (crt.product.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) {
                      crt.preOrderSchedule.map((sched) => {
                        if (sched.paymentTerm === 'DP') {
                          sched.dpWithRushFee = sched.amount + crt.rushFee;
                          sched.amount = sched.dpWithRushFee;
                        }

                      });
                    }
                  });

                  let preOrderSum = 0;
                  for (const pre of this.order.orderCart.filter(x => x.preOrder)) {
                    preOrderSum = preOrderSum + (pre.product.price * pre.quantity) + pre.rushFee;
                  }

                  for (const pre of this.order.orderCart.filter(x => x.preOrderLayaway && !x.isLayAway)) {
                    preOrderSum = preOrderSum + (pre.product.price * pre.quantity) + pre.rushFee;
                  }

                  result.shippingDetails.subTotal = preOrderSum > 0 ? preOrderSum : result.shippingDetails.subTotal;

                  result.totalPrice = preOrderSum > 0 ? (preOrderSum - result.discountAmount) +
                        this.order.shippingAmount + this.order.insuranceFee : result.totalPrice;

                  result.orderCart = this.order.orderCart;

                  // conversion for email
                  result.orderCart.map((x) => {
                    x.totalAmount = this.convert(x.totalAmount);
                    x.totalPrice = this.convert(x.totalPrice);

                    if (x.layAway) {
                      x.layAwaySchedule.map((sched) => {
                        sched.monthly = this.convert(sched.monthly);
                      });
                    }

                    if (x.preOrder || (x.preOrderLayaway && !x.isLayAway)) {
                      x.preOrderSchedule.map((sched) => {
                        sched.amount = this.convert(sched.amount);
                      });
                    }
                  });
                  result.shippingDetails.subTotal = this.convert(result.shippingDetails.subTotal);
                  result.totalPrice = this.convert(result.totalPrice);
                  result.amountToPay = this.convert(this.order.amountToPay);
                  result.shippingAmount = this.convert(this.order.shippingAmount);
                  result.discountAmount = this.convert(this.order.discountAmount);
                  result.insuranceFee = this.convert(this.order.insuranceFee);

                  // result.totalPrice = this.order.totalPrice;
                  result.forLayAway = false;
                  result.layAwayId = 0;
                  result.forPreOrder = false;
                  result.preOrderId = 0;
                  result.shippingDetails.emailInstruction = this.shippingDetails.emailInstruction;
                  // if (Utils.isNullOrUndefined(this.shippingDetails)) {
                  //   let div = this.document.createElement('div');
                  //   let len = 0;
                  //   div.innerHTML = this.shippingDetails.emailInstruction;
                  //   result.shippingDetails.emailInstruction = div.innerText;
                  // }

                  // for email purposes only
                  if (!Utils.isNullOrUndefined(result.paymentMethodName)) {
                    if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
                        result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
                      result.paymentStatusId = 2;
                    } else if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {
                      result.paymentStatusId = 2;
                    } else if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GCash ||
                                result.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
                      result.paymentStatusId = 2;
                    } else if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay) {
                      result.paymentStatusId = 2;
                    } else  if (result.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.OnlineBanking.toLowerCase()) {
                      this.navigationService.toPaymentOnlineBankingPaymongo(result.securityId);
                    }
                  }

                  this.orderService.sendOrderEmail(result).catch(() => {
                    // tslint:disable-next-line: max-line-length
                    this.toasterService.alert('warning', 'Order Successful but error in sending email, Please contact us to resend your email.');
                  });

                  this.orderService.sendAdminOrder(result).catch(() => {
                    // tslint:disable-next-line: max-line-length
                    this.toasterService.alert('warning', 'Order Successful but error in sending email to admin, Please contact us to resend your email.');
                  });



                  this.order.orderCart.map((crt: Cart) => {
                    const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
                      ? crt.product.productImages.find(x => x.isDefaultImage) :
                      crt.product.productImages[0];
                    crt.product.currentImageUrl = this.productFolder + currentImage.fileName;
                  });
                  this.SpinnerService.hide();
                  this.dataService.resetShippingOrderDetails();
                  if (!Utils.isNullOrUndefined(result.paymentMethodName)) {
                    this.dataService.setShipping(new Shipping());
                    this.dataService.setActiveShippingDetails(new ShippingDetails());
                    this.dataService.setShippingAddress(new ShippingAddress());
                    this.dataService.setPaymentMethod(new PaymentMethod());
                    if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.Paypal ||
                        result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.CreditCardPaypal) {
                      this.navigationService.toPaymentPaypal(result.securityId);
                    } else if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.DebitCreditCard) {
                      // Is Paymongo API
                      var isPaymongo = JSON.parse(localStorage.getItem(Utils.LS_ISPAYMONGO)) == true
                      if (isPaymongo) {
                        this.navigationService.toPaymentCreditCardPaymongo(result.securityId)
                      } else this.navigationService.toPaymentCreditCard(result.securityId);

                    } else if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GCash ||
                               result.paymentMethodName.trim().toLowerCase() === Utils.ONLINE_PAYMENT.GCashViaGcash.toLowerCase()) {
                      this.navigationService.toPaymentGcash(result.securityId);
                    } else if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.GrabPay) {
                      this.navigationService.toPaymentGrabPay(result.securityId);
                    } else  if (result.paymentMethodName.trim() === Utils.ONLINE_PAYMENT.OnlineBanking) {
                      this.navigationService.toPaymentOnlineBankingPaymongo(result.securityId);
                    } else {
                      this.navigationService.toOrderComplete(result.id);
                    }
                  }
                  // result.paymentMethodName = this.order.paymentMethodName;
                }

              } catch (error) {
                this.toasterService.alert('error', error);
              }

            }

          });
        });
      }

    });

  }

}
