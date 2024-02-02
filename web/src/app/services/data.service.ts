import { Injectable } from '@angular/core';
import { User } from '../classes/user';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../classes/product';
import { ProductInventory } from '../classes/product-inventory';
import { FilterSetting } from '../classes/filter-settings';
import { ProductCategory } from '../classes/product-category';
import { BlogContent } from '../classes/blog-content';
import { Blog } from '../classes/blog';
import { FileMapper } from '../classes/file-mapper';
import { Comment } from 'less-offset-comments';
import { Cart } from '../classes/cart';
import { LayAway } from '../classes/layaway';
import { LayAwayDates } from '../classes/layaway-date';
import { ShippingDetails } from '../classes/shipping-details';
import { Shipping } from '../classes/shipping';
import { Discount } from '../classes/discount';
import { PaymentMethodAccount } from '../classes/payment-method-account';
import { PaymentMethod } from '../classes/payment-method';
import { Order } from '../classes/order';
import { LayAwaySchedule } from '../classes/layaway-schedule';
import { BraintreePayment } from '../classes/braintree-payment';
import { PreOrderSchedule } from '../classes/pre-order-schedule';
import { HomeFeatures } from '../classes/home-features';
import { PaymentTotal } from '../classes/payment-total';
import { CostBreakDown } from '../classes/cost-breakdown';
import { ShippingAddress } from '../classes/shipping-address';
import { UserProductNotification } from '../classes/user-product-notification';

@Injectable({
  providedIn: 'root'
})
export class DataService {


  selectedRate: number;
  activeUser: User;
  activeFilter: FilterSetting;
  activeDiscount: Discount;
  activeShippingDetails: ShippingDetails;
  allCategory: Array<ProductCategory>;
  allLayAway: LayAway;
  allLayAwayDates: Array<LayAwayDates>;
  user$: Observable<User>;
  currentUserId: number;
  users$: Observable<Array<User>>;
  category$: Observable<Array<ProductCategory>>;
  activeCart: Array<Cart>;
  selectedAdminCategory$: Observable<ProductCategory>;
  productInitLoading = true;
  selectedLayAway$: Observable<{
    layAway: LayAway,
    layAwayDates: Array<LayAwayDates>
  }>;
  activeBlog: Blog;
  selectedUser$: Observable<User>;
  selectedproduct$: Observable<Product>;
  selectedProductInventory$: Observable<ProductInventory>;
  selectedFilter$: Observable<FilterSetting>;
  selectedGlobalFilter$: Observable<FilterSetting>;
  selectedCategory$: Observable<Array<ProductCategory>>;
  selectedContent$: Observable<BlogContent>;
  selectedBlog$: Observable<Blog>;
  selectedLanding$: Observable<FileMapper>;
  selectedComments$: Observable<Array<Comment>>;
  selectedShippingDetails$: Observable<ShippingDetails>;
  selectedShippingAddress$: Observable<ShippingAddress>;
  selectedBraintreePayment$: Observable<BraintreePayment>;
  selectedCostBreakDown$: Observable<CostBreakDown>;
  selectedCreditCardMethod$: Observable<PaymentMethod>;


  productCart$: Observable<Array<Cart>>;
  selectedShipping$: Observable<Shipping>;
  selectedDiscount$: Observable<Discount>;
  selectedAccount$: Observable<PaymentMethodAccount>;
  selectedPaymentMethod$: Observable<PaymentMethod>;
  selectedOrder$: Observable<Order>;
  selectedClientOrders$: Observable<Array<Order>>;
  selectedIpAddress$: Observable<string>;
  selectedLayAwaySched$: Observable<LayAwaySchedule>;
  selectedPreOrderSched$: Observable<PreOrderSchedule>;
  selectedHomeFeature$: Observable<HomeFeatures>;
  selectedPaymentTotal$: Observable<PaymentTotal>;
  selectedSpecialInstruction$: Observable<string>;
  selectedUserProductNotification$: Observable<Array<UserProductNotification>>;
  currencyRates$: Observable<Array<any>>;
  isScriptDone$: Observable<boolean>;

  // Properties
  private users: Array<User>;

  // Source
  private userSource: BehaviorSubject<User>;
  private usersSource: BehaviorSubject<Array<User>>;
  private productSource: BehaviorSubject<Product>;
  private productInventroySource: BehaviorSubject<ProductInventory>;
  private filterSource: BehaviorSubject<FilterSetting>;
  private filterGlobalSource: BehaviorSubject<FilterSetting>;
  private categorySource: BehaviorSubject<Array<ProductCategory>>;
  private selectedContentSource: BehaviorSubject<BlogContent>;
  private selectedBlogSource: BehaviorSubject<Blog>;
  private selectedLandingImageSource: BehaviorSubject<FileMapper>;
  private selectedProductCartSource: BehaviorSubject<Array<Cart>>;
  private selectedAdminCategorytSource: BehaviorSubject<ProductCategory>;
  private selectedShippingSource: BehaviorSubject<Shipping>;
  private selectedShippingDetailsSource: BehaviorSubject<ShippingDetails>;
  private selectedShippingAddressSource: BehaviorSubject<ShippingAddress>;
  private selectedDiscountSource: BehaviorSubject<Discount>;
  private selectedAccountSource: BehaviorSubject<PaymentMethodAccount>;
  private selectedLayAwaySource: BehaviorSubject<{
    layAway: LayAway,
    layAwayDates: Array<LayAwayDates>
  }>;
  private selectedPaymentMethodSource: BehaviorSubject<PaymentMethod>;
  private selectedOrderSource: BehaviorSubject<Order>;
  private selectedClientOrdersSource: BehaviorSubject<Array<Order>>;
  private selectedLayAwaySchedSource: BehaviorSubject<LayAwaySchedule>;
  private selectedPreOrderSchedSource: BehaviorSubject<PreOrderSchedule>;
  private selectedBraintreePaymentSource: BehaviorSubject<BraintreePayment>;
  private selectedIpSource: BehaviorSubject<string>;
  private selectedHomeFeatureSource: BehaviorSubject<HomeFeatures>;
  private selectedPaymentTotalSource: BehaviorSubject<PaymentTotal>;
  private selectedCostBreakDownSource: BehaviorSubject<CostBreakDown>;
  private selectedSpecialInstructionSource: BehaviorSubject<string>;
  private selectedUserProductNotificationSource: BehaviorSubject<Array<UserProductNotification>>;
  private currencyRatesSource: BehaviorSubject<Array<any>>;
  private isScriptDoneSource: BehaviorSubject<boolean>;
  private selectedCreditCardMethodSource: BehaviorSubject<PaymentMethod>;
  
  constructor() {
    this.allCategory = new Array();
    this.activeFilter = new FilterSetting();
    this.allLayAway = new LayAway();
    this.allLayAwayDates = Array<LayAwayDates>();
    this.activeShippingDetails = new ShippingDetails();
    this.activeCart = new Array();
    this.activeUser = new User();
    this.activeBlog = new Blog();
    this.activeDiscount = new Discount();
    this.selectedRate = 0;
    this.userSource = new BehaviorSubject(new User());
    this.currentUserId = 0;
    this.usersSource = new BehaviorSubject(new Array<User>());
    this.productSource = new BehaviorSubject(new Product());
    this.productInventroySource = new BehaviorSubject(new ProductInventory());
    this.filterSource = new BehaviorSubject(new FilterSetting());
    this.filterGlobalSource = new BehaviorSubject(new FilterSetting());
    this.categorySource = new BehaviorSubject(new Array<ProductCategory>());
    this.selectedContentSource = new BehaviorSubject(new BlogContent());
    this.selectedBlogSource = new BehaviorSubject(new Blog());
    this.selectedLandingImageSource = new BehaviorSubject(new FileMapper());
    this.selectedProductCartSource = new BehaviorSubject(new Array<Cart>());
    this.selectedAdminCategorytSource = new BehaviorSubject(new ProductCategory());
    this.selectedShippingDetailsSource = new BehaviorSubject(new ShippingDetails());
    this.selectedLayAwaySource = new BehaviorSubject({
      layAway: new LayAway(),
      layAwayDates: new Array<LayAwayDates>()
    });
    this.currencyRatesSource = new BehaviorSubject(new Array());

    this.selectedShippingSource = new BehaviorSubject(new Shipping());
    this.selectedDiscountSource = new BehaviorSubject(new Discount());
    this.selectedAccountSource = new BehaviorSubject(new PaymentMethodAccount());
    this.selectedPaymentMethodSource = new BehaviorSubject(new PaymentMethod());
    this.selectedCreditCardMethodSource = new BehaviorSubject(new PaymentMethod());
    this.selectedOrderSource = new BehaviorSubject(new Order());
    this.selectedClientOrdersSource = new BehaviorSubject(new Array<Order>());
    this.selectedLayAwaySchedSource = new BehaviorSubject(new LayAwaySchedule());
    this.selectedBraintreePaymentSource = new BehaviorSubject(new BraintreePayment());
    this.selectedPreOrderSchedSource = new BehaviorSubject(new PreOrderSchedule());
    this.selectedIpSource = new BehaviorSubject('');
    this.selectedHomeFeatureSource = new BehaviorSubject(new HomeFeatures());
    this.selectedPaymentTotalSource = new BehaviorSubject(new PaymentTotal());
    this.selectedCostBreakDownSource = new BehaviorSubject(new CostBreakDown());
    this.selectedShippingAddressSource = new BehaviorSubject(new ShippingAddress());
    this.selectedSpecialInstructionSource = new BehaviorSubject('');
    this.selectedUserProductNotificationSource = new BehaviorSubject(new Array());
    this.isScriptDoneSource = new BehaviorSubject(false);

    this.user$ = this.userSource.asObservable();
    this.users$ = this.usersSource.asObservable();
    this.selectedproduct$ = this.productSource.asObservable();
    this.selectedProductInventory$ = this.productInventroySource.asObservable();
    this.selectedFilter$ = this.filterSource.asObservable();
    this.selectedGlobalFilter$ = this.filterGlobalSource.asObservable();
    this.selectedCategory$ = this.categorySource.asObservable();
    this.selectedContent$ = this.selectedContentSource.asObservable();
    this.selectedBlog$ = this.selectedBlogSource.asObservable();
    this.selectedLanding$ = this.selectedLandingImageSource.asObservable();
    this.productCart$ = this.selectedProductCartSource.asObservable();
    this.selectedAdminCategory$ = this.selectedAdminCategorytSource.asObservable();
    this.selectedLayAway$ = this.selectedLayAwaySource.asObservable();
    this.selectedShippingDetails$ = this.selectedShippingDetailsSource.asObservable();
    this.selectedShipping$ = this.selectedShippingSource.asObservable();
    this.selectedDiscount$ = this.selectedDiscountSource.asObservable();
    this.selectedAccount$ = this.selectedAccountSource.asObservable();
    this.selectedPaymentMethod$ = this.selectedPaymentMethodSource.asObservable();
    this.selectedCreditCardMethod$ = this.selectedCreditCardMethodSource.asObservable();
    this.selectedOrder$ = this.selectedOrderSource.asObservable();
    this.selectedClientOrders$ = this.selectedClientOrdersSource.asObservable();
    this.selectedLayAwaySched$ = this.selectedLayAwaySchedSource.asObservable();
    this.selectedBraintreePayment$ = this.selectedBraintreePaymentSource.asObservable();
    this.selectedPreOrderSched$ = this.selectedPreOrderSchedSource.asObservable();
    this.selectedIpAddress$ = this.selectedIpSource.asObservable();
    this.selectedHomeFeature$ = this.selectedHomeFeatureSource.asObservable();
    this.selectedPaymentTotal$ = this.selectedPaymentTotalSource.asObservable();
    this.selectedCostBreakDown$ = this.selectedCostBreakDownSource.asObservable();
    this.selectedShippingAddress$ = this.selectedShippingAddressSource.asObservable();
    this.selectedSpecialInstruction$ = this.selectedSpecialInstructionSource.asObservable();
    this.selectedUserProductNotification$ = this.selectedUserProductNotificationSource.asObservable();
    this.currencyRates$ = this.currencyRatesSource.asObservable();
    this.isScriptDone$ = this.isScriptDoneSource.asObservable();
  }

  setIP(ipAddress: string) {
    this.selectedIpSource.next(ipAddress);
  }
  clearBlog() {
    this.selectedBlogSource = new BehaviorSubject(new Blog());
    this.selectedBlog$ = this.selectedBlogSource.asObservable();
  }

  setCart(cart: Array<Cart>) {
    this.activeCart = cart;
    this.selectedProductCartSource.next(cart);
  }

  setUser(user: User) {
    this.activeUser = user;
    this.userSource.next(user);
  }

  setProduct(product: Product) {
    this.productSource.next(product);
  }

  setProductInventory(inventory: ProductInventory) {
    this.productInventroySource.next(inventory);
  }

  setCategory(category: Array<ProductCategory>) {
    this.allCategory = category;
    this.categorySource.next(category);
  }

  setFilter(filter: FilterSetting) {
    this.activeFilter = filter;
    filter.isInit = false;
    this.filterSource.next(filter);
  }

  setSelectedContent(content: BlogContent) {
    this.selectedContentSource.next(content);
  }

  setBlog(blog: Blog) {
    this.selectedBlogSource.next(blog);
    this.activeBlog = blog;
  }

  setLandingImage(landing: FileMapper) {
    this.selectedLandingImageSource.next(landing);
  }

  setGlobalFilter(filter: FilterSetting) {
    this.activeFilter = filter;
    filter.isInit = false;
    this.filterGlobalSource.next(filter);
  }

  setSelectedCategory(selectedCategory: ProductCategory) {
    this.selectedAdminCategorytSource.next(selectedCategory);
  }

  setLayAwayAndDates(layAway: LayAway, layAwayDates: Array<LayAwayDates>) {
    if (layAwayDates.length > 0) {
      this.allLayAwayDates = layAwayDates;
    }
    if (layAway.id !== undefined) {
      this.allLayAway = layAway;
    }

    if (this.allLayAwayDates.length > 0 && this.allLayAway.id !== undefined) {
      this.selectedLayAwaySource.next({
        layAway,
        layAwayDates
      });
    }
  }

  setActiveShippingDetails(param: ShippingDetails) {
    this.activeShippingDetails = param;
    this.selectedShippingDetailsSource.next(param);
  }

  setShipping(shipping: Shipping) {
    this.selectedShippingSource.next(shipping);
  }

  setDiscount(discount: Discount) {
    this.selectedDiscountSource.next(discount);
    this.activeDiscount = discount;
  }

  setSelectedAccount(account: PaymentMethodAccount) {
    this.selectedAccountSource.next(account);
  }

  setPaymentMethod(paymentMethod: PaymentMethod) {
    this.selectedPaymentMethodSource.next(paymentMethod);
  }

  setCreditCardMethod(paymentMethod: PaymentMethod) {
    this.selectedCreditCardMethodSource.next(paymentMethod);
  }

  setOrder(order: Order) {
    this.selectedOrderSource.next(order);
  }

  setClientOrders(orders: Array<Order>) {
    this.selectedClientOrdersSource.next(orders);
  }

  setLayawaySchedule(sched: LayAwaySchedule) {
    this.selectedLayAwaySchedSource.next(sched);
  }

  setBraintreePayment(payment: BraintreePayment) {
    this.selectedBraintreePaymentSource.next(payment);
  }

  setPreOrderPayment(sched: PreOrderSchedule) {
    this.selectedPreOrderSchedSource.next(sched);
  }

  resetShippingOrderDetails() {
    this.selectedShippingDetailsSource = new BehaviorSubject(new ShippingDetails());
    this.selectedOrderSource = new BehaviorSubject(new Order());
    this.selectedShippingSource = new BehaviorSubject(new Shipping());

    this.selectedShippingDetails$ = this.selectedShippingDetailsSource.asObservable();
    this.selectedShipping$ = this.selectedShippingSource.asObservable();
    this.selectedOrder$ = this.selectedOrderSource.asObservable();

    this.activeShippingDetails = new ShippingDetails();
  }

  setSelectedHomeFeature(feature: HomeFeatures) {
    this.selectedHomeFeatureSource.next(feature);
  }

  resetObservable() {
    this.filterSource = new BehaviorSubject(new FilterSetting());
    this.selectedFilter$ = this.filterSource.asObservable();
  }

  setPaymentTotal(payment: PaymentTotal) {
    this.selectedPaymentTotalSource.next(payment);
  }

  setCostBreakDown(costBreakDown: CostBreakDown) {
    this.selectedCostBreakDownSource.next(costBreakDown);
  }

  setShippingAddress(shippingDetails: ShippingAddress) {
    this.selectedShippingAddressSource.next(shippingDetails);
  }

  setSpecialInstruction(instruction: string) {
    this.selectedSpecialInstructionSource.next(instruction);
  }

  setUserProductNotification(notif: Array<UserProductNotification>) {
    this.selectedUserProductNotificationSource.next(notif);
  }

  setCurrencyRates(rates: Array<any>) {
    this.currencyRatesSource.next(rates);
  }

  scriptDone(isdone: boolean) {
    this.isScriptDoneSource.next(isdone);
  }

  setSelectedRate(rate: number) {
    this.selectedRate = rate;
  }


}
