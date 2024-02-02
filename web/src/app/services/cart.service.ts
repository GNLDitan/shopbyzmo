import { Injectable } from '@angular/core';
import { Product } from '../classes/product';
import { Cart } from '../classes/cart';
import { Utils } from '../app.utils';
import { ToasterService } from './toaster.service';
import { User } from '../classes/user';
import { DataService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { ProductLayAway } from '../classes/product-layaway';
import { IpService } from './ip.service';
import { stringify } from 'querystring';
import { PreOrderSchedule } from '../classes/pre-order-schedule';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  api: string;
  items: Cart[] = [];
  ipAddress: string;
  constructor(
    private http: HttpClient,
    private toasterService: ToasterService,
    private dataService: DataService,
    private ipService: IpService) {
    this.api = '/cart';
    this.items = new Array();
  }


  createCart(cart: Cart) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createcart`, cart)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getCartByUserId(userIp: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getcartbyuseridandip/${userIp}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updateCart(cart: Cart) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updatecart`, cart)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  deleteCartById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deletecartbyid`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  getCarts(user: User, ipAddress: string) {
    this.ipAddress = ipAddress;
    if (this.ipAddress !== '') {
      const userId = !Utils.isNullOrUndefined(user.id) ? user.id : 0;
      this.items = new Array<Cart>();
      localStorage.removeItem(Utils.CART);
      const userIp = userId.toString().concat('-', this.ipAddress);
      this.getCartByUserId(userIp).then((itm: any) => {
        if (itm != null) {
          this.items = itm;
          const cart = [];
          let total = 0;
          for (const cartItem of this.items) {
            cartItem.quantity = Number(cartItem.quantity);
            total += Number(cartItem.quantity);
            cart.push(JSON.stringify(cartItem));
            localStorage.setItem(Utils.CART, JSON.stringify(cart));
          }

          this.items.map((cr) => {
            cr.cartCount = total;
          });
          this.dataService.setCart(this.items);
        }
      });
    }
  }

  addProductToCart(
    ipAddress: string,
    product: Product,
    fromProducts: boolean,
    user: User,
    isLayAway: boolean = false,
    productLayaway: ProductLayAway = new ProductLayAway(),
    isToaster: boolean = true,
    productQuantity: number = 1,
  ) {
    this.ipAddress = ipAddress;
    const now = new Date();
    // let isValid = this.validateCart(product, user, originalQuantity);
    const userId = !Utils.isNullOrUndefined(user.id) ? user.id : 0;
    // if (isValid || Utils.isNullOrUndefined(isValid)) {


    if (localStorage.getItem(Utils.CART) === null) {
      const item: any = {
        id: 0,
        product,
        quantity: productQuantity,
        totalPrice: product.onSale ? product.salesPrice : product.price,
        cartCount: 0,
        dateTime: now,
        userId,
        layAway: productLayaway,
        layAwaySchedule: new Array(),
        isLayAway,
        isExceed: false,
        datesOfPayment: productLayaway.datesOfPayment,
        numberOfInstallment: productLayaway.numberOfInstallmentPayment,
        orderId: 0,
        totalAmount: 0,
        ipAddress: this.ipAddress,
        paymentDates: '',
        price: 0,
        onSale: false,
        salesPrice: 0,
        preOrder: false,
        numberOfInstallmentList: new Array(),
        preOrderSchedule: new Array(),
        hasRushFee: false,
        rushFee: 0,
        preOrderLayaway: product.preOrderLayaway
      };
      this.createCart(item).then((crt: Cart) => {
        const cart = [];
        item.id = crt.id;
        item.layAway = productLayaway;
        item.isLayAway = isLayAway;
        cart.push(JSON.stringify(item));
        localStorage.setItem(Utils.CART, JSON.stringify(cart));

        const newcart = this.loadCart(user);
        let total = 0;

        for (const newC of newcart) {
          total += Number(newC.quantity);
        }

        newcart.map((cr) => {
          cr.cartCount = total;
        });
        this.dataService.setCart(newcart);

      });
    } else {
      // if the cart exist
      const cart: any = JSON.parse(localStorage.getItem(Utils.CART));
      let index = -1;
      for (let i = 0; i < cart.length; i++) {
        const item: Cart = JSON.parse(cart[i]);
        if (item.product.id === product.id && item.userId === userId) {
          index = i;
          break;
        }
      }
      if (index === -1) {
        const item: any = {
          id: 0,
          product,
          quantity: productQuantity,
          totalPrice: product.onSale ? product.salesPrice : product.price,
          cartCount: 0,
          dateTime: now,
          userId,
          layAway: productLayaway,
          layAwaySchedule: new Array(),
          isLayAway,
          isExceed: false,
          datesOfPayment: productLayaway.datesOfPayment,
          numberOfInstallment: productLayaway.numberOfInstallmentPayment,
          orderId: 0,
          totalAmount: 0,
          ipAddress: this.ipAddress,
          paymentDates: '',
          price: 0,
          onSale: false,
          salesPrice: 0,
          preOrder: false,
          numberOfInstallmentList: new Array(),
          preOrderSchedule: new Array(),
          hasRushFee: false,
          rushFee: 0,
          preOrderLayaway: product.preOrderLayaway
        };

        this.createCart(item).then((crt: Cart) => {
          item.id = crt.id;
          item.layAway = productLayaway;
          item.isLayAway = isLayAway;
          cart.push(JSON.stringify(item));
          localStorage.setItem(Utils.CART, JSON.stringify(cart));

          const newcart = this.loadCart(user);
          let total = 0;

          for (const newC of newcart) {
            total += Number(newC.quantity);
          }

          newcart.map((cr) => {
            cr.cartCount = total;
          });
          this.dataService.setCart(newcart);
        });
      } else {
        const item: Cart = JSON.parse(cart[index]);
        item.quantity = Number(item.quantity) + Number(product.quantity);
        this.updateItemInCart(product, user, item.quantity);
      }
    }

    if (isToaster) {
      this.toasterService.alert('success', 'adding item in cart');
    }


  }

  validateCart(product: Product, user: User, originalQuantity: number, ipAddress: string, isLayAway: boolean = false) {

    let isValid;
    const cart = JSON.parse(localStorage.getItem(Utils.CART));
    const userId = !Utils.isNullOrUndefined(user.id) ? user.id : 0;
    const productCount = this.getCartCountPerItem(product);

    if (!Utils.isNullOrUndefined(cart)) {
      const itm = JSON.parse(cart[0]);
      if ((itm.product.preOrder !== product.preOrder) || (itm.product.preOrderLayaway !== (product.preOrderLayaway && !isLayAway))) {
        //*if pre order layaway first and add pre order*//
        if ((itm.product.preOrderLayaway && !itm.isLayAway) && product.preOrder) {
          isValid = true;
        }
        //*if pre order layaway dp first and add pre order layaway dp*//
        else if ((itm.product.preOrderLayaway && !itm.isLayAway) && (product.preOrderLayaway && !isLayAway)) {
          isValid = true;
        }
        //*if pre order first and add pre order layaway dp*//
        else if (itm.product.preOrder && (product.preOrderLayaway && !isLayAway)) {
          isValid = true;
        } else if ((product.preOrderLayaway && !isLayAway) && (itm.product.preOrderLayaway && !isLayAway)) {
          isValid = true;
        }
        //*if pre order with layaway add normal*//
        else if ((itm.product.preOrderLayaway && itm.isLayAway) && (!product.preOrder && !product.preOrderLayaway)) {
          isValid = true;
        }
        else {
          this.toasterService.alert('danger', 'Error Pre Order Item cannot be combined to on hand items and pre order items with layaway payment term.');
          isValid = false;
        }

      } else {
        for (const crt of cart) {
          const item = JSON.parse(crt);
          if (item.product.id === product.id && item.userId === userId && item.ipAddress === this.ipAddress
            && originalQuantity < (Number(productCount) + Number(product.quantity)) && Number(productCount) > 0 && originalQuantity > 0) {
            this.toasterService.alert('danger', 'quantity in cart exceeds stock quantity.');
            isValid = false;
          } else if (item.product.id === product.id && item.userId === userId
            && originalQuantity > (Number(productCount) + Number(product.quantity)) && Number(productCount) > 0 && originalQuantity > 0) {
            isValid = true;
          } else if (originalQuantity === 0) {
            this.toasterService.alert('danger', 'out of stock.');
            isValid = false;
          }
        }
      }
    } else {
      if (originalQuantity > 0 && product.quantity <= originalQuantity) {
        isValid = true;
      } else if (originalQuantity > 0 && product.quantity > originalQuantity) {
        isValid = false;
      } else {
        this.toasterService.alert('danger', 'out of stock.');
        isValid = false;
      }
    }
    return isValid;

  }

  getCartCountPerItem(product: Product) {
    let quantity = 0;
    const cart = JSON.parse(localStorage.getItem(Utils.CART));
    if (!Utils.isNullOrUndefined(cart)) {
      for (const crt of cart) {
        const item = JSON.parse(crt);
        if (item.product.id === product.id) {
          quantity = item.quantity;
        }
      }
    }
    return quantity;
  }

  // validateCartExpiry(user: User) {
  //   const now = new Date();
  //   let cart = JSON.parse(localStorage.getItem(Utils.CART));

  //   if (!Utils.isNullOrUndefined(cart)) {
  //     const cartDate = new Date(JSON.parse(cart[0]).dateTime);
  //     if (!Utils.isNullOrUndefined(user.id)) {
  //       if (now.getDate() > (cartDate.getDate() + 5)) {
  //         localStorage.removeItem(Utils.CART);
  //       }
  //     } else {
  //       if (now.getDate() > cartDate.getDate()) {
  //         localStorage.removeItem(Utils.CART);
  //       }
  //     }
  //   }


  // }

  loadCart(user: User) {

    this.items = new Array<Cart>();
    const newCart = JSON.parse(localStorage.getItem(Utils.CART));
    if (!Utils.isNullOrUndefined(newCart)) {
      for (const newC of newCart) {

        const item: Cart = JSON.parse(newC);
        if (item.userId === user.id || Utils.isNullOrUndefined(user.id)) {
          const cart: any = {
            id: item.id,
            product: item.product,
            quantity: Number(item.quantity),
            totalPrice: item.product.onSale ? item.product.salesPrice : item.product.price,
            cartCount: 0,
            dateTime: item.dateTime,
            userId: item.userId,
            layAway: item.layAway,
            layAwaySchedule: new Array(),
            isLayAway: item.isLayAway,
            isExceed: false,
            datesOfPayment: item.datesOfPayment,
            numberOfInstallment: item.numberOfInstallment,
            orderId: 0,
            totalAmount: 0,
            ipAddress: item.ipAddress,
            paymentDates: '',
            price: 0,
            onSale: false,
            salesPrice: 0,
            preOrder: false,
            numberOfInstallmentList: new Array(),
            preOrderSchedule: new Array(),
            hasRushFee: item.hasRushFee,
            rushFee: item.rushFee
          };

          this.items.push(cart);
        }
      }
    }
    return this.items;
  }

  updateItemInCart(product: Product, user: User, quantity: number, isLayAway: boolean = false,
    productLayaway: ProductLayAway = new ProductLayAway(), setChanges: boolean = true,
    hasRushFee: boolean = false) {
    const userId = !Utils.isNullOrUndefined(user.id) ? user.id : 0;
    const cart: any = JSON.parse(localStorage.getItem(Utils.CART));
    localStorage.removeItem(Utils.CART);
    let index = -1;
    const newcart = [];
    for (let i = 0; i < cart.length; i++) {

      const item: Cart = JSON.parse(cart[i]);
      if (item.product.id === product.id && item.userId === userId) {
        item.quantity = quantity;
        item.isExceed = product.isExceed;
        item.isLayAway = isLayAway;
        item.layAway = productLayaway;
        item.datesOfPayment = productLayaway.datesOfPayment;
        item.numberOfInstallment = productLayaway.numberOfInstallmentPayment;
        item.hasRushFee = hasRushFee;
        item.rushFee = hasRushFee ? product.rushFee : 0;
        item.preOrderLayaway = product.preOrderLayaway;
        index = i;

      }
      newcart.push(JSON.stringify(item));
      localStorage.setItem(Utils.CART, JSON.stringify(newcart));
    }


    const item: Cart = JSON.parse(cart[index]);
    item.quantity = quantity;
    item.isLayAway = isLayAway;
    item.datesOfPayment = productLayaway.datesOfPayment;
    item.numberOfInstallment = productLayaway.numberOfInstallmentPayment;
    item.hasRushFee = hasRushFee;
    item.rushFee = hasRushFee ? (product.rushFee * quantity) : 0;

    this.updateCart(item).then((crt: Cart) => {
      const newcart = this.loadCart(user);
      let total = 0;

      for (let i = 0; i < newcart.length; i++) {
        total += Number(newcart[i].quantity);
      }

      newcart.map((cr) => {
        cr.cartCount = total;
      });
      if (setChanges) {
        this.dataService.setCart(newcart);
      }

    });

  }

  removeItemInCart(id: number, user: User, ipAddress: string) {

    this.deleteCartById(id).then((next) => {
      if (next != null) {
        this.getCarts(user, ipAddress);
      }
    });
  }

  deleteItemInCartByEmail(email: string) {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.api}/deleteitemincartbyemail/${email}`)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  updateUserCart(user: User, ipAddress: string) {
    return new Promise((resolve, reject) => {
      this.deleteItemInCartByEmail(user.email).then(() => {
        try {
          const newCart = this.replaceLoadCart(user);
          newCart.map((cart: Cart, i) => {
            const layAyaw = new ProductLayAway();
            layAyaw.datesOfPayment = cart.datesOfPayment;
            layAyaw.numberOfInstallmentPayment = cart.numberOfInstallment;
            this.addProductToCart(ipAddress, cart.product, false, user, cart.isLayAway, layAyaw, false, cart.quantity);
            if ((newCart.length - 1) == i) {
              resolve(cart);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }


  replaceLoadCart(user: User) {

    this.items = new Array<Cart>();
    const newCart = JSON.parse(localStorage.getItem(Utils.CART));
    if (!Utils.isNullOrUndefined(newCart)) {
      for (let i = 0; i < newCart.length; i++) {
        const a = 1;
        const item = JSON.parse(newCart[i]);
        const cart: any = {
          id: item.id,
          product: item.product,
          quantity: Number(item.quantity),
          totalPrice: item.product.onSale ? item.product.salesPrice : item.product.price,
          cartCount: 0,
          dateTime: item.dateTime,
          userId: item.userId,
          layAway: item.layAway,
          layAwaySchedule: new Array(),
          isLayAway: item.isLayAway,
          isExceed: false,
          datesOfPayment: item.datesOfPayment,
          numberOfInstallment: item.numberOfInstallment,
          orderId: 0,
          totalAmount: 0,
          ipAddress: item.ipAddress,
          paymentDates: '',
          price: 0,
          onSale: false,
          salesPrice: 0,
          preOrder: false,
          numberOfInstallmentList: new Array(),
          preOrderSchedule: new Array()
        };
        this.items.push(cart);
      }

    }
    return this.items;
  }

  valdiateCartByUserId(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/validatecartbyuserid`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  updateCartUser(user: User) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updatecartuser`, user)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }


  valdiateProduct(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/validateproduct`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  isProductCartExists(product: Product) {
    let quantity = 0;
    const cart = JSON.parse(localStorage.getItem(Utils.CART));
    if (!Utils.isNullOrUndefined(cart)) {
      for (const crt of cart) {
        const item = JSON.parse(crt);
        if (item.product.id === product.id) {
          return true;
        }
      }
    } else {
      return false;
    }
    return false;
  }

}
