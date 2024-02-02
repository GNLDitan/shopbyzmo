import { Component, OnInit, ViewChild, HostListener, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/classes/user';
import { Router } from '@angular/router';
import { Utils } from 'src/app/app.utils';

import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';
import { FilterService } from 'src/app/services/filter.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { NavigationService } from 'src/app/services/navigation.service';

import * as AOS from 'aos';
import { Product } from 'src/app/classes/product';
import { ProductService } from 'src/app/services/product.service';
import { environment } from 'src/environments/environment';
import { CategoryService } from 'src/app/services/category.service';

import { AuthService, FacebookLoginProvider } from 'angularx-social-login';
import { SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { Validity } from 'src/app/classes/validity';
import { Cart } from 'src/app/classes/cart';
import { CartService } from 'src/app/services/cart.service';
import { BlogService } from 'src/app/services/blog.service';
import { Blog } from 'src/app/classes/blog';
import { IpService } from 'src/app/services/ip.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { HomeFeatures } from 'src/app/classes/home-features';
import { PaymongoService } from 'src/app/services/paymongo.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  @ViewChild('navbar', { static: false }) navbar: ElementRef;
  @ViewChild('closeLoginModal', { static: false }) closeLoginModal: ElementRef;
  isMenuOpened: boolean;
  melloIndex: number;
  preventClickout: boolean;
  loginForm: FormGroup;
  isLogin: boolean;
  currentUser: string;
  errorMessage: string;
  loginUser: User;
  user: User;
  isUserAdmin: boolean;
  filterOrder: any;
  allCategory: any;
  categoryList: any;
  isHover: boolean;
  searchProducts: Array<Product>;
  inputSearchProduct: string;
  filterSettings: FilterSetting;
  productFolder: string;
  socialUser: SocialUser;
  cart: Cart[] = [];
  selectedCategory: Subscription;
  selectedHomeFeature: Subscription;
  searchBlogs: Array<Blog>;
  blogFolder: string;
  ipAddress: string;
  productCartObservable: any;
  ipAddressSubscription: any;
  userIp: string;
  nameAbbrev = '';
  showNoResults: boolean;
  feature: HomeFeatures;
  isCollapsed: boolean;
  selectedIP: Subscription;
  currRouter: Router;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private dataService: DataService,
    private filterService: FilterService,
    private navigationService: NavigationService,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private blogService: BlogService,
    private cartService: CartService,
    private metaTagService: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document) {

    this.currRouter = this.router;
    this.isMenuOpened = false;
    this.melloIndex = -1;
    this.preventClickout = false;
    this.isHover = false;
    this.isLogin = false;
    this.currentUser = '';
    this.errorMessage = '';
    this.user = new User();
    this.isUserAdmin = false;
    this.filterOrder = Utils.FILTER_ORDER;
    this.categoryList = [];
    this.filterSettings = new FilterSetting();
    this.searchProducts = new Array();
    this.productFolder = environment.productFolderPath;
    this.blogFolder = environment.blogFolderPath;
    this.loginUser = new User();
    this.searchBlogs = new Array();
    this.selectedHomeFeature = new Subscription();
    this.feature = new HomeFeatures();
    this.selectedCategory = new Subscription();

    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      issocialmedialogin: [false]
    });

    if (isPlatformBrowser(this.platformId)) {
      AOS.init();

      this.isLogin = !Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN));
      if (this.isLogin) {
        this.currentUser = localStorage.getItem(Utils.LS_EMAIL);
      }

      this.ipAddress = '';
      this.userIp = '';
    }

    this.isCollapsed = false;
    this.selectedIP = new Subscription();

  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAll();
    }
  }

  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          this.checkUser(this.ipAddress);
          this.setCart();
        }
      }
    });
  }

  setCart() {
    this.dataService.productCart$.subscribe((next) => {
      this.cart = next;
    });

    if (this.dataService.allCategory.length === 0) {
      this.selectedCategory = this.dataService.selectedCategory$.subscribe((category) => {
        if (category.length > 0) {
          this.allCategory = category;
          this.allCategory = this.allCategory.sort((a, b) => (a.rowNumber < b.rowNumber ? -1 : 1));
          this.selectedHomeFeature = this.dataService.selectedHomeFeature$.subscribe((feature) => {
            this.feature = feature;
            this.categoryContent();
          });
        }
      });
    } else {
      this.allCategory = this.dataService.allCategory;
      this.allCategory = this.allCategory.sort((a, b) => (a.rowNumber < b.rowNumber ? -1 : 1));
      this.selectedHomeFeature = this.dataService.selectedHomeFeature$.subscribe((feature) => {
        this.feature = feature;
        this.categoryContent();
      });
    }
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

  ngOnDestroy() {
    this.selectedHomeFeature.unsubscribe();
  }

  signOut(): void {
    this.authService.signOut();
    localStorage.removeItem(Utils.CART);
  }

  // checkLoginStatus() {
  //   this.melloIndex === 0 ? this.melloIndex = -1 : this.melloIndex = 0;
  //   if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
  //     this.currentUser = localStorage.getItem(Utils.LS_EMAIL);
  //     this.isLogin = true;
  //   }
  // }

  checkUser(ipAddress: string) {

    // social media
    this.authService.authState.subscribe((user) => {
      this.socialUser = user;
    });

    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        this.dataService.setUser(success);
        if (success.hasOwnProperty('id')) {
          this.user = success;
          this.nameAbbrev = Utils.generateNameAbbrev(this.user.name);
          this.isUserAdmin = this.user.isAdmin;
          this.userIp = this.user.id.toString().concat('-', this.ipAddress);
          // this.cartService.validateCartExpiry(next);
          this.cartService.getCarts(success, this.ipAddress);

        } else {
          this.cartService.getCarts(this.user, this.ipAddress);
          this.preventClickout = true;
          this.melloIndex = 0;
          setTimeout(() => {
            this.preventClickout = false;
          }, 500);
        }

      }, (error) => {
        this.logout();
        console.log(error.error);
      });
    } else {
      this.cartService.getCarts(this.user, this.ipAddress);
    }

  }

  login() {
    if (this.loginForm.valid && !this.loginForm.controls.issocialmedialogin.value) {
      this.loginUser = this.loginForm.getRawValue();
      this.userLogin(this.loginUser);
    } else if (this.loginForm.controls.issocialmedialogin.value) {
      this.loginUser = this.loginForm.getRawValue();
      this.loginUser.name = this.socialUser.name;
      this.loginUser.isSocialMediaLogin = true;

      this.userService.checkEmailValidity(this.loginUser).then((validity: Validity) => {
        if (validity != null) {
          if (validity.validEmail) {
            this.userService.createUser(this.loginUser).then((success) => {
              if (success) {
                this.userLogin(this.loginUser);
              }
            }, (error) => { });
          } else {
            this.userLogin(this.loginUser);
          }

        }
      });

    }
    // if (!this.user.isAdmin) {
    //   location.reload();
    // }
    // location.reload();
  }
  updateCart(user: User) {

    this.userService.getUserByEmail(user.email).then((usr: any) => {
      if (usr.hasOwnProperty('id')) {
        usr.ipAddress = this.ipAddress;
        this.cartService.updateCartUser(usr).then((isUpdated: any) => {
          if (!Utils.isNullOrUndefined(isUpdated)) {
            this.cartService.getCarts(usr, this.ipAddress);
            location.reload();
          }
        });
      }

    });
  }

  userLogin(user: any) {
    this.userService.login(user).then((success: boolean) => {
      if (success) {
        this.router.navigate(['/administration']).then();
        this.isLogin = true;
      } else {
        if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
          this.currentUser = localStorage.getItem(Utils.LS_EMAIL);
          this.melloIndex = -1;
          this.isLogin = true;
          this.updateCart(user);
        }
      }

      this.closeLoginModal.nativeElement.click();
    }, (error) => {
      // this.errorMessage = error.error.message || error.name;
      this.errorMessage = "Email or password is incorrect";
      console.log(error);
    });
  }

  logout() {
    this.userService.logout();
    localStorage.removeItem(Utils.CART);
    this.navigationService.toHome();
    // location.reload();
  }

  toggle_visibility(id) {
    const e = this.document.getElementById(id);
    if (e.style.display === 'block') {
      e.style.display = 'none';
    } else {
      e.style.display = 'block';
    }
  }

  leave() {
    this.showNoResults = false;
  }

  // @HostListener('window:scroll', ['$event']) // for window scroll events
  // onScroll(event) {
  //   if (event.target.scrollingElement.scrollTop > 50 || event.target.scrollingElement.scrollTop > 50) {
  //     this.navbar.nativeElement.classList.add('fixed-top');
  //   } else {
  //     this.navbar.nativeElement.classList.remove('fixed-top');
  //   }
  // }


  categoryContent() {
    const collectibleBrand = this.categoryService.getAllSubCategories('CD')
      .filter(x => x.categoryHierarchy === 'brand');
    const brandCD = [];
    this.categoryList = [];
    Object.values(this.feature).map((feature) => {
      const subs = this.categoryService.getAllSubCategories(feature);
      const brandResult = collectibleBrand.filter(x => x.code == feature)[0];
      if (subs) {
        brandCD.push({
          brand: brandResult,
          subs
        });
      }
    });
    this.categoryList.push({
      title: 'Collectible Dolls',
      brand: brandCD
    });

    this.categoryList.push({
      title: 'Other Category',
      brand: this.dataService.allCategory.filter(x => x.categoryHierarchy === 'category' && x.code !== 'CD')
    });
  }

  categoryDisplay(event: any) {
    this.isHover = (event.target.innerText === 'PRODUCTS');
    // this.isHover = false;
  }

  selectCategory(cl) {
    this.filterSettings = new FilterSetting();
    if (cl !== '') {
      this.filterSettings.category.push(cl.category.toLowerCase());
    }
    this.filterSettings.forLanding = false;
    this.filterSettings.forProductList = true;
    this.filterSettings.tag = '';
    this.isHover = false;
    this.navigationService.toProductsFilter(this.filterSettings);
  }

  resetProductList() {
    this.inputSearchProduct = '';
    this.searchProducts = new Array();
    this.searchBlogs = new Array();
    this.showNoResults = false;
  }

  searchProductList() {
    if (!Utils.isStringNullOrEmpty(this.inputSearchProduct)) {
      let filterSettings = new FilterSetting()
      filterSettings.productName =
      filterSettings.blogName = this.inputSearchProduct;
      filterSettings.forProductList = true;
      this.productService.getProductsListRange(filterSettings).then((searchProducts: any) => {
        this.searchProducts = searchProducts;
        this.showNoResults = this.searchProducts.length === 0;
        this.searchProducts.map((product) => {
          const currentImage = product.productImages.filter(x => x.isDefaultImage).length > 0 ?
            product.productImages.find(x => x.isDefaultImage) :
            product.productImages[0];
          product.currentImageUrl = this.productFolder + currentImage.fileName;
        });

      });

      this.blogService.getBlogsListRangeDate(this.filterSettings).then((blogs: any) => {
        this.searchBlogs = blogs;
        this.searchBlogs.map((blog) => {
          const currentImage = blog.coverFileName;
          blog.coverFileName = this.blogFolder + currentImage;
        });
      });

    } else {
      this.searchProducts = new Array();
      this.searchBlogs = new Array();
    }

  }

  onClickedOutside(e: Event) {
    this.showNoResults = this.inputSearchProduct === '' ? false : this.showNoResults;
  }

  goToProduct(product: any) {
    this.inputSearchProduct = '';
    this.searchProducts = new Array();
    this.navigationService.toProductInformationByLinkName(product);
  }

  goToBlog(blog: any) {
    this.inputSearchProduct = '';
    this.searchProducts = new Array();
    this.navigationService.toBlogContent(blog);
  }

  /* Removed for SEO crawl
    const filter = new FilterSetting();
    filter.forLanding = false;
    filter.forProductList = true;
    filter.tag = '';
    filter.sort = '';
    filter.category = [];
    filter.tags = [];
    this.navigationService.toProductsFilter(filter);
  }
  */
}
