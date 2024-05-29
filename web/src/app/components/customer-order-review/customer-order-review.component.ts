import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cart } from 'src/app/classes/cart';
import { Order } from 'src/app/classes/order';
import { OrderProductRate } from 'src/app/classes/order-product-rate';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-order-review',
  templateUrl: './customer-order-review.component.html',
  styleUrls: ['./customer-order-review.component.scss']
})
export class CustomerOrderReviewComponent implements OnInit {

  stars: number[] = [1, 2, 3, 4, 5];
  selectedValue: number;
  order: Order;
  cart: Cart;
  productFolder: string;
  clientComment: string;
  selectedIndex: number;

  constructor(private route: ActivatedRoute,
              private orderService: OrderService,
              private navigationService: NavigationService,
              private dataService: DataService) {
    this.order = new Order();
    this.cart = new Cart();
    this.productFolder = environment.productFolderPath;
    this.selectedValue = 0;
   
              }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMaps: any) => {
      const id = paramMaps.params.orderid;
      this.orderService.getOrderBySecurityId(id).then((order: any) => {
        if (order.hasOwnProperty('id')) {
          order.orderCart.map((crt: Cart) => {
              const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
                ? crt.product.productImages.find(x => x.isDefaultImage) :
                crt.product.productImages[0];
              crt.product.currentImageUrl = this.productFolder + currentImage.fileName;
          })
          this.order = order;
        }
      });
    });
  }

  countStar(star) {
    this.selectedValue = star;
    console.log('Value of star', star);
  }

  viewReviewProduct(cart: Cart, currentIndex: number) {
    this.selectedIndex = currentIndex;
    this.cart = cart;
  }

  goToProduct(product: any) {
    this.navigationService.toProductInformationByLinkName(product);
  }

  submitReview() {
    let review: OrderProductRate = {
      rate: this.selectedValue,
      comment: this.clientComment,
      productId: this.cart.product.id,
      orderId: this.order.id,
      activeUser: this.dataService.activeUser.id,
      parentId: 0
    }
    this.orderService.orderProductReview(review).then((result) => {
      console.log(result)
      this.order.orderCart[this.selectedIndex].hasReview = true;
      this.order.orderCart[this.selectedIndex].rating = this.selectedValue;

    }).catch((err) => console.log(err))
  }


}
