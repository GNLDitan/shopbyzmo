import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ProductService } from 'src/app/services/product.service';
import { Utils } from 'src/app/app.utils';
import { Product } from 'src/app/classes/product';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/classes/user';
import { NavigationService } from 'src/app/services/navigation.service';
import { CartService } from 'src/app/services/cart.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { IpService } from 'src/app/services/ip.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-feature',
  templateUrl: './product-feature.component.html',
  styleUrls: ['./product-feature.component.scss']
})
export class ProductFeatureComponent implements OnInit {

  currentFeature: string;
  hasMore = false;
  productFolder: string;
  products: Array<Product>;
  user: User;
  filter: FilterSetting;
  ipAddress: string;
  selectedIP: Subscription;
  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private userService: UserService,
    private cartService: CartService,
    private navigationService: NavigationService,
    private dataService: DataService,
    private toasterService: ToasterService,
    private ipService: IpService) {
    this.products = new Array();
    this.selectedIP = new Subscription();
  }

  ngOnInit() {
    this.loadAll();
  }
  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          this.checkUser();
          this.subscribeUser();
          this.productFolder = environment.productFolderPath;
          this.activatedRoute.paramMap.subscribe(params => {
            this.currentFeature = params.get('id');
            this.filter = new FilterSetting();
            this.filter.tag = this.currentFeature;
            if (this.currentFeature === Utils.FEATURE_TYPE.preOrder) {
              this.filter.sort = 'Pre-Order';
            }
            this.getBatchProduct();
          });
        }
      }

    });
  }
  getBatchProduct() {
    this.productService.getProductsListRange(this.filter).then((products: Array<Product>) => {
      this.hasMore = products.length >= Utils.PRODUCT_LIMIT;
      products.map((product) => {
        const currentImage = product.productImages.filter(x => x.isDefaultImage).length > 0
          ? product.productImages.find(x => x.isDefaultImage) :
          product.productImages[0];
        product.currentImageUrl = this.productFolder + currentImage.fileName;
        product.originalQuantity = product.quantity;
      });
      if (!Utils.arraysEqual(this.products, products)) {
        Array.prototype.push.apply(this.products, products);
      }
    });
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

  showMore() {
    this.filter.offset = this.products.length;
    this.getBatchProduct();
  }
  selectProduct(product: Product) {
    this.navigationService.toProductInformationByLinkName(product);
  }

  addProductToCart(product: Product) {
    if (this.user.isAdmin) {
      this.toasterService.alert('danger', 'adding cart logged in as admin');
    } else {
      product.quantity = 1;
      const isValid = this.cartService.validateCart(product, this.user, product.originalQuantity, this.ipAddress);
      if (isValid || Utils.isNullOrUndefined(isValid)) {
        this.cartService.addProductToCart(this.ipAddress, product, false, this.user);
      }
    }

    // this.cartService.addProductToCart(product, false, this.user);
    // let cart = this.cartService.loadCart(this.user);
    // var total = cart.reduce(function (prev, cur) {
    //   return prev + (cur.quantity);
    // }, 0);

    // cart.map((cr) => {
    //   cr.cartCount = total
    // });
    // this.dataService.setCart(cart);
  }

}
