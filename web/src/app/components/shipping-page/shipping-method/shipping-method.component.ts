import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/services/validator.service';
import { DataService } from 'src/app/services/data.service';
import { ShippingDetails } from 'src/app/classes/shipping-details';
import { concat, Subscription } from 'rxjs';
import { Shipping } from 'src/app/classes/shipping';
import { ShippingService } from 'src/app/services/shipping.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { NavigationService } from 'src/app/services/navigation.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/classes/order';
import { Discount } from 'src/app/classes/discount';
import { Cart } from 'src/app/classes/cart';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { Utils } from 'src/app/app.utils';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-shipping-method',
  templateUrl: './shipping-method.component.html',
  styleUrls: ['./shipping-method.component.scss']
})
export class ShippingMethodComponent implements OnInit, OnDestroy {
  shippingMethodForm: any;
  shippingDetails: ShippingDetails;
  shippings: Array<Shipping>;
  filter: FilterSetting;


  selectedDiscount: Discount;
  discountSubscription: any;
  activeShipping: Shipping;
  cart: Cart[];
  cartSubscribe: any;
  productPrice: number;
  sumTotalPrice: number;
  shippingAmount: number;
  discountAmount: number;
  amountToPay: number;
  selectedShippingDetails: Subscription;
  cartTotalPrice = 0;
  isInternational: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private validatorService: ValidatorService,
    private dataService: DataService,
    private shippingService: ShippingService,
    private navigationService: NavigationService,
    private toasterService: ToasterService) {

    this.filter = new FilterSetting();
    this.shippingMethodForm = this.formBuilder.group({
      completeName: [''],
      shippingAddress: [''],
      email: ['', [Validators.required, validatorService.emailValidator]],
      mobileNumber: ['', [Validators.required]],
      specialInstruction: [''],
      shippingMethod: ['', [Validators.required]]
    });
    this.shippings = new Array();
    this.shippingDetails = new ShippingDetails();
    this.selectedShippingDetails = new Subscription();

    this.selectedDiscount = new Discount();
    this.activeShipping = new Shipping();
    this.cart = new Array();
  }

  ngOnInit() {

    const parent = this;
    this.selectedShippingDetails = this.dataService.selectedShippingDetails$.subscribe((result: any) => {
      this.shippingDetails = result;
      this.isInternational = this.shippingDetails.countryCode !== Utils.LOCAL_COUNTRYCODE;
      this.dataService.user$.subscribe(next => {
        if (next.hasOwnProperty('email')) {
          this.shippingDetails.userId = next.id;
          // this.shippingAccountForm.controls.shippingAddressId.setValue(this.selectedAddress.id);
        }
      });
      if (result.hasOwnProperty('address')) {
        const mobile = result.numCode + result.mobileNumber;
        const address = result.address.concat(' ')
          .concat(result.barangay).concat(' ')
          .concat(result.city).concat(' ')
          .concat(result.province).concat(' ')
          .concat(result.zipCode.toString()).concat(', ')
          .concat(result.countryCode);

        this.shippingMethodForm.controls.shippingAddress.setValue(address);
        this.shippingMethodForm.controls.email.setValue(result.email);
        this.shippingMethodForm.controls.mobileNumber.setValue(mobile);
        this.shippingMethodForm.controls.completeName.setValue(result.completeName);
        this.shippingMethodForm.controls.specialInstruction.setValue(result.specialInstruction);
      }
    });

    // this.discountSubscription = this.dataService.selectedDiscount$.subscribe((discount: any) => {
    //   if (discount.hasOwnProperty('id')) {
    //     this.selectedDiscount = discount;
    //     this.computeTotal();
    //   }
    // });
    // this.dataService.selectedShipping$.subscribe((shipping: any) => {
    //   if (shipping.hasOwnProperty('description')) {
    //     this.activeShipping = shipping;
    //   }
    // });
    this.cartSubscribe = this.dataService.productCart$.subscribe((cart: any) => {
      for (const crt of cart) {
        const productPrice = crt.product.onSale ? crt.product.salesPrice : crt.product.price;
        parent.cartTotalPrice += (productPrice * crt.quantity);
        if (crt.hasRushFee) {
          parent.cartTotalPrice += (crt.product.rushFee * crt.quantity);
        }
      }
    });
    this.getShippingMethod();
  }

  ngOnDestroy() {
    this.selectedShippingDetails.unsubscribe();
  }


  // computeTotal() {
  //   const qty = this.cart.reduce((a, b) => {
  //     return a + b.cartCount;
  //   }, 0);

  //   const shipping = this.shippingService.computeShippingBreakDown(this.activeShipping, qty);
  //   const breakDown = this.shippingService.computeTotalBreakDown(this.cart, shipping.amount, this.selectedDiscount);

  //   this.productPrice = breakDown.subTotal;
  //   this.shippingAmount = breakDown.shippingAmount;
  //   this.sumTotalPrice = breakDown.totalAmount;
  //   this.discountAmount = breakDown.discountAmt;
  //   this.amountToPay = breakDown.amountToPay;
  // }


  getShippingMethod() {
    this.filter.limit = 9999999;
    this.shippingService.getShippingListRange(this.filter).then((shippings: Array<Shipping>) => {
      this.shippings = shippings.filter(x => x.isInternational === this.isInternational);
      if (this.shippingDetails.shippingMethod > 0) {
        this.shippings.map((ship: any) => {
          ship.isSelected = ship.id === this.shippingDetails.shippingMethod;

          if (ship.isSelected && this.shippingDetails.insuranceFee > 0) {
            ship.applyInsurance = true;
          }

          if (ship.id === this.shippingDetails.shippingMethod) {
            this.dataService.setShipping(ship);
            // this.computeTotal();
          }
        });
        if (this.shippings.filter(x => x.isSelected).length === 0) {
          this.shippings[0].isSelected = true;
          this.dataService.setShipping(this.shippings[0]);
        }
      } else {
        if (this.shippings.length > 0) {
          this.shippings[0].isSelected = true;
        }
        this.shippingDetails.shippingMethod = this.shippings[0].id;
        this.dataService.setShipping(this.shippings[0]);
        // this.computeTotal();
      }
    });
  }

  selectedShipping(shipping: any, event = null) {
    if (event == null) {
      this.shippingDetails.hasInsurance = false;
    } else {
      this.shippingDetails.hasInsurance = event.currentTarget.checked;
    }
    if (!this.hasInsurance(shipping)) {
      shipping.applyInsurance = false;
      if (!Utils.isNullOrUndefined(event)) {
        event.currentTarget.checked = false;
        this.toasterService.alert('warning', 'Total Item Amount not applicable for Shipping Insurance.');
        return;
      }
    }

    this.shippings.map((ship: any) => {
      if (shipping.id != ship.id) {
        ship.applyInsurance = false;
      }
    });


    this.shippingDetails.shippingMethod = shipping.id;
    this.shippingDetails.shippingMethodDescription = shipping.shippingName + ' ' + shipping.description;
    this.shippingDetails.shippingName = shipping.shippingName;
    this.shippingDetails.trackingUrl = shipping.trackingUrl;
    this.dataService.setActiveShippingDetails(this.shippingDetails);
    this.dataService.setShipping(shipping);
    // this.computeTotal();
  }

  changeSpecialInstruction() {
    this.dataService.setSpecialInstruction(this.shippingMethodForm.controls.specialInstruction.value);
  }

  hasInsurance(activeShipping) {
    const insurance = this.shippingService.computeShippingInsurance(this.cartTotalPrice, activeShipping);
    return activeShipping.hasInsurance ? insurance > 0 : true;
  }

  isLockShipping(shipping: Shipping): boolean {
    if (this.isInternational) {
      return !shipping.isInternational;
    } else {
      return shipping.isInternational;
    }

  }

  continuePayment() {
    if (this.shippings.length > 0) {
      const selected = this.shippings.filter(x => x.id === this.shippingDetails.shippingMethod)[0];
      if (this.isLockShipping(selected)) {
        this.toasterService.alert('warning', 'Invalid selected shipping method. Please select different method and try again');
        return;
      }
    }

    // this.computeTotal();

    // this.shippingDetails.shippingMethod = this.shippingDetails.shippingMethod === 0 ?
    //   this.shippings.find(x => x.isSelected).id : this.shippingDetails.shippingMethod;
    // this.shippingDetails.shippingMethodDescription = Utils.isNullOrUndefined(this.shippingDetails.shippingMethodDescription)
    //   || this.shippingDetails.shippingMethodDescription === '' ?
    //   this.shippings.find(x => x.isSelected).description : this.shippingDetails.shippingMethodDescription;
    // this.shippingDetails.trackingUrl = Utils.isNullOrUndefined(this.shippingDetails.trackingUrl)
    //   || this.shippingDetails.trackingUrl === '' ?
    //   this.shippings.find(x => x.isSelected).trackingUrl : this.shippingDetails.trackingUrl;
    // this.shippingDetails.shippingName = Utils.isNullOrUndefined(this.shippingDetails.shippingName)
    //   || this.shippingDetails.shippingName === '' ?
    //   this.shippings.find(x => x.isSelected).shippingName : this.shippingDetails.shippingName;

    // this.shippingDetails.subTotal = this.productPrice;
    // this.shippingDetails.discountCode = this.selectedDiscount.code;
    // this.shippingDetails.shippingAmount = this.shippingAmount;
    // this.shippingDetails.total = this.sumTotalPrice;
    // this.shippingDetails.amountToPay = this.amountToPay;
    // this.shippingDetails.discountAmount = this.discountAmount;
    this.navigationService.toAPaymentMethod();

    // if (this.shippingDetails.id === 0) {
    //   this.shippingService.createShippingDetails(this.shippingDetails).then((result: ShippingDetails) => {
    //     if (!Utils.isNullOrUndefined(result)) {
    //       this.shippingDetails.id = result.id;
    //       this.dataService.setActiveShippingDetails(this.shippingDetails);
    //       this.navigationService.toAPaymentMethod();
    //     }
    //   });
    // } else {
    //   this.shippingService.updateShippingDetails(this.shippingDetails).then((result: ShippingDetails) => {
    //     if (!Utils.isNullOrUndefined(result)) {
    //       this.shippingDetails.id = result.id;
    //       this.dataService.setActiveShippingDetails(this.shippingDetails);
    //       this.navigationService.toAPaymentMethod();
    //     }
    //   });
    // }
  }
}
