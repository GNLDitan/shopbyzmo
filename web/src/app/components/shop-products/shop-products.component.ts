import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { Product } from 'src/app/classes/product';
import { environment } from 'src/environments/environment';
import { Tag } from 'src/app/classes/tag';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { Utils } from 'src/app/app.utils';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { Title } from '@angular/platform-browser';
import { CartService } from 'src/app/services/cart.service';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { IpService } from 'src/app/services/ip.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { LayAwayDates } from 'src/app/classes/layaway-date';
import { LayAway } from 'src/app/classes/layaway';
import { LayAwayService } from 'src/app/services/layaway.service';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { ProductLayAway } from 'src/app/classes/product-layaway';
import { UserWishlist } from 'src/app/classes/user-wishlist';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { ProductInventoryComponent } from '../administration/product/product-inventory/product-inventory.component';
import { UserProductNotification } from 'src/app/classes/user-product-notification';
import { DomService } from 'src/app/services/dom-service';
import { MetaTagService } from 'src/app/services/meta-tag.service';

@Component({
  selector: 'app-shop-products',
  templateUrl: './shop-products.component.html',
  styleUrls: ['./shop-products.component.scss']
})
export class ShopProductsComponent implements OnInit, OnDestroy {

  public product: Product;
  imageBlobs: ImageViewer[];
  productFolder: string;
  featureImg: string;
  designTags: Tag[];
  isLoading: boolean;
  stars: number[] = [1, 2, 3, 4, 5];


  public onHandItem: string;
  public justArrived: string;
  public selectedImage: string;
  public layAwaySchedule: Array<LayAwaySchedule>;
  public monthly: number;
  public isShow: boolean;
  public layAwayDetails: ProductLayAway;
  public isNotify: boolean;
  public userNotification: UserProductNotification;

  user: User;
  addToCartDisable: boolean;
  quantity: number;
  cartCount: number;
  originalQuantity: number;
  remainingQuantity: number;
  ipAddress: string;
  selectedProduct: Subscription;
  productDescription: string;
  preOrderDownPayment: number;
  selectedIP: Subscription;
  layAway: LayAway;
  layAwayDates: Array<LayAwayDates>;
  numberOfInstallmentList: any;
  daysList: any;
  numberOfInstallmentPayment: number;
  days: number;
  nonRefundDeposit: number;
  isApply: boolean = false;
  wishList: UserWishlist;
  isWishList: boolean;
  isloading: boolean;
  loginForm: any;
  errorMessage: string;
  productRatings: number;

  constructor(
    public dataService: DataService,
    private breadcrumbService: BreadcrumbService,
    private titleService: Title,
    private cartService: CartService,
    private userService: UserService,
    private toasterService: ToasterService,
    private ipService: IpService,
    public route: ActivatedRoute,
    private productService: ProductService,
    private layAwayService: LayAwayService,
    public formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    @Inject(DOCUMENT) private document,
    private domService: DomService,
    private metaService: MetaTagService) {
    this.imageBlobs = new Array();
    this.product = new Product();
    this.productFolder = environment.productFolderPath;
    this.featureImg = '';
    this.designTags = [];
    this.justArrived = '';
    this.onHandItem = '';
    this.user = new User();
    this.addToCartDisable = false;
    this.quantity = 1;
    this.productDescription = '';
    this.preOrderDownPayment = 0;
    this.selectedProduct = new Subscription();
    this.selectedIP = new Subscription();
    this.layAway = new LayAway();
    this.layAwayDates = Array();
    this.numberOfInstallmentList = [];
    this.daysList = new Array();
    this.layAwaySchedule = new Array();
    this.layAwayDetails = new ProductLayAway();
    this.wishList = new UserWishlist();
    this.productRatings = 0;
    this.userNotification = new UserProductNotification();
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      issocialmedialogin: [false]
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  ngOnDestroy() {
    this.selectedProduct.unsubscribe();
  }
  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          this.isLoading = true;
          this.justArrived = Utils.FEATURE_TYPE.justArrived;
          this.onHandItem = Utils.FEATURE_TYPE.onHandItem;

          this.breadcrumbService.breadcrumbChanged.subscribe((crumbs) => {
            // this.titleService.setTitle(this.createTitle(crumbs));
          });
          this.setProduct();
          // this.subscribeProduct();

          this.checkUser();
          this.subscribeUser();
        }
      }

    });
  }
  setProduct() {
    this.route.paramMap.subscribe((paramMaps: any) => {
      const id = paramMaps.params.id;
      const productId = id.split('-')[1];
      this.imageBlobs = [];
      this.wishList.productId = productId;
      this.userNotification.productId = productId;
      this.productService.getProductById(productId).then((product: any) => {
        if (!Utils.isNullOrUndefined(product)) {
          if (product.hasOwnProperty('id')) {
            product.originalQuantity = product.quantity;
            product.quantity = product.quantity > 0 ? 1 : 0;
            this.product = product;
            this.productDescription = this.product.productDescription;
            this.preOrderDownPayment = this.product.preOrderDepositAmount;
            const currentImage = product.productImages.filter(x => x.isDefaultImage).length > 0
              ? product.productImages.find(x => x.isDefaultImage) :
              product.productImages[0];
            this.product.currentImageUrl = this.productFolder + currentImage.fileName;

            this.designTags = product.tags;
            this.product.productImages.map((images, i) => {
              if (i === 0 || images.isDefaultImage) {
                this.featureImg = this.productFolder + images.fileName;
              }

              const image = new ImageViewer();
              image.imageUrl = this.productFolder + images.fileName;
              image.isDefaultImage = images.isDefaultImage;
              this.imageBlobs.push(image);

              const sum = product.orderProductRates.reduce((sum, item) => sum + item.rate, 0);
              const average = sum / product.orderProductRates.length;
              this.productRatings = average;
            });
            this.isLoading = false;

            // if (product.preOrderLayaway) {
            //   this.isApply = true;
            //   this.isShow = true;
            // }
          }
        }
        this.setupLayaway();
        this.getWishlist();

      });
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
      this.wishList.email = next.email;
      this.userNotification.email = next.email;
      // this.cartService.validateCartExpiry(next);
      this.cartService.getCarts(this.user, this.ipAddress);
      this.getWishlist();
      this.getNotificationUser();
    });
  }

  setFeatureImg(imgUrl: string) {
    this.featureImg = imgUrl;
  }

  // private createTitle(routesCollection: Breadcrumb[]) {
  //   const title = 'Profile';
  //   const titles = routesCollection.filter((route) => route.displayName);

  //   if (!titles.length) { return title; }

  //   const routeTitle = this.titlesToString(titles);
  //   return `${routeTitle}`;

  // }

  // private titlesToString(titles) {
  //   return titles.reduce((prev, curr) => {
  //     return `${curr.displayName}`;
  //   }, '');
  // }

  addProductToCart(product: Product) {
    if (this.user.isAdmin) {
      this.toasterService.alert('danger', 'adding cart logged in as admin');
    } else {
      product.quantity = this.quantity > 0 ? this.quantity : product.quantity;
      const isValid = this.cartService.validateCart(product, this.user, this.product.originalQuantity, this.ipAddress, this.isApply);
      if (isValid || Utils.isNullOrUndefined(isValid)) {
        var isExits = this.cartService.isProductCartExists(product);
        if (isExits && product.preOrderLayaway) {
          this.toasterService.alert('danger', 'This product is already added to your cart.');
          return;
        }

        let details = this.isApply ? this.layAwayDetails : new ProductLayAway();
        this.cartService.addProductToCart(this.ipAddress, product, false, this.user, this.isApply, details, true, this.quantity);
        this.addToCartDisable = false;
      } else {
        this.remainingQuantity = this.product.originalQuantity - this.cartService.getCartCountPerItem(product);
        if (this.remainingQuantity >= 0) {
          this.addToCartDisable = true;
        } else {
          this.remainingQuantity = 0;

        }

      }
    }


  }

  onChange($event: any, product: Product) {
    if ($event != null) {

      // let quantity = 0;
      // let cart = JSON.parse(localStorage.getItem(Utils.CART));
      // if (!Utils.isNullOrUndefined(cart)) {
      //   for (let i = 0; i < cart.length; i++) {
      //     let item = JSON.parse(cart[i]);
      //     if (item.product.id === product.id) {
      //       quantity = item.product.quantity;
      //     }
      //   }
      // }
      this.quantity = Number($event.target.value);
      this.recomputeLayAway();
      // if ($event.target.value > quantity && quantity > 0) {
      //   this.toasterService.alert('danger', 'quantity in cart exceeds stock quantity.');
      //   this.addToCartDisable = true;
      // } else {
      //   this.addToCartDisable = false;
      // }
    }


  }

  openModal() {
    this.selectedImage = this.featureImg;
    this.document.body.classList.add('goofy');
  }

  closeModal() {
    this.selectedImage = null;
    this.document.body.classList.remove('goofy');
  }

  getNumberOfInstallment(num: number) {

    let installmentNumber = Utils.MIN_INSTALLMENT;
    while (installmentNumber <= num) {
      this.numberOfInstallmentList.push({
        id: installmentNumber
      });
      installmentNumber++;
    }
    if (this.numberOfInstallmentList.length > 0)
      this.numberOfInstallmentPayment = this.numberOfInstallmentList[this.numberOfInstallmentList.length - 1].id;


    this.layAwayDates.forEach((dates: any) => {
      this.daysList.push({
        id: dates.paymentDay,
        value: Utils.numericSuffix(dates.paymentDay) + ' of the month'
      });
    });
    if (this.daysList.length > 0)
      this.days = this.daysList[0].id;

  }

  recomputeLayAway() {
    const layAway = {} as any;
    Object.assign(layAway, this.layAway);

    const data = this.days;
    const max = layAway.maxNumberOfInstallmentPayment;
    if (this.numberOfInstallmentPayment > max || data <= Utils.MIN_INSTALLMENT) {
      if (data > Utils.MIN_INSTALLMENT) {
        this.numberOfInstallmentPayment = max;
        this.toasterService.alert('warning', 'you already reach the max installment payment');
      } else {
        this.numberOfInstallmentPayment = Utils.MIN_INSTALLMENT;
      }
    }

    layAway.maxNumberOfInstallmentPayment = this.numberOfInstallmentPayment;
    // tslint:disable-next-line: radix
    layAway.datesOfPayment = this.days;
    this.layAwayDetails = this.layAwayService.getLayAwayDetails(layAway, this.product, this.quantity);
    this.layAwaySchedule = this.layAwayService.getLayAwaySchedule(layAway, this.layAwayDetails.monthly);

  }

  setupLayaway() {
    if (this.dataService.allLayAwayDates.length > 0 && this.dataService.allLayAway.id != undefined) {
      this.layAway = this.dataService.allLayAway;
      this.layAwayDates = this.dataService.allLayAwayDates;
      this.getNumberOfInstallment(this.layAway.maxNumberOfInstallmentPayment);
      this.recomputeLayAway();
    } else {
      this.dataService.selectedLayAway$.subscribe((data: any) => {
        this.layAway = data.layAway;
        this.layAwayDates = data.layAwayDates;
        this.getNumberOfInstallment(this.layAway.maxNumberOfInstallmentPayment);
        this.recomputeLayAway();
      });
    }
  }

  getWishlist() {
    if (!Utils.isArrayNullOrUndefinedOrEmpty(this.wishList.email) && !Utils.isArrayNullOrUndefinedOrEmpty(this.wishList.productId)) {
      this.isloading = true;
      this.userService.getUserWishlishByEmailAndProductId(this.wishList).then((wish: any) => {
        if (wish != null && wish.length > 0)
          this.isWishList = true
        else this.isWishList = false;
        this.isloading = false;
      });
    }
  }

  addToWishList() {
    if (Utils.isArrayNullOrUndefinedOrEmpty(this.user) || this.user.id == 0) {
      this.document.getElementById('userLoginId').click();
      return;
    }
    if (this.user.id == 1) {
      this.toasterService.alert('danger', 'Administrator is not allowed to this feature');
      return;
    }

    this.isloading = true;
    if (!this.isWishList) {
      this.userService.createUserWishlish(this.wishList).then((added) => {
        this.isWishList = true;
        this.isloading = false;
        this.toasterService.alert('success', 'Added to Wishlist.');
      }).catch(() => {
        this.toasterService.alert('danger', 'Error adding to Wish List. Please try again later.');
        this.isloading = false;
      })
    } else {
      this.userService.deleteUserWishlishByEmailAndProductId(this.wishList).then((added) => {
        this.isWishList = !added;
        this.isloading = false;
        this.toasterService.alert('success', 'Removed from Wishlist.');
      })
    }

  }


  login() {
    const user = this.loginForm.getRawValue();
    this.userService.login(user).then((isAdmin: boolean) => {
      if (isAdmin) {
        this.router.navigate(['/administration']).then();
      } else {
        if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
          const email = localStorage.getItem(Utils.LS_EMAIL);
          this.userService.getUserByEmail(email).then((usr: User) => {
            this.cartService.updateUserCart(usr, this.ipAddress).then(() => {
              location.reload();
            });
          });
        }
      }
    }, (error) => {
      this.errorMessage = error.error.message || error.name;
      console.log(error);
    });
  }


  signInWithSocialMedia(socialMedia: string): void {

    if (socialMedia === 'google') {
      this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
        if (user) {
          this.loginForm.controls.email.setValue(user.email);
          this.loginForm.controls.issocialmedialogin.setValue(true);
          this.login();
        }
      }, (error) => {
        console.log(error);
      });
    } else if (socialMedia === 'facebook') {
      this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(user => {
        if (user) {
          this.loginForm.controls.email.setValue(user.email);
          this.loginForm.controls.issocialmedialogin.setValue(true);
          this.login();
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  notify() {
    if (Utils.isArrayNullOrUndefinedOrEmpty(this.user) || this.user.id == 0) {
      this.document.getElementById('userLoginId').click();
      return;
    }
    if (this.user.id == 1) {
      this.toasterService.alert('danger', 'Administrator is not allowed to this feature');
      return;
    }

    if (!this.isNotify) {
      this.userService.createUserProductNotification(this.userNotification).then((added) => {
        this.isNotify = true;
        this.isloading = false;
        this.toasterService.alert('success', 'We will notify you via email once product becomes available.');
      })
    } else {
      this.userService.deleteUserProductNotification(this.userNotification).then((added) => {
        this.isNotify = !added;
        this.toasterService.alert('success', 'You will not be notified when this products becomes available.');
        this.isloading = false;
      })
    }
  }

  getNotificationUser() {
    if (!Utils.isArrayNullOrUndefinedOrEmpty(this.userNotification.email) && !Utils.isArrayNullOrUndefinedOrEmpty(this.userNotification.productId)) {
      this.isloading = true;
      this.userService.userProductNotificationByEmailByProduct(this.userNotification).then((notif: any) => {
        if (notif != null && notif.length > 0)
          this.isNotify = true
        else this.isNotify = false;
        this.isloading = false;
      });
    }
  }

}
