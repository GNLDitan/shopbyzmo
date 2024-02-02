import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { BreadcrumbModule } from 'primeng/primeng';
import { QuillModule } from 'ngx-quill';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgbModule, NgbDateAdapter, NgbDateNativeAdapter, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ScrollDispatchModule, ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider, SocialLoginModule } from 'angularx-social-login';
import { ShareButtonModule } from '@ngx-share/button';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { UrlSerializer } from '@angular/router';
import { NgPaymentCardModule } from 'ng-payment-card';
import { NgxSandCreditCardsModule } from 'ngx-sand-credit-cards'
// Providers
import { UrlLowerCaseSerializer } from './providers/url-lower-case-serializer';
// Service
import { AppInterceptor } from './app.interceptor';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ValidatorService } from './services/validator.service';
import { ProductService } from './services/product.service';
import { NgbDateCustomParserFormatter } from './services/date-formatter.service';
import { NgbdateNativeCustomAdapterService } from './services/ngbdate-native-custom-adapter.service';
// import { NgxPayPalModule } from 'ngx-paypal';
// Guard
import { AdminGuard } from './guards/admin.guard';
import { ForgotPasswordGuard } from './guards/forgot-password.guard';
import { ProductGuard } from './guards/product.guard';
import { ProductInventoryGuard } from './guards/product-inventory.guard';

// Directives
import { ControlErrorsDirective } from './directives/control-errors.directive';
import { FormSubmitDirective } from './directives/form-submit.directive';
import { ControlErrorContainerDirective } from './directives/control-error-container.directive';
// Pipes
import { SanitizeHtmlPipe } from './pipes/SanitizeHtmlPipe';
import { SafePipe } from './pipes/safe.pipe';
// Application components
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SignupComponent } from './components/profile/signup/signup.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { ProductComponent } from './components/administration/product/product.component';
import { AddProductComponent } from './components/administration/product/add-product/add-product.component';
import { ForgotPasswordVerifyComponent } from './components/forgot-password/forgot-password-verify/forgot-password-verify.component';
// tslint:disable-next-line:max-line-length
import { ForgotPasswordEmailSentComponent } from './components/forgot-password/forgot-password-email-sent/forgot-password-email-sent.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ControlErrorComponent } from './components/control-error/control-error.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { SpinnerComponent } from './elements/spinner/spinner.component';
import { EditProductComponent } from './components/administration/product/edit-product/edit-product.component';
import { LandingComponent } from './components/landing/landing.component';
import { ShopComponent } from './components/shop/shop.component';
import { CategoryComponent } from './components/category/category.component';
import { ProductInventoryComponent } from './components/administration/product/product-inventory/product-inventory.component';
import { FeaturesComponent } from './components/features/features.component';
import { ShopProductsComponent } from './components/shop-products/shop-products.component';
import { SlickCarouselComponent } from './components/slick-carousel/slick-carousel.component';
import { FooterComponent } from './components/footer/footer.component';
import { ShopProductGuard } from './guards/shop-product.guard';
import { ThumbImageFeatureComponent } from './components/thumb-image-feature/thumb-image-feature.component';
import { ProductsComponent } from './components/products/products.component';
import { SlickProductImageComponent } from './components/slick-product-image/slick-product-image.component';
import { CustomBreadcrumbComponent } from './components/custom-breadcrumb/custom-breadcrumb.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { ClientPageComponent } from './components/client-page/client-page.component';
import { ScrollTopComponent } from './components/scroll-top/scroll-top.component';
import { BlogPageComponent } from './components/blog-page/blog-page.component';
import { BlogMostPopularComponent } from './components/blog-most-popular/blog-most-popular.component';
import { BlogComponent } from './components/administration/blog/blog.component';
import { AddBlogComponent } from './components/administration/blog/add-blog/add-blog.component';
import { BlogContentComponent } from './components/administration/blog/blog-content/blog-content.component';
import { EditBlogComponent } from './components/administration/blog/edit-blog/edit-blog.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { CustomToastrComponent } from './components/custom-toastr/custom-toastr.component';
import { BlogTrendingComponent } from './components/blog-trending/blog-trending.component';
import { BlogContentPageComponent } from './components/blog-content-page/blog-content-page.component';
import { BlogContentPageGuard } from './guards/blog-content-page.guard';
import { ProfileDashboardModule } from './modules/profile-dashboard/profile-dashboard.module';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { AdminLandingComponent } from './components/administration/admin-landing/admin-landing.component';
import { AddAdminLandingComponent } from './components/administration/admin-landing/add-admin-landing/add-admin-landing.component';
import { EditAdminLandingComponent } from './components/administration/admin-landing/edit-admin-landing/edit-admin-landing.component';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ThreadComponent } from './components/thread/thread.component';
import { CommentService } from './services/comment.service';
import { CartComponent } from './components/cart/cart.component';
import { ProductFeatureComponent } from './components/product-feature/product-feature.component';
import { AdminCategoryComponent } from './components/administration/admin-category/admin-category.component';
import { CategorySummaryComponent } from './components/administration/admin-category/category-summary/category-summary.component';
// tslint:disable-next-line:max-line-length
import { CategoryHierarchyComponent } from './components/administration/admin-category/category-summary/category-hierarchy/category-hierarchy.component';
import { AddCategoryComponent } from './components/administration/admin-category/category-summary/add-category/add-category.component';
// tslint:disable-next-line:max-line-length
import { AddCategoryChildrenComponent } from './components/administration/admin-category/category-summary/add-category-children/add-category-children.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { AdminLayawayComponent } from './components/administration/admin-layaway/admin-layaway.component';
import { AdminShippingComponent } from './components/administration/admin-shipping/admin-shipping.component';
import { AddAdminShippingComponent } from './components/administration/admin-shipping/add-admin-shipping/add-admin-shipping.component';
import { EditAdminShippingComponent } from './components/administration/admin-shipping/edit-admin-shipping/edit-admin-shipping.component';
import { DiscountComponent } from './components/administration/discount/discount.component';
import { AddDiscountComponent } from './components/administration/discount/add-discount/add-discount.component';

import { ShippingPageComponent } from './components/shipping-page/shipping-page.component';
import { EditDiscountComponent } from './components/administration/discount/edit-discount/edit-discount.component';
import { ShippingDetailsComponent } from './components/shipping-page/shipping-details/shipping-details.component';
import { ShippingMethodComponent } from './components/shipping-page/shipping-method/shipping-method.component';
import { PaymentComponent } from './components/shipping-page/payment/payment.component';
import { ShippingMethodGuard } from './guards/shipping-method.guard';
import { PaymentMethodComponent } from './components/administration/payment-method/payment-method.component';
import { SEOService } from './services/SEO.service';

import { AddPaymentMethodComponent } from './components/administration/payment-method/add-payment-method/add-payment-method.component';
import { AccountInfoComponent } from './components/administration/payment-method/account-info/account-info.component';
import { EditPaymentMethodComponent } from './components/administration/payment-method/edit-payment-method/edit-payment-method.component';
import { ProfileOrderComponent } from './components/profile/profile-order/profile-order.component';
import { OrdersComponent } from './components/administration/orders/orders.component';
import { OrderService } from './services/order.service';
import { CompleteOrderComponent } from './components/complete-order/complete-order.component';
import { SearchFilterComponent } from './components/search-filter/search-filter.component';
import { OrderDetailsComponent } from './components/administration/orders/order-details/order-details.component';
import { FacebooklikeComponent } from './components/facebooklike/facebooklike.component';
import { ClientOrderComponent } from './components/client-order/client-order.component';
import { AdminLoyaltyDiscountComponent } from './components/administration/admin-loyalty-discount/admin-loyalty-discount.component';
// tslint:disable-next-line:max-line-length
import { AddLoyaltyDiscountComponent } from './components/administration/admin-loyalty-discount/add-loyalty-discount/add-loyalty-discount.component';
import { DomService } from './services/dom-service';
import { FacebookScraperService } from './services/facebookScraper.service';
import { WindowRefService } from './services/windowsRef.service';
// tslint:disable-next-line:max-line-length
import { EditLoyaltyDiscountComponent } from './components/administration/admin-loyalty-discount/edit-loyalty-discount/edit-loyalty-discount.component';
import { LoyaltyService } from './services/loyalty.service';
import { ClientOrderInfoComponent } from './components/client-order/client-order-info/client-order-info.component';
import { UserAdminManagementComponent } from './components/administration/user-admin-management/user-admin-management.component';
// tslint:disable-next-line:max-line-length
import { AddUserAdminManagementComponent } from './components/administration/user-admin-management/add-user-admin-management/add-user-admin-management.component';
// tslint:disable-next-line:max-line-length
import { EditUserAdminManagementComponent } from './components/administration/user-admin-management/edit-user-admin-management/edit-user-admin-management.component';
import { PaymentGatewayComponent } from './components/payment-gateway/payment-gateway.component';
import { PaymentDetailsGuard } from './guards/payment-details.guard';
import { PaymongoService } from './services/paymongo.service';
import { PaypalComponent } from './components/payment-gateway/paypal/paypal.component';
import { BraintreeService } from './services/braintree.service';
import { CurrenyService } from './services/currency.service';
import { CreditCardComponent } from './components/payment-gateway/credit-card/credit-card.component';
import { OtherPaymentMethodsComponent } from './components/payment-gateway/other-payment-methods/other-payment-methods.component';
import { LoginGuestComponent } from './components/login-guest/login-guest.component';
import { ClientOrderInfoViewComponent } from './components/client-order/client-order-info-view/client-order-info-view.component';
import { LoyaltyDiscountComponent } from './components/loyalty-discount/loyalty-discount.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { LayawayPaymentComponent } from './components/payment-gateway/layaway-payment/layaway-payment.component';
import { CompletePaymentComponent } from './components/complete-payment/complete-payment.component';
import { NumericFormatterDirective } from './directives/numeric-fomatter';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PreOrderPaymentComponent } from './components/payment-gateway/pre-order-payment/pre-order-payment.component';
import { PreOrderPaymentGuard } from './guards/pre-order-payment.guard';
import { PrintService } from './services/print.service';
import { FeaturesRelatedComponent } from './components/features-related/features-related.component';
import { OrderStatusReportComponent } from './components/administration/reports/order-status-report/order-status-report.component';
import { ReportFilterComponent } from './components/report-filter/report-filter.component';
import { ReportService } from './services/report.service';
import { SalesReportComponent } from './components/administration/reports/sales-report/sales-report.component';
import { ShippedOrderReportComponent } from './components/administration/reports/shipped-order-report/shipped-order-report.component';
import { OrderDiscountReportComponent } from './components/administration/reports/order-discount-report/order-discount-report.component';
import { OrderLayawayReportComponent } from './components/administration/reports/order-layaway-report/order-layaway-report.component';
import { OrderPreorderReportComponent } from './components/administration/reports/order-preorder-report/order-preorder-report.component';
import { ProductPriceReportComponent } from './components/administration/reports/product-price-report/product-price-report.component';
// tslint:disable-next-line:max-line-length
import { InStockProductsReportComponent } from './components/administration/reports/in-stock-products-report/in-stock-products-report.component';
import { ProductSaleReportComponent } from './components/administration/reports/product-sale-report/product-sale-report.component';
import { ProductTagsReportComponent } from './components/administration/reports/product-tags-report/product-tags-report.component';
import { ReportProductFilterComponent } from './components/report-product-filter/report-product-filter.component';
import { HomeFeatureComponent } from './components/administration/admin-category/category-summary/home-feature/home-feature.component';
import { OtherBreadcrumbComponent } from './components/other-breadcrumb/other-breadcrumb.component';
import { FullPaymentComponent } from './components/payment-gateway/full-payment/full-payment.component';
// tslint:disable-next-line:max-line-length
import { LoyaltyDiscountTrackerReportComponent } from './components/administration/reports/loyalty-discount-tracker-report/loyalty-discount-tracker-report.component';
import { PaymentTermsComponent } from './components/payment-terms/payment-terms.component';
import { ShippingPolicyComponent } from './components/shipping-policy/shipping-policy.component';
import { LoyaltyProgramPromotionsComponent } from './components/loyalty-program-promotions/loyalty-program-promotions.component';
import { TransactionFeeComponent } from './components/administration/payment-method/transaction-fee/transaction-fee.component';
import { BlogPopularPostComponent } from './components/blog-popular-post/blog-popular-post.component';
import { UserWishlistComponent } from './components/user-wishlist/user-wishlist.component';
import { ProductNotificationComponent } from './components/administration/product/product-notification/product-notification.component';
import { CustomerListReportComponent } from './components/administration/reports/customer-list-report/customer-list-report.component';
import { CurrencyConversionPipe } from './pipes/currency-conversion.pipe';
import { SubscriptionEmailsComponent } from './components/administration/reports/subscription-emails/subscription-emails.component';
import { UnsubscriptionEmailComponent } from './components/unsubscription-email/unsubscription-email.component';
import { DashboardComponent } from './components/administration/dashboard/dashboard.component';
import { DashboardService } from './services/dashboard.service';
import { GcashComponent } from './components/payment-gateway/gcash/gcash.component';
import { GcashSuccessComponent } from './components/gcash-success/gcash-success.component';
import { GcashFailedComponent } from './components/gcash-failed/gcash-failed.component';
import { GcashWebhooksComponent } from './components/gcash-webhooks/gcash-webhooks.component';
import { GCashSuccessGuard } from './guards/gcash-success.guard';
import { GrabPayComponent } from './components/payment-gateway/grab-pay/grab-pay.component';
import { SubscribeEmailComponent } from './components/subscribe-email/subscribe-email.component';
import { CustomerOrderReviewComponent } from './components/customer-order-review/customer-order-review.component';
import { CreditCardPaymongoComponent } from './components/payment-gateway/credit-card-paymongo/credit-card-paymongo';
import { CreditCardUtilityComponent } from './components/credit-card-utility/credit-card-utility.component';
import { CreditCardSuccessComponent } from './components/credit-card-success/credit-card-success.component';
import { OnlineBankingPaymongoComponent } from './components/payment-gateway/online-banking-paymongo/online-banking-paymongo';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/BASEHREF/assests/i18n', '.json');
}

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(environment.googleLoginProvider)
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider(environment.facebookLoginProvider)
  },
  // {
  //   id: LinkedInLoginProvider.PROVIDER_ID,
  //   provider: new LinkedInLoginProvider("78iqy5cu2e1fgr")
  // }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    HomeComponent,
    ProfileComponent,
    SignupComponent,
    // SpinnerComponent,
    AdministrationComponent,
    ProductComponent,
    AddProductComponent,
    ProductComponent,
    ForgotPasswordComponent,
    ForgotPasswordVerifyComponent,
    ForgotPasswordEmailSentComponent,
    EditProductComponent,
    SanitizeHtmlPipe,
    // ControlErrorsDirective,
    // FormSubmitDirective,
    // ControlErrorComponent,
    // ControlErrorContainerDirective,
    BreadcrumbComponent,
    LandingComponent,
    OrdersComponent,
    ShopComponent,
    CategoryComponent,
    ProductInventoryComponent,
    ShopProductsComponent,
    FeaturesComponent,
    SlickCarouselComponent,
    FooterComponent,
    ThumbImageFeatureComponent,
    ProductsComponent,
    SlickProductImageComponent,
    CustomBreadcrumbComponent,
    ProductFilterComponent,
    ClientPageComponent,
    ScrollTopComponent,
    BlogPageComponent,
    BlogContentComponent,
    BlogMostPopularComponent,
    BlogComponent,
    AddBlogComponent,
    BlogContentComponent,
    EditBlogComponent,
    ConfirmationDialogComponent,
    BlogTrendingComponent,
    BlogContentPageComponent,
    CustomToastrComponent,
    UnderConstructionComponent,
    AdminLandingComponent,
    AddAdminLandingComponent,
    EditAdminLandingComponent,
    ThreadComponent,
    CartComponent,
    ProductFeatureComponent,
    AdminCategoryComponent,
    CategorySummaryComponent,
    CategoryHierarchyComponent,
    AddCategoryComponent,
    AddCategoryChildrenComponent,
    AboutUsComponent,
    TermsAndConditionsComponent,
    PrivacyPolicyComponent,
    AdminLayawayComponent,
    AdminShippingComponent,
    AddAdminShippingComponent,
    EditAdminShippingComponent,
    ShippingPageComponent,
    DiscountComponent,
    AddDiscountComponent,
    EditDiscountComponent,
    ShippingDetailsComponent,
    ShippingMethodComponent,
    PaymentComponent,
    SafePipe,
    PaymentMethodComponent,
    AddPaymentMethodComponent,
    AccountInfoComponent,
    EditPaymentMethodComponent,
    ProfileOrderComponent,
    CompleteOrderComponent,
    SearchFilterComponent,
    OrderDetailsComponent,
    FacebooklikeComponent,
    ClientOrderComponent,
    AdminLoyaltyDiscountComponent,
    AddLoyaltyDiscountComponent,
    EditLoyaltyDiscountComponent,
    ClientOrderInfoComponent,
    UserAdminManagementComponent,
    AddUserAdminManagementComponent,
    EditUserAdminManagementComponent,
    PaymentGatewayComponent,
    PaypalComponent,
    CreditCardComponent,
    CreditCardPaymongoComponent,
    OtherPaymentMethodsComponent,
    LoginGuestComponent,
    ClientOrderInfoViewComponent,
    LoyaltyDiscountComponent,
    LayawayPaymentComponent,
    CompletePaymentComponent,
    NumericFormatterDirective,
    NotFoundComponent,
    PreOrderPaymentComponent,
    FeaturesRelatedComponent,
    OrderStatusReportComponent,
    ReportFilterComponent,
    SalesReportComponent,
    ShippedOrderReportComponent,
    OrderDiscountReportComponent,
    OrderLayawayReportComponent,
    OrderPreorderReportComponent,
    ProductPriceReportComponent,
    InStockProductsReportComponent,
    ProductSaleReportComponent,
    ProductTagsReportComponent,
    ReportProductFilterComponent,
    HomeFeatureComponent,
    OtherBreadcrumbComponent,
    FullPaymentComponent,
    LoyaltyDiscountTrackerReportComponent,
    PaymentTermsComponent,
    ShippingPolicyComponent,
    LoyaltyProgramPromotionsComponent,
    TransactionFeeComponent,
    BlogPopularPostComponent,
    UserWishlistComponent,
    ProductNotificationComponent,
    CustomerListReportComponent,
    CurrencyConversionPipe,
    SubscriptionEmailsComponent,
    UnsubscriptionEmailComponent,
    DashboardComponent,
    GcashComponent,
    GcashSuccessComponent,
    GcashFailedComponent,
    GcashWebhooksComponent,
    GrabPayComponent,
    SubscribeEmailComponent,
    CustomerOrderReviewComponent,
    CreditCardUtilityComponent,
    CreditCardSuccessComponent,
    OnlineBankingPaymongoComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SlickCarouselModule,
    BreadcrumbModule,
    // NgxPayPalModule,
    QuillModule.forRoot(),
    MatButtonModule,
    MatButtonToggleModule,
    MatMenuModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgbModule,
    BrowserAnimationsModule,
    SlickCarouselModule,
    ScrollDispatchModule,
    DragDropModule,
    ToastrModule.forRoot({
      toastComponent: CustomToastrComponent
    }),
    ScrollingModule,
    NgxPaginationModule,
    ProfileDashboardModule,
    SocialLoginModule,
    NgxSpinnerModule,
    ShareButtonModule.withConfig({
      debug: true
    }),
    Ng2TelInputModule,
    NgPaymentCardModule,
    NgxSandCreditCardsModule
    // NgxPayPalModule
  ],
  providers: [
    ValidatorService,
    AdminGuard,
    ProductService,
    OrderService,
    DomService,
    PaymongoService,
    FacebookScraperService,
    BraintreeService,
    WindowRefService,
    CurrenyService,
    BraintreeService,
    PrintService,
    ForgotPasswordGuard,
    LoyaltyService,
    ProductInventoryGuard,
    ShopProductGuard,
    BlogContentPageGuard,
    ProductGuard,
    ShippingMethodGuard,
    PaymentDetailsGuard,
    SEOService,
    PreOrderPaymentGuard,
    ReportService,
    NgxSpinnerService,
    DashboardService,
    GCashSuccessGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true
    },
    // {
    //   provide: NgbDateAdapter,
    //   useClass: DateFormatterService
    // }
    {
      provide: NgbDateAdapter,
      useClass: NgbdateNativeCustomAdapterService
    },
    {
      provide: NgbDateParserFormatter,
      useClass: NgbDateCustomParserFormatter
    },
    DatePipe,

    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    CommentService,
    {
      provide: UrlSerializer,
      useClass: UrlLowerCaseSerializer
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ControlErrorComponent, CustomToastrComponent, ConfirmationDialogComponent]
})
export class AppModule { }
