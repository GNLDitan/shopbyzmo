import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Cart } from 'src/app/classes/cart';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/classes/order';
import { Utils } from 'src/app/app.utils';
import { User } from 'src/app/classes/user';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-complete-order',
  templateUrl: './complete-order.component.html',
  styleUrls: ['./complete-order.component.scss']
})
export class CompleteOrderComponent implements OnInit {
  cart: Cart[];
  order: Order;
  isLoginUser: boolean;
  productFolder: string;
  subTotal: number;
  redirect: string;
  discountNoteEnable: boolean;
  cartLayaway: Cart;

  constructor(
    private navigationService: NavigationService,
    public authenticationService: AuthenticationService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService) {
    this.cart = new Array();
    this.order = new Order();
    this.productFolder = environment.productFolderPath;
    this.cartLayaway = new Cart();
    this.activatedRoute.params.subscribe(params => {
      const id = params.id;

      this.orderService.getOrderById(id).then((order: any) => {
        this.order = order;
        this.redirect = `client-order/client-order-info/${this.order.securityId}`;
        let preOrderSum = 0;
        this.order.orderCart.filter((crt) => {
          const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
            ? crt.product.productImages.find(x => x.isDefaultImage) :
            crt.product.productImages[0];
          crt.product.currentImageUrl = this.productFolder + currentImage.fileName;

          if (crt.isLayAway || crt.product.onSale) {
            this.discountNoteEnable = true;
          }

          // for (const pre of this.order.orderCart.filter(x => x.preOrder)) {
          if (crt.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) {
            preOrderSum += (crt.product.price * crt.quantity) + crt.rushFee;
          }
          // }
          this.subTotal = preOrderSum > 0 ? preOrderSum : this.order.shippingDetails.subTotal;
        });

        this.order.totalPrice = preOrderSum > 0 ? (this.subTotal - this.order.shippingDetails.discountAmount) + this.order.shippingDetails.shippingAmount + 
        this.order.insuranceFee : this.order.totalPrice;
      });
    });
  }

  ngOnInit() {
    this.isLoginUser = !Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_EMAIL));
    this.authenticationService.logoutGuest();
    this.dataService.setCart(this.cart);
  }

  getPreOrderAmount(item: any, paymentTerm: string): number {
    const data = item.find(x => x.paymentTerm == paymentTerm);
    return data ? data.amount : 0;
  }

  goToProduct() {
    this.navigationService.toProducts();
  }

  viewLayAway(cart: Cart) {
    this.cartLayaway = cart;
  }
}
