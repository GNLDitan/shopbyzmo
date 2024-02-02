import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/app.utils';
import { Product } from 'src/app/classes/product';
import { ProductLayAway } from 'src/app/classes/product-layaway';
import { User } from 'src/app/classes/user';
import { UserWishlist } from 'src/app/classes/user-wishlist';
import { CartService } from 'src/app/services/cart.service';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-wishlist',
  templateUrl: './user-wishlist.component.html',
  styleUrls: ['./user-wishlist.component.scss']
})
export class UserWishlistComponent implements OnInit, OnDestroy {

  user: User;
  wishList: Array<UserWishlist>;
  productFolder: string;
  ipAddress: string;
  selectedIP: Subscription;
  constructor(public userService: UserService,
    public dataService: DataService,
    public navigationService: NavigationService,
    public cartService: CartService,
    public toasterService: ToasterService) {
    this.wishList = new Array();
    this.productFolder = environment.productFolderPath;
  }

  ngOnInit() {

    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          this.dataService.user$.subscribe((user) => {
            this.user = user;
            this.getUserWishList();
          });
        }
      }

    });
  }

  ngOnDestroy() {
    this.selectedIP.unsubscribe();
  }

  getUserWishList() {
    this.userService.getUserWishlishByEmail(this.user.email).then((wishlist: any) => {
      this.wishList = wishlist;
      for (let i = 0; i < this.wishList.length; i++) {
        const currentImage = this.wishList[i].product.productImages.filter(x => x.isDefaultImage).length > 0
          ? this.wishList[i].product.productImages.find(x => x.isDefaultImage) :
          this.wishList[i].product.productImages[0];
        this.wishList[i].product.currentImageUrl = this.productFolder + currentImage.fileName;
      }
    });
  }

  /* Removed for SEO crawl
  gotoProduct(product: Product) {
    this.navigationService.toProductInformationByLinkName(product);
  }
  */

  removeToWishList(wishList: UserWishlist) {
    this.userService.deleteUserWishlishByEmailAndProductId(wishList).then((added) => {
      if (added) {
        const index = this.wishList.indexOf(wishList);
        this.wishList.splice(index, 1);
      }
    });
  }

  addProductToCart(wishList: UserWishlist) {
    let origQuantity = wishList.product.quantity;
    wishList.product.quantity = 1;
    const isValid = this.cartService.validateCart(wishList.product, this.user, origQuantity, this.ipAddress);
    if (isValid || Utils.isNullOrUndefined(isValid)) {
      this.cartService.addProductToCart(this.ipAddress, wishList.product, false, this.user, false, new ProductLayAway, true);
      this.removeToWishList(wishList);
    }
  }
}
