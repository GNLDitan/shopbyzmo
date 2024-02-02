import { Component, OnInit, ViewChild, OnDestroy, Inject } from '@angular/core';
import { Product } from 'src/app/classes/product';
import { ProductService } from 'src/app/services/product.service';
import { environment } from 'src/environments/environment';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { FilterService } from 'src/app/services/filter.service';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { CartService } from 'src/app/services/cart.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Utils } from 'src/app/app.utils';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { IpService } from 'src/app/services/ip.service';
import { Meta } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { takeUntil } from 'rxjs/operators';
import { CategoryService } from 'src/app/services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProductNotification } from 'src/app/classes/user-product-notification';
import { DOCUMENT } from '@angular/common';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { ProductLayAway } from 'src/app/classes/product-layaway';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { LayAway } from 'src/app/classes/layaway';
import { LayAwayDates } from 'src/app/classes/layaway-date';
import { LayAwayService } from 'src/app/services/layaway.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  public products: Product[];
  productFolder: string;
  user: User;
  dataOffset = new BehaviorSubject(new FilterSetting());
  filterList = new FilterSetting();
  infinite: Observable<any[]>;
  scrollEnd: boolean;
  selectedFilter: Subscription;
  hasMore = true;
  ipAddress: string;
  selectedIP: Subscription;
  isInitLoading: boolean;
  allCategory: any;
  userProductNotification: Array<UserProductNotification>;
  isUserNotifLoading: boolean;
  isLoading: boolean = false;

  public layAwaySchedule: Array<LayAwaySchedule>;
  public monthly: number;
  public isShow: boolean;
  public layAwayDetails: ProductLayAway;

  layAway: LayAway;
  layAwayDates: Array<LayAwayDates>;
  numberOfInstallmentList: any;
  daysList: any;
  numberOfInstallmentPayment: number;
  days: number;

  constructor(
    private productService: ProductService,
    private dataService: DataService,
    private navigationService: NavigationService,
    private userService: UserService,
    private cartService: CartService,
    private toasterService: ToasterService,
    private metaService: MetaTagService,
    private spinnerService: NgxSpinnerService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private layAwayService: LayAwayService,
    @Inject(DOCUMENT) private document) {
    this.products = new Array<Product>();
    this.productFolder = environment.productFolderPath;
    this.user = new User();
    this.selectedFilter = new Subscription();
    this.selectedIP = new Subscription();
    this.userProductNotification = new Array();
    this.numberOfInstallmentList = [];
    this.daysList = new Array();

  }

  ngOnInit() {
    this.products = new Array<Product>();
    this.isInitLoading = this.dataService.productInitLoading;
    this.loadAll();
  }
  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          this.checkUser();
          this.subscribeUser();
          this.setupLayaway();
          // this.dataService.selectedFilter$
          //   .pipe(takeUntil(this.onDestroy))
          //   .subscribe((filter) => {
          //     if ((filter.hasOwnProperty('category') && !filter.isInit) || this.isInitLoading) {
          //       this.products = new Array<Product>();
          //       this.filterList = filter;
          //       this.dataService.productInitLoading = false;
          //       this.getBatchProduct(filter);
          //     }
          //   });

          // this.selectedFilter = this.dataService.selectedFilter$.subscribe({
          //   next: (filter) => {
          //     if (filter.hasOwnProperty('category')) {
          //       this.products = new Array<Product>();
          //       this.filterList = filter;
          //       this.getBatchProduct(filter);
          //     }
          //   }
          // });
        }
      }

    });


    this.dataService.selectedCategory$.subscribe((allCategory) => {
      if (allCategory.length > 0) {
        this.allCategory = allCategory;
        this.route.queryParams.subscribe(params => {
          this.filterList = new FilterSetting();
          this.filterList.offset = 0;

          if (!Utils.isArrayNullOrUndefinedOrEmpty(params.category)) {
            const paramCategory = params.category.replace(/-/g, ' ').split(':');
            if (this.allCategory.length > 0) {
              this.filterList.category = this.allCategory.filter(x => paramCategory.indexOf(x.category.toLowerCase()) >= 0).map(x => x.code);
            }
          }
          if (!Utils.isArrayNullOrUndefinedOrEmpty(params.sort)) {
            if (params.sort.toLowerCase() !== 'pre-order') {
              this.filterList.sort = params.sort.replace(/-/g, ' ');
            } else { this.filterList.sort = params.sort; }

          }
          if (!Utils.isArrayNullOrUndefinedOrEmpty(params.tag)) {
            if (params.tag.toLowerCase() !== 'pre-order') {
              this.filterList.tag = params.tag.replace(/-/g, ' ');
            } else {
              this.filterList.tag = params.tag;
            }
          }
          if (!Utils.isArrayNullOrUndefinedOrEmpty(params.tags)) {
            const tags = params.tags.replace(/-/g, ' ').split(':');
            this.filterList.tags = tags;
          }
          if (!Utils.isNullOrUndefined(params.forAdmin)) {
            this.filterList.forAdmin = params.forAdmin === 'true';
          }
          if (!Utils.isNullOrUndefined(params.forLanding)) {
            this.filterList.forLanding = params.forLanding === 'true';
          }
          if (!Utils.isNullOrUndefined(params.forProductList)) {
            this.filterList.forProductList = params.forProductList === 'true';
          }
          this.setFilter();
          this.getBatchProduct(this.filterList);
        });
      }

    });
  }
  ngOnDestroy() {
    // this.dataService.setFilter(new FilterSetting());
    this.selectedFilter.unsubscribe();
    this.dataService.resetObservable();
    // this.selectedFilter.unsubscribe();
  }



  checkUser() {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        this.dataService.setUser(success);
        this.loadNotifcation(success.email);
      }, (error) => {
        console.log(error.error);
      });
    }

  }

  subscribeUser() {
    this.dataService.user$.subscribe(next => {
      this.user = next;
      // this.cartService.validateCartExpiry(next);
      this.cartService.getCarts(this.user, this.ipAddress);
    });
  }



  getBatchProduct(filter: FilterSetting) {
    this.spinnerService.show();
    this.isLoading = true;
    filter.forProductList = true;
    this.productService.getProductsListRange(filter).then((products: Array<Product>) => {
      //products = products.filter(x => x.isactive);
      this.hasMore = products.length >= Utils.PRODUCT_LIMIT;
      if (filter.offset == 0) {
        this.products = new Array<Product>();
      }
      // products = products.filter(x => x.quantity > 0);
      products.map((product) => {
        product.displayTag = '';
        const currentImage = product.productImages.filter(x => x.isDefaultImage).length > 0
          ? product.productImages.find(x => x.isDefaultImage) :
          product.productImages[0];
        product.currentImageUrl = this.productFolder + currentImage.fileName;
        product.originalQuantity = product.quantity;

        if (product.tags.length > 0) {
          const sale = Utils.FEATURE_TYPE.onSale.toLowerCase();
          const preOrder = Utils.FEATURE_TYPE.preOrder.toLowerCase();
          const justArrived = Utils.FEATURE_TYPE.justArrived.toLowerCase();
          const preOrderLayaway = Utils.FEATURE_TYPE.preOrderLayaway.toLowerCase();

          const tag = product.tags.filter(x => x.name.toLowerCase() === sale);

          if (tag.length > 0 || product.onSale) {
            product.displayTag = tag.length > 0 ? tag[0].name : sale;
          } else {
            const tag = product.tags.filter(x => x.name.toLowerCase() === justArrived);
            if (tag.length > 0) {
              product.displayTag = tag[0].name;
            } else {
              const tag = product.tags.filter(x => x.name.toLowerCase() === preOrder);
              if (tag.length > 0 || product.preOrder) {
                product.displayTag = tag.length > 0 ? tag[0].name : preOrder;
              } else {
                const tag = product.tags.filter(x => x.name.toLowerCase() === preOrderLayaway);
                if (tag.length > 0 || product.preOrderLayaway) {
                  product.displayTag = tag.length > 0 ? tag[0].name : preOrder;
                }
              }
            }
          }

        }
        product.isNotification = this.userProductNotification.filter(x => x.productId = product.id).length > 0;
        // for sort
        // if (product.displayTag === 'just arrived') {
        //   product.sorting = 1;
        // } else if (product.displayTag === 'pre-order') {
        //   product.sorting = 3;
        // } else if (product.displayTag === 'on sale') {
        //   product.sorting = 4;
        // } else {
        //   product.sorting = 2;
        // }
      });

      if (!Utils.arraysEqual(this.products, products)) {
        Array.prototype.push.apply(this.products, products);
      }
      //this.products = this.products.filter(x => x.isactive);

      this.products = this.products.sort((a, b) => (a.sorting < b.sorting ? -1 : 1));
      this.isLoading = false;
      this.spinnerService.hide();
    });
  }


  showMore() {
    const filter = this.filterList;
    this.filterList.offset = this.products.length;
    this.getBatchProduct(filter);
  }

  /* Removed for SEO crawl
  selectProduct(product: Product) {
    this.navigationService.toProductInformationByLinkName(product);
  }
  */

  addProductToCart(product: Product) {
    if (this.user.isAdmin) {
      this.toasterService.alert('danger', 'adding cart logged in as admin');
    } else {
      product.quantity = 1;
      const isValid = this.cartService.validateCart(product, this.user, product.originalQuantity, this.ipAddress);
      if (isValid || Utils.isNullOrUndefined(isValid)) {
        var isExits = this.cartService.isProductCartExists(product);
        if (isExits && product.preOrderLayaway) {
          this.toasterService.alert('danger', 'This product is already added to your cart.');
          return;
        }
        // if (product.preOrderLayaway) {
        //   this.recomputeLayAway(product);
        //   let details = this.layAwayDetails;
        //   this.cartService.addProductToCart(this.ipAddress, product, false, this.user, true, details, true, 1);
        // } else {
        this.cartService.addProductToCart(this.ipAddress, product, false, this.user);
        // }
      }
    }

  }


  setFilter() {
    const activeFilter = this.filterList;
    const category = this.filterList.category;
    const hierarch = [];
    category.forEach((code) => {
      const subs = this.categoryService.getAllSubCategories(code);
      const filterDetails = this.allCategory.filter(x => this.filterList.category.filter(s => s === x.code).length > 0);
      const found = subs.some(r => filterDetails.filter(x => x.code !== code).indexOf(r) >= 0);

      if (!found) {
        hierarch.push(code);
        subs.map(x => {
          hierarch.push(x.code);
        });
      }

    });

    activeFilter.category = hierarch;
    activeFilter.offset = 0;
  }

  addNotification(product, e) {
    if (Utils.isArrayNullOrUndefinedOrEmpty(this.user.email)) {
      this.document.getElementById('userLoginId').click();
      e.stopPropagation();
      return;
    }


    const notification = new UserProductNotification();
    notification.productId = product.id;
    notification.email = this.user.email;
    if (!product.isNotification) {
      this.userService.createUserProductNotification(notification).then(() => {
        product.isNotification = !product.isNotification;
        this.toasterService.alert('success', 'We will notify you via email once product becomes available.');
      });
    } else {
      this.userService.deleteUserProductNotification(notification).then(() => {
        product.isNotification = !product.isNotification;
        this.toasterService.alert('success', 'You will not be notified when this products becomes available.');
      });
    }

  }

  loadNotifcation(email: string) {
    this.isUserNotifLoading = true;
    this.userService.userProductNotificationByEmail(email).then((notif: any) => {
      this.userProductNotification = notif;
      this.userProductNotification.map((notif) => {
        this.products.filter(x => x.id == notif.productId)
          .map((x) => x.isNotification = true);
      });
      this.isUserNotifLoading = false;
    });
  }


  setupLayaway() {
    if (this.dataService.allLayAwayDates.length > 0 && this.dataService.allLayAway.id != undefined) {
      this.layAway = this.dataService.allLayAway;
      this.layAwayDates = this.dataService.allLayAwayDates;
      this.getNumberOfInstallment(this.layAway.maxNumberOfInstallmentPayment);
    } else {
      this.dataService.selectedLayAway$.subscribe((data: any) => {
        if (data.layAwayDates.length > 0) {
          this.layAway = data.layAway;
          this.layAwayDates = data.layAwayDates;
          this.getNumberOfInstallment(this.layAway.maxNumberOfInstallmentPayment);
        }
      });
    }
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

  recomputeLayAway(product: Product) {
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
    this.layAwayDetails = this.layAwayService.getLayAwayDetails(layAway, product, 1);
    this.layAwaySchedule = this.layAwayService.getLayAwaySchedule(layAway, this.layAwayDetails.monthly);

  }


}
