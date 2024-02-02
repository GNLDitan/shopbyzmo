import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/profile/signup/signup.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { ProductComponent } from './components/administration/product/product.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ForgotPasswordVerifyComponent } from './components/forgot-password/forgot-password-verify/forgot-password-verify.component';
import { ForgotPasswordEmailSentComponent } from './components/forgot-password/forgot-password-email-sent/forgot-password-email-sent.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProductInventoryComponent } from './components/administration/product/product-inventory/product-inventory.component';
import { EditProductComponent } from './components/administration/product/edit-product/edit-product.component';
import { AddProductComponent } from './components/administration/product/add-product/add-product.component';
import { FeaturesComponent } from './components/features/features.component';
import { ShopProductsComponent } from './components/shop-products/shop-products.component';
import { ShopProductGuard } from './guards/shop-product.guard';
import { ProductsComponent } from './components/products/products.component';
import { ClientPageComponent } from './components/client-page/client-page.component';
import { BlogComponent } from './components/administration/blog/blog.component';
import { AddBlogComponent } from './components/administration/blog/add-blog/add-blog.component';
import { EditBlogComponent } from './components/administration/blog/edit-blog/edit-blog.component';
import { BlogPageComponent } from './components/blog-page/blog-page.component';
import { BlogContentPageComponent } from './components/blog-content-page/blog-content-page.component';
import { UnderConstructionComponent } from './components/under-construction/under-construction.component';
import { AdminLandingComponent } from './components/administration/admin-landing/admin-landing.component';
import { AddAdminLandingComponent } from './components/administration/admin-landing/add-admin-landing/add-admin-landing.component';
import { EditAdminLandingComponent } from './components/administration/admin-landing/edit-admin-landing/edit-admin-landing.component';
import { ProductFeatureComponent } from './components/product-feature/product-feature.component';
import { AdminLayawayComponent } from './components/administration/admin-layaway/admin-layaway.component';
import { AdminCategoryComponent } from './components/administration/admin-category/admin-category.component';
import { CategorySummaryComponent } from './components/administration/admin-category/category-summary/category-summary.component';
import { CategoryHierarchyComponent } from './components/administration/admin-category/category-summary/category-hierarchy/category-hierarchy.component';
import { AddCategoryComponent } from './components/administration/admin-category/category-summary/add-category/add-category.component';
import { AddCategoryChildrenComponent } from './components/administration/admin-category/category-summary/add-category-children/add-category-children.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { TermsAndConditionsComponent } from './components/terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { AdminShippingComponent } from './components/administration/admin-shipping/admin-shipping.component';
import { CartComponent } from './components/cart/cart.component';
import { AddAdminShippingComponent } from './components/administration/admin-shipping/add-admin-shipping/add-admin-shipping.component';
import { EditAdminShippingComponent } from './components/administration/admin-shipping/edit-admin-shipping/edit-admin-shipping.component';
import { DiscountComponent } from './components/administration/discount/discount.component';
import { AddDiscountComponent } from './components/administration/discount/add-discount/add-discount.component';
import { EditDiscountComponent } from './components/administration/discount/edit-discount/edit-discount.component';
import { ShippingDetailsComponent } from './components/shipping-page/shipping-details/shipping-details.component';
import { ShippingMethodComponent } from './components/shipping-page/shipping-method/shipping-method.component';
import { PaymentComponent } from './components/shipping-page/payment/payment.component';
import { PaymentMethodComponent } from './components/administration/payment-method/payment-method.component';
import { AddPaymentMethodComponent } from './components/administration/payment-method/add-payment-method/add-payment-method.component';
import { EditPaymentMethodComponent } from './components/administration/payment-method/edit-payment-method/edit-payment-method.component';
import { OrdersComponent } from './components/administration/orders/orders.component';
import { CompleteOrderComponent } from './components/complete-order/complete-order.component';
import { OrderDetailsComponent } from './components/administration/orders/order-details/order-details.component';
import { AdminLoyaltyDiscountComponent } from './components/administration/admin-loyalty-discount/admin-loyalty-discount.component';
import { EditLoyaltyDiscountComponent } from './components/administration/admin-loyalty-discount/edit-loyalty-discount/edit-loyalty-discount.component';
import { AddLoyaltyDiscountComponent } from './components/administration/admin-loyalty-discount/add-loyalty-discount/add-loyalty-discount.component';
import { ClientOrderComponent } from './components/client-order/client-order.component';
// Guards for securing routing
import { AdminGuard } from './guards/admin.guard';
import { ForgotPasswordGuard } from './guards/forgot-password.guard';
import { ProductGuard } from './guards/product.guard';
import { ProductInventoryGuard } from './guards/product-inventory.guard';
import { BlogGuard } from './guards/blog.guard';
import { BlogContentPageGuard } from './guards/blog-content-page.guard';
import { LandingGuard } from './guards/landing.guard';
import { ShippingPageComponent } from './components/shipping-page/shipping-page.component';
import { ShippingGuard } from './guards/shipping.guard';
import { DiscountGuard } from './guards/discount.guard';
import { PaymentGuard } from './guards/payment.guard';
import { OrderGuard } from './guards/order.guard';
import { LoyaltyDiscount } from './classes/loyalty-discount';
import { UserAdminManagementComponent } from './components/administration/user-admin-management/user-admin-management.component';
import { EditUserAdminManagementComponent } from './components/administration/user-admin-management/edit-user-admin-management/edit-user-admin-management.component';
import { AddUserAdminManagementComponent } from './components/administration/user-admin-management/add-user-admin-management/add-user-admin-management.component';
import { PaymentGatewayComponent } from './components/payment-gateway/payment-gateway.component';
import { ClientOrderInfoComponent } from './components/client-order/client-order-info/client-order-info.component';
import { PaymentDetailsGuard } from './guards/payment-details.guard';
import { PaypalComponent } from './components/payment-gateway/paypal/paypal.component';
import { CreditCardComponent } from './components/payment-gateway/credit-card/credit-card.component';
import { OtherPaymentMethodsComponent } from './components/payment-gateway/other-payment-methods/other-payment-methods.component';
import { LoginGuestComponent } from './components/login-guest/login-guest.component';
import { ClientOrderInfoViewComponent } from './components/client-order/client-order-info-view/client-order-info-view.component';
import { LoyaltyDiscountComponent } from './components/loyalty-discount/loyalty-discount.component';
import { LayawayPaymentComponent } from './components/payment-gateway/layaway-payment/layaway-payment.component';
import { LayawayPaymentGuard } from './guards/layaway-payment.guard';
import { CompletePaymentComponent } from './components/complete-payment/complete-payment.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PreOrderPaymentComponent } from './components/payment-gateway/pre-order-payment/pre-order-payment.component';
import { PreOrderPaymentGuard } from './guards/pre-order-payment.guard';
import { OrderStatusReportComponent } from './components/administration/reports/order-status-report/order-status-report.component';
import { SalesReportComponent } from './components/administration/reports/sales-report/sales-report.component';
import { ShippedOrderReportComponent } from './components/administration/reports/shipped-order-report/shipped-order-report.component';
import { OrderDiscountReportComponent } from './components/administration/reports/order-discount-report/order-discount-report.component';
import { OrderLayawayReportComponent } from './components/administration/reports/order-layaway-report/order-layaway-report.component';
import { OrderPreorderReportComponent } from './components/administration/reports/order-preorder-report/order-preorder-report.component';
import { ProductPriceReportComponent } from './components/administration/reports/product-price-report/product-price-report.component';
import { InStockProductsReportComponent } from './components/administration/reports/in-stock-products-report/in-stock-products-report.component';
import { ProductSaleReportComponent } from './components/administration/reports/product-sale-report/product-sale-report.component';
import { ProductTagsReportComponent } from './components/administration/reports/product-tags-report/product-tags-report.component';
import { HomeFeatureComponent } from './components/administration/admin-category/category-summary/home-feature/home-feature.component';
import { FullPaymentComponent } from './components/payment-gateway/full-payment/full-payment.component';
import { FullPaymentGuard } from './guards/full-payment.guard';
import { LoyaltyDiscountTrackerReportComponent } from './components/administration/reports/loyalty-discount-tracker-report/loyalty-discount-tracker-report.component';
import { PaymentTermsComponent } from './components/payment-terms/payment-terms.component';
import { ShippingPolicyComponent } from './components/shipping-policy/shipping-policy.component';
import { LoyaltyProgramPromotionsComponent } from './components/loyalty-program-promotions/loyalty-program-promotions.component';
import { UserWishlistComponent } from './components/user-wishlist/user-wishlist.component';
import { ProductNotificationComponent } from './components/administration/product/product-notification/product-notification.component';
import { CustomerListReportComponent } from './components/administration/reports/customer-list-report/customer-list-report.component';
import { ProductsGuard } from './guards/products.guard';
import { SubscriptionEmailsComponent } from './components/administration/reports/subscription-emails/subscription-emails.component';
import { UnsubscriptionEmailComponent } from './components/unsubscription-email/unsubscription-email.component';
import { DashboardComponent } from './components/administration/dashboard/dashboard.component';
import { GcashComponent } from './components/payment-gateway/gcash/gcash.component';
import { GcashFailedComponent } from './components/gcash-failed/gcash-failed.component';
import { GcashWebhooksComponent } from './components/gcash-webhooks/gcash-webhooks.component';
import { GcashSuccessComponent } from './components/gcash-success/gcash-success.component';
import { GCashSuccessGuard } from './guards/gcash-success.guard';
import { GrabPayComponent } from './components/payment-gateway/grab-pay/grab-pay.component';
import { SubscribeEmailComponent } from './components/subscribe-email/subscribe-email.component';
import { CustomerOrderReviewComponent } from './components/customer-order-review/customer-order-review.component';
import { CreditCardPaymongoComponent } from './components/payment-gateway/credit-card-paymongo/credit-card-paymongo';
import { CreditCardSuccessComponent } from './components/credit-card-success/credit-card-success.component';
import { OnlineBankingPaymongoComponent } from './components/payment-gateway/online-banking-paymongo/online-banking-paymongo';

const appRoutes: Routes = [
  {
    path: '', component: ClientPageComponent, children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'products', component: ProductsComponent, canActivate: [ProductsGuard] },
      { path: 'products/:id', component: ShopProductsComponent, canActivate: [ShopProductGuard] },
      // { path: 'products/:id', component: ProductFeatureComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'features', component: FeaturesComponent },
      { path: 'blog', component: BlogPageComponent },
      {
        path: 'blog/content/:id/:title', component: BlogContentPageComponent, canActivate: [BlogContentPageGuard]
      },
      {
        path: 'profile', data: { breadcrumb: 'Profile' }, component: ProfileComponent, children: [
          { path: '', redirectTo: 'profile-dashboard', pathMatch: 'full' },
          {
            path: 'profile-dashboard',
            loadChildren: () => import('./modules/profile-dashboard/profile-dashboard.module').then(mod => mod.ProfileDashboardModule),
          }
        ]
      },
      {
        path: 'shipping', component: ShippingPageComponent, children: [
          { path: '', redirectTo: 'information', pathMatch: 'full' },
          {
            path: 'information',
            data: {
              breadcrumb: 'Shipping Details'
            },
            children: [
              {
                path: '',
                data: {
                  breadcrumb: null
                },
                component: ShippingDetailsComponent,
              },
              {
                path: 'shipping-method',
                data: {
                  breadcrumb: 'Shipping Method'
                },
                // canActivate: [ShippingMethodGuard],
                children: [
                  {
                    path: '',
                    data: {
                      breadcrumb: null
                    },
                    component: ShippingMethodComponent,
                  },
                  {
                    path: 'payment',
                    data: {
                      breadcrumb: 'Payment'
                    },
                    children: [
                      {
                        path: '',
                        data: {
                          breadcrumb: null
                        },
                        component: PaymentComponent,
                      },
                    ]
                  }
                ]
              },
            ]

          }
        ]
      },
      { path: 'order/compete/:id', component: CompleteOrderComponent },
      { path: 'order/payment-complete/:id', component: CompletePaymentComponent },
      { path: 'order/payment-failed', component: GcashFailedComponent },
      { path: 'order/payment-success', component: CreditCardSuccessComponent, canActivate: [GCashSuccessGuard] },
      { path: 'order/creditcard/payment-success', component: GcashSuccessComponent, canActivate: [GCashSuccessGuard] },
      
      { path: 'webhooks', component: GcashWebhooksComponent },
      {
        path: 'order/payment-gateway/:id', component: PaymentGatewayComponent, canActivate: [PaymentDetailsGuard], children: [
          { path: 'paypal', component: PaypalComponent },
          { path: 'credit-card', component: CreditCardComponent },
          { path: 'credit-card-v2', component: CreditCardPaymongoComponent },
          { path: 'change-payment-method', component: OtherPaymentMethodsComponent },
          { path: 'gcash', component: GcashComponent },
          { path: 'grabpay', component: GrabPayComponent },
          { path: 'online-banking', component: OnlineBankingPaymongoComponent }
        ]
      },
      {
        path: 'order/payment-gateway/:paymenttype/:securityid/:productid/:producttype', component: FullPaymentComponent, canActivate: [FullPaymentGuard], children: [
          { path: 'paypal', component: PaypalComponent },
          { path: 'credit-card', component: CreditCardComponent },
          { path: 'credit-card-v2', component: CreditCardPaymongoComponent },
          { path: 'change-payment-method', component: OtherPaymentMethodsComponent },
          { path: 'gcash', component: GcashComponent },
          { path: 'grabpay', component: GrabPayComponent },
          { path: 'online-banking', component: OnlineBankingPaymongoComponent }
        ]
      },
      {
        path: 'order/payment-gateway/layaway/:id', component: LayawayPaymentComponent, canActivate: [LayawayPaymentGuard], children: [
          { path: 'paypal', component: PaypalComponent },
          { path: 'credit-card', component: CreditCardComponent },
          { path: 'credit-card-v2', component: CreditCardPaymongoComponent },
          { path: 'change-payment-method', component: OtherPaymentMethodsComponent },
          { path: 'gcash', component: GcashComponent },
          { path: 'grabpay', component: GrabPayComponent },
          { path: 'online-banking', component: OnlineBankingPaymongoComponent }
        ]
      },
      {
        path: 'order/payment-gateway/pre-order/:id', component: PreOrderPaymentComponent, canActivate: [PreOrderPaymentGuard], children: [
          { path: 'paypal', component: PaypalComponent },
          { path: 'credit-card', component: CreditCardComponent },
          { path: 'credit-card-v2', component: CreditCardPaymongoComponent },
          { path: 'change-payment-method', component: OtherPaymentMethodsComponent },
          { path: 'gcash', component: GcashComponent },
          { path: 'grabpay', component: GrabPayComponent },
          { path: 'online-banking', component: OnlineBankingPaymongoComponent }
        ]
      },
      { path: 'forgot', component: ForgotPasswordComponent, canActivate: [ForgotPasswordGuard] },
      { path: 'forgot/verify', component: ForgotPasswordVerifyComponent, canActivate: [ForgotPasswordGuard] },
      { path: 'forgot/email-sent', component: ForgotPasswordEmailSentComponent, canActivate: [ForgotPasswordGuard] },
      { path: 'under-construction', component: UnderConstructionComponent },
      { path: 'cart', component: CartComponent },
      { path: 'client-order', component: ClientOrderComponent },
      { path: 'client-order/reviews/:orderid', component: CustomerOrderReviewComponent },
      { path: 'client-order/client-order-info/:id', component: ClientOrderInfoComponent },
      { path: 'payment/auth/login-guest/:id', component: LoginGuestComponent },
      { path: 'loyalty-discount', component: LoyaltyDiscountComponent },
      { path: 'wishlist', component: UserWishlistComponent },
      { path: 'about-us', component: AboutUsComponent },
      { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 'payment-terms', component: PaymentTermsComponent },
      { path: 'shipping-policy', component: ShippingPolicyComponent },
      { path: 'loyalty-program-promotions', component: LoyaltyProgramPromotionsComponent },
      { path: 'unsubscribe-user', component: UnsubscriptionEmailComponent },
      { path: 'subscribe-user', component: SubscribeEmailComponent }

    ]
  },
  { path: 'client-order-info-view/:id', component: ClientOrderInfoViewComponent },
  {
    path: 'administration', component: AdministrationComponent, canActivate: [AdminGuard], children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'product', component: ProductComponent },
      { path: 'product/add', component: AddProductComponent },
      { path: 'product/:id', component: EditProductComponent, canActivate: [ProductGuard] },
      { path: 'product/inventory/:id', component: ProductInventoryComponent, canActivate: [ProductInventoryGuard] },
      { path: 'product/notification/:id', component: ProductNotificationComponent, canActivate: [ProductGuard] },
      { path: 'blog', component: BlogComponent },
      { path: 'blog/add', component: AddBlogComponent },
      { path: 'blog/:id', component: EditBlogComponent, canActivate: [BlogGuard] },
      { path: 'admin-landing', component: AdminLandingComponent },
      { path: 'admin-landing/add', component: AddAdminLandingComponent },
      { path: 'admin-landing/:id', component: EditAdminLandingComponent, canActivate: [LandingGuard] },
      {
        path: 'category-maintenance', component: AdminCategoryComponent, children: [
          {
            path: ':id', component: CategorySummaryComponent, children: [
              { path: 'hierarchy', component: CategoryHierarchyComponent },
              { path: 'add-category', component: AddCategoryComponent },
              { path: 'add-category-children', component: AddCategoryChildrenComponent },
              { path: 'home-feature', component: HomeFeatureComponent }
            ]
          }
        ]
      },
      { path: 'layaway', component: AdminLayawayComponent },
      { path: 'admin-shipping', component: AdminShippingComponent },
      { path: 'admin-shipping/add', component: AddAdminShippingComponent },
      { path: 'admin-shipping/:id', component: EditAdminShippingComponent, canActivate: [ShippingGuard] },
      { path: 'discount', component: DiscountComponent },
      { path: 'discount/add', component: AddDiscountComponent },
      { path: 'discount/:id', component: EditDiscountComponent, canActivate: [DiscountGuard] },
      { path: 'payment-method', component: PaymentMethodComponent },
      { path: 'payment-method/add', component: AddPaymentMethodComponent },
      { path: 'payment-method/:id', component: EditPaymentMethodComponent, canActivate: [PaymentGuard] },
      { path: 'orders', component: OrdersComponent },
      { path: 'orders/:id', component: OrderDetailsComponent, canActivate: [OrderGuard] },
      { path: 'loyalty-discount', component: AdminLoyaltyDiscountComponent },
      { path: 'loyalty-discount/add', component: AddLoyaltyDiscountComponent },
      { path: 'loyalty-discount/:id', component: EditLoyaltyDiscountComponent },
      { path: 'user-admin', component: UserAdminManagementComponent },
      { path: 'user-admin/add', component: AddUserAdminManagementComponent },
      { path: 'user-admin/:id', component: EditUserAdminManagementComponent },
      { path: 'order-status-report', component: OrderStatusReportComponent },
      { path: 'sales-report', component: SalesReportComponent },
      { path: 'shipped-order-report', component: ShippedOrderReportComponent },
      { path: 'order-discount-report', component: OrderDiscountReportComponent },
      { path: 'order-layaway-payment', component: OrderLayawayReportComponent },
      { path: 'order-preorder-report', component: OrderPreorderReportComponent },
      { path: 'loyalty-discount-tracker-report', component: LoyaltyDiscountTrackerReportComponent },

      { path: 'product-price-report', component: ProductPriceReportComponent },
      { path: 'in-stock-products-report', component: InStockProductsReportComponent },
      { path: 'product-sale-report', component: ProductSaleReportComponent },
      { path: 'product-tags-report', component: ProductTagsReportComponent },
      { path: 'customer-list-report', component: CustomerListReportComponent },
      { path: 'subscription-emails-report', component: SubscriptionEmailsComponent }

    ]
  },
  { path: 'notfound', component: NotFoundComponent },
  { path: '**', redirectTo: 'notfound' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
