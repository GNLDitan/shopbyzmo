import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';
import { Product } from 'src/app/classes/product';
import { Cart } from 'src/app/classes/cart';
import { CartService } from 'src/app/services/cart.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { DataService } from 'src/app/services/data.service';
import { Utils } from 'src/app/app.utils';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { ProductService } from 'src/app/services/product.service';
import { environment } from 'src/environments/environment';
import { LayAway } from 'src/app/classes/layaway';
import { LayAwayDates } from 'src/app/classes/layaway-date';
import { LayAwayService } from 'src/app/services/layaway.service';
import { ProductLayAway } from 'src/app/classes/product-layaway';
import { IpService } from 'src/app/services/ip.service';
import { Meta } from '@angular/platform-browser';
import { Discount } from 'src/app/classes/discount';
import { Subscription } from 'rxjs';
import * as e from 'express';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart[];
  sumTotalPrice: number;
  user: User;
  productFolder: string;
  layAway: LayAway;
  layAwayDates: Array<LayAwayDates>;
  daysList: any;
  product: Product;
  ipAddress: string;
  numberOfInstallmentList: any;
  selectedIP: Subscription;
  isLayawayOption: boolean;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private metaService: MetaTagService,
    private domService: DomService,
    private cartService: CartService,
    private confirmationService: ConfirmationService,
    private toasterService: ToasterService,
    private navigationService: NavigationService,
    private dataService: DataService,
    private userService: UserService,
    private productService: ProductService,
    private layAwayService: LayAwayService,
    private metaTagService: Meta,
    private ipService: IpService) {
    this.daysList = new Array();
    this.cart = new Array();
    this.sumTotalPrice = 0;
    this.user = new User();
    this.layAway = new LayAway();
    this.layAwayDates = Array();
    this.productFolder = environment.productFolderPath;
    this.product = new Product();
    this.numberOfInstallmentList = [];
    this.selectedIP = new Subscription();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setH1Body('Your Shopping Cart');
      this.domService.setCanonicalURL(`${environment.webUrl}/cart`);

      this.metaService.setTitle('Cart - Shop Byzmo')
      this.metaService.setSocialMediaTags(`${environment.webUrl}/cart`,
        'Cart - Shop Byzmo',
        'Add to cart your integrity toys and fashionable dolls now!',
        `${environment.webUrl}/assets/img/byzmo_header.png`);

      this.loadAll();
    }
  }

  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
            const email = localStorage.getItem(Utils.LS_EMAIL);
            this.userService.getUserByEmail(email).then((success: User) => {
              this.user = success;
              this.setLayAwayCart();
            }, (error) => {
              console.log(error.error);
            });
          } else {
            this.setLayAwayCart();

          }
        }
      }

    });
  }
  setLayAwayCart() {
    this.cartService.getCarts(this.user, this.ipAddress);
    this.metaTagService.addTags([
      { name: 'keywords', content: 'Cart' },
    ]);

    if (this.dataService.allLayAwayDates.length > 0 && this.dataService.allLayAway.id != undefined) {
      this.layAway = this.dataService.allLayAway;
      this.layAwayDates = this.dataService.allLayAwayDates;
      this.loadCart();
      this.getDays();
      this.getNumberOfInstallment(this.layAway.maxNumberOfInstallmentPayment);
    } else {
      this.dataService.selectedLayAway$.subscribe((data: any) => {
        this.layAway = data.layAway;
        this.layAwayDates = data.layAwayDates;
        this.loadCart();
        this.getDays();
        this.getNumberOfInstallment(this.layAway.maxNumberOfInstallmentPayment);
      });
    }
  }
  loadCart() {
    const layAway = new LayAway();
    this.dataService.productCart$.subscribe((carts: any) => {
      this.sumTotalPrice = 0;
      this.cart = carts;
      Object.assign(layAway, this.layAway);
      this.cart.map((crt: Cart) => {
        const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
          ? crt.product.productImages.find(x => x.isDefaultImage) :
          crt.product.productImages[0];
        crt.product.currentImageUrl = this.productFolder + currentImage.fileName;

        const totalPrice = (crt.product.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) ? crt.product.preOrderDepositAmount
          : (crt.product.onSale ? crt.product.salesPrice : crt.product.price);
        this.sumTotalPrice = this.sumTotalPrice + (totalPrice * crt.quantity);
        crt.totalPrice = (totalPrice * crt.quantity);

        if (crt.hasRushFee) {
          crt.totalPrice = crt.totalPrice + (crt.product.rushFee * crt.quantity);
          this.sumTotalPrice = this.sumTotalPrice + (crt.product.rushFee * crt.quantity);
        }

        if (crt.isLayAway) {
          layAway.maxNumberOfInstallmentPayment = crt.numberOfInstallment;
          layAway.datesOfPayment = crt.datesOfPayment;
        }

        crt.layAway = this.layAwayService.getLayAwayDetails(layAway, crt.product, crt.quantity);
        crt.layAwaySchedule = this.layAwayService.getLayAwaySchedule(layAway, crt.layAway.monthly);
      });
      let total = 0;

      for (const itm of this.cart) {
        total += Number(itm.quantity);
      }

      this.cart.map((cr) => {
        cr.cartCount = total;
      });
    });
  }


  deleteItem(product: Product) {
    const dialogQuestion = 'Are you sure you want to delete this item?';
    const dialogMessage = 'Selected item will be removed.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      product.productName, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        const index = this.cart.findIndex(x => x.product.id === product.id);
        this.cartService.removeItemInCart(this.cart[index].id, this.user, this.ipAddress);
        this.toasterService.alert('success', 'removing item in cart');
        this.loadCart();

      }
    }).catch(() => { });

  }

  onChange($event: any, itemProduct: any) {
    const product = itemProduct;
    let quantity = 0;
    const cart = JSON.parse(localStorage.getItem(Utils.CART));
    if (!Utils.isNullOrUndefined(cart)) {
      for (const itm of cart) {
        const item = JSON.parse(itm);
        if (item.product.id === product.id) {
          quantity = item.product.quantity;
        }
      }
    }

    if ($event.target.value > quantity && quantity > 0) {
      this.toasterService.alert('danger', 'quantity in cart exceeds stock quantity.');
      this.sumTotalPrice = 0;
      this.cart = this.cartService.loadCart(this.user);
      this.cart.map((crt: Cart) => {
        const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
          ? crt.product.productImages.find(x => x.isDefaultImage) :
          crt.product.productImages[0];
        crt.product.currentImageUrl = this.productFolder + currentImage.fileName;

        if (crt.product.id === product.id) {
          crt.isExceed = true;
        }
        const totalPrice = crt.product.onSale ? crt.product.salesPrice : crt.product.price;
        this.sumTotalPrice = this.sumTotalPrice + (totalPrice * crt.quantity);
        crt.totalPrice = (totalPrice * crt.quantity);
      });
      let total = 0;

      for (const itm of cart) {
        total += Number(itm.quantity);
      }

      this.cart.map((cr) => {
        cr.cartCount = total;
        cr.rushFee = 0;
        cr.hasRushFee = false;
      });
      
      this.dataService.setCart(this.cart);
      this.loadCart();
    } else {
      this.cart.map((crt) => {
        if (crt.product.id === product.id) {
          crt.quantity = $event.target.value;
          product.isExceed = false;
        }
      });
      this.cartService.updateItemInCart(product, this.user, $event.target.value);
      this.loadCart();
    }
  }
  addMinusQuantity(cartItem: Cart, isAdd: boolean) {
    if (cartItem.quantity === 1 && !isAdd) {
      return;
    }
    if (isAdd) {
      cartItem.quantity++;
    } else {
      cartItem.quantity--;
    }


    const product = cartItem.product;
    let quantity = 0;
    const cart = JSON.parse(localStorage.getItem(Utils.CART));
    if (!Utils.isNullOrUndefined(cart)) {
      for (const itm of cart) {
        const item = JSON.parse(itm);
        if (item.product.id === product.id) {
          quantity = item.product.quantity;
        }
      }
    }


    if (cartItem.quantity > quantity && quantity > 0) {
      this.toasterService.alert('danger', 'quantity in cart exceeds stock quantity.');
      this.sumTotalPrice = 0;
      this.cart = this.cartService.loadCart(this.user);
      this.cart.map((crt: Cart) => {
        const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
          ? crt.product.productImages.find(x => x.isDefaultImage) :
          crt.product.productImages[0];
        crt.product.currentImageUrl = this.productFolder + currentImage.fileName;

        if (crt.product.id === product.id) {
          crt.isExceed = true;
        }
        const totalPrice = (crt.product.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) ? crt.product.preOrderDepositAmount
          : (crt.product.onSale ? crt.product.salesPrice : crt.product.price);
        this.sumTotalPrice = this.sumTotalPrice + (totalPrice * crt.quantity);
        crt.totalPrice = (totalPrice * crt.quantity);

        if (crt.hasRushFee) {
          crt.totalPrice = crt.totalPrice + (crt.product.rushFee * crt.quantity);
          this.sumTotalPrice = this.sumTotalPrice + (crt.product.rushFee * crt.quantity);
        }

      });
      let total = 0;

      for (const itm of this.cart) {
        total += Number(itm.quantity);
      }

      this.cart.map((cr) => {
        cr.cartCount = total;
        cr.rushFee = 0;
        cr.hasRushFee = false;
      });

      this.dataService.setCart(this.cart);
      this.loadCart();
    } else {
      this.cart.map((crt) => {
        if (crt.product.id === product.id) {
          crt.quantity = cartItem.quantity;
          product.isExceed = false;
          crt.hasRushFee = false;
          crt.rushFee = 0;
        }
      });
      if (cartItem.product.preOrderLayaway) {
        this.cartService.updateItemInCart(product, this.user, cartItem.quantity, cartItem.isLayAway, cartItem.layAway, false, false);
      } else {
        this.cartService.updateItemInCart(product, this.user, cartItem.quantity);
      }
      this.loadCart();

    }

  }

  /* Removed for SEO crawl
  selectProduct(product: Product) {
    this.navigationService.toProductInformationByLinkName(product);
  }
  */

  getDays() {
    this.layAwayDates.forEach((dates: any) => {
      this.daysList.push({
        id: dates.paymentDay,
        value: Utils.numericSuffix(dates.paymentDay) + ' of the month'
      });
    });
  }

  getNumberOfInstallment(num: number) {

    let installmentNumber = Utils.MIN_INSTALLMENT;
    while (installmentNumber <= num) {
      this.numberOfInstallmentList.push({
        id: installmentNumber
      });
      installmentNumber++;
    }

    return this.numberOfInstallmentList;
  }

  recomputeLayAway(crt: any, event: any = null) {
    const layAway = {} as any;
    Object.assign(layAway, this.layAway);
    if (event != null) {
      // tslint:disable-next-line: radix
      const data = parseInt(event.currentTarget.value);
      const max = layAway.maxNumberOfInstallmentPayment;
      if (data > max || data <= Utils.MIN_INSTALLMENT) {
        if (data > Utils.MIN_INSTALLMENT) {
          event.currentTarget.value = max;
          crt.layAway.numberOfInstallmentPayment = max;
          this.toasterService.alert('warning', 'you already reach the max installment payment');
        } else {
          event.currentTarget.value = Utils.MIN_INSTALLMENT;
          crt.layAway.numberOfInstallmentPayment = Utils.MIN_INSTALLMENT;
        }
      }
    }
    layAway.maxNumberOfInstallmentPayment = crt.layAway.numberOfInstallmentPayment;
    // tslint:disable-next-line: radix
    layAway.datesOfPayment = parseInt(crt.layAway.datesOfPayment);
    crt.layAway = this.layAwayService.getLayAwayDetails(layAway, crt.product, crt.quantity);
    crt.layAwaySchedule = this.layAwayService.getLayAwaySchedule(layAway, crt.layAway.monthly);

    this.cartService.updateItemInCart(crt.product, this.user, crt.quantity, true, crt.layAway, false);
  }

  gotoShipping() {

    let layawayCount = 0;
    let preOrderCount = 0;

    layawayCount = this.cart.filter(x => x.isLayAway).length;
    preOrderCount = this.cart.filter(x => x.product.preOrder).length;
    preOrderCount += this.cart.filter(x => x.product.preOrderLayaway && !x.isLayAway).length;

    if (layawayCount > 0 && preOrderCount > 0) {
      this.toasterService.alert('warning', 'Layway payment option cannot be combined to Pre Order items in Cart');
      return;
    }

    if (this.user.id === 0 && (this.cart.filter(x => x.isLayAway).length >= 1)) {
      this.toasterService.alert('warning', ' For orders with layaway items, logged in account is required.');
      return;
    } else if (this.user.id === 0 && (this.cart.filter(x => x.product.preOrder).length >= 1 || this.cart.filter(x => x.product.preOrderLayaway).length >= 1)) {
      this.toasterService.alert('warning', ' For orders with preorder items, logged in account is required.');
      return;
    } else {
      this.validateProducts();
    }
  }

  validateProducts() {
    let isValid = false;
    this.cartService.valdiateCartByUserId(this.user.id).then((valid: any) => {
      isValid = valid;

      if (!isValid) {
        // tslint:disable-next-line: max-line-length
        this.toasterService.alert('warning', 'It seems like one or more items in your cart are now out of stock. Please refresh you cart to check the availability of the items.');
        return;
      } else {
        this.dataService.setDiscount(new Discount());
        this.navigationService.gotoShipping();
      }

    });

  }

  updateCartLayaway(cart: any, event: any = null) {
    const layAway = !event.target.checked ? new ProductLayAway() : cart.layAway;
    this.cartService.updateItemInCart(cart.product, this.user, cart.quantity, event.target.checked, layAway);
  }


  rushFeeCart(cart, event: any = null) {
    this.cartService.updateItemInCart(cart.product, this.user, cart.quantity, false, new ProductLayAway(), true, event.target.checked);
  }

  payment() {
    console.log(this.isLayawayOption);
  }


}
