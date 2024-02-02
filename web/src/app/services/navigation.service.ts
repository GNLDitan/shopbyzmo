import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../classes/product';
import { Blog } from '../classes/blog';
import { Order } from '../classes/order';
import { Utils } from '../app.utils';
import { LayAwaySchedule } from '../classes/layaway-schedule';
import { FilterSetting } from '../classes/filter-settings';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router: Router) { }

  // Methods for routing navigation
  toHome() {
    this.router.navigate(['home']).then(() => window.location.reload());
  }

  forgotEmail() {
    this.router.navigate(['/forgot/email-sent']);
  }

  toAdminProduct() {
    this.router.navigate(['administration/product']);
  }

  toProducts() {
    this.router.navigate(['products']);
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  toProductsFilter(filter: FilterSetting) {
    // tslint:disable-next-line: prefer-const
    // tslint:disable-next-line: no-var-keyword
    // tslint:disable-next-line: prefer-const
    let params = {};
    // tslint:disable-next-line: curly
    if (filter.category.length > 0)
      // tslint:disable-next-line: no-string-literal
      params['category'] = Utils.stringReplace(filter.category.join(':'), '-');
    // tslint:disable-next-line: curly
    if (filter.tags.length > 0)
      // tslint:disable-next-line: no-string-literal
      params['tags'] = Utils.stringReplace(filter.tags.join(':'), '-');
    // tslint:disable-next-line: curly
    if (filter.sort !== '')
      // tslint:disable-next-line: no-string-literal
      params['sort'] = Utils.stringReplace(filter.sort, '-');
    // if (filter.tag !== '')
    //   params['tag'] = Utils.stringReplace(filter.tag, '-')

    if (filter.forLanding) {
      // tslint:disable-next-line: no-string-literal
      params['forLanding'] = true;
    }
    if (filter.forProductList) {
      // tslint:disable-next-line: no-string-literal
      params['forProductList'] = true;
    }

    this.router.navigate(['products'], { queryParams: params });
  }

  toProductInformation(product: Product) {
    this.router.navigate([`products/${product.id}`]);
  }

  toProductInformationByLinkName(product: Product) {
    this.router.navigate([`products/${product.linkName}`]);
  }


  toBlogContent(blog: Blog) {
    let title = blog.title.replace(/[^a-zA-Z ]/g, '');
    title = title.replace(/\s+/g, '-');
    this.router.navigate([`blog/content/${blog.id}/${title}`]).then(() => {
      window.location.reload();
    });
  }

  toAdminBlog() {
    this.router.navigate(['administration/blog']);
  }

  toAdminLanding() {
    this.router.navigate(['administration/admin-landing']);
  }

  toProductFeature(feature: string) {
    this.router.navigate([`products/${feature}`]);
  }

  toAdminEditProduct(productId: string) {
    this.router.navigate([`administration/product/${productId}`]);
  }
  toAdminEditProductCategory(catagoryCode: string) {
    this.router.navigate([`administration/category-maintenance/${catagoryCode}`]);
  }
  toAdminCategoryMaintenance() {
    this.router.navigate([`administration/category-maintenance`]).then(() => window.location.reload());
  }
  toAdminLayAway() {
    this.router.navigate([`administration/layaway`]);
  }

  toAdminShipping() {
    this.router.navigate([`administration/admin-shipping`]);
  }
  gotoShipping() {
    this.router.navigate([`shipping/information`]);
  }
  gotoShippingMethod() {
    this.router.navigate([`shipping/information/shipping-method`]);
  }

  toAdminDiscount() {
    this.router.navigate(['administration/discount']);
  }
  toCart() {
    this.router.navigate(['cart']);
  }

  toAdminPaymentMethod() {
    this.router.navigate(['administration/payment-method']);
  }


  toAPaymentMethod() {
    -
      this.router.navigate([`shipping/information/shipping-method/payment`]);
  }


  toOrderComplete(id) {
    this.router.navigate([`order/compete/${id}`]);
  }

  toAdminOrder() {
    this.router.navigate(['administration/orders']);
  }

  toAdminOrderId(orderNumber: number) {
    this.router.navigate([`administration/orders/${orderNumber}`]);
  }

  toAdminLoyaltyDiscount() {
    this.router.navigate(['administration/loyalty-discount']);
  }

  toAdminUserAdminManagement() {
    this.router.navigate(['administration/user-admin']);
  }

  toProductInventory(product: Product) {
    this.router.navigate([`administration/product/inventory/${product.id}`]);
  }
  toProductNotification(product: Product) {
    this.router.navigate([`administration/product/notification/${product.id}`]);
  }
  toClientOrder() {
    this.router.navigate(['client-order']);
  }

  toPaymentPaypal(securityid: string) {
    this.router.navigate([`order/payment-gateway/${securityid}/paypal`]);
  }
  toPaymentCreditCard(securityid: string) {
    this.router.navigate([`order/payment-gateway/${securityid}/credit-card`]);
  }
  toPaymentCreditCardPaymongo(securityid: string) {
    this.router.navigate([`order/payment-gateway/${securityid}/credit-card-v2`]);
  }
  toPaymentGcash(securityid: string) {
    this.router.navigate([`order/payment-gateway/${securityid}/gcash`]);
  }
  toPaymentGrabPay(securityid: string) {
    this.router.navigate([`order/payment-gateway/${securityid}/grabpay`]);
  }
  toPaymentOnlineBankingPaymongo(securityid: string) {
    this.router.navigate([`order/payment-gateway/${securityid}/online-banking`]);
  }

  toOtherPaymentMethod(securityid: string) {
    this.router.navigate([`order/payment-gateway/${securityid}/change-payment-method`]);
  }

  toLoginGuest(id: number) {
    this.router.navigate([`payment/auth/login-guest/${Utils.PAYMENT_TYPE.order}-${id}`]);
  }

  toLayawayTotalGuest(orderid: number, productid: number) {
    this.router.navigate([`payment/auth/login-guest/${Utils.PAYMENT_TYPE.layaway}-${orderid}-${productid}`]);
  }

  toPreorderTotalGuest(orderid: number, productid: number) {
    this.router.navigate([`payment/auth/login-guest/${Utils.PAYMENT_TYPE.preorder}-${orderid}-${productid}`]);
  }

  toLayawayLoginGuest(id: number) {
    this.router.navigate([`payment/auth/login-guest/${Utils.PAYMENT_TYPE.layaway}-${id}`]);
  }

  toClientOrderInfo(order: Order) {
    this.router.navigate([`client-order/client-order-info/${order.securityId}`]);
  }

  toPaymentDetails(id: number, paymentType: string) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${id}`]);
  }
  toPaymentOtherPaypal(id: number, paymentType: string) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${id}/paypal`]);
  }
  toPaymentOtherCreditCard(id: number, paymentType: string) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${id}/credit-card`]);
  }
  toPaymentOtherCreditCardPaymongo(id: number, paymentType: string) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${id}/credit-card-v2`]);
  }
  toPaymentOtherOnlineBankingPaymongo(id: number, paymentType: string) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${id}/online-banking`]);
  }

  toPaymentOtherGCash(id: number, paymentType: string) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${id}/gcash`]);
  }
  toPaymentOtherGrabPay(id: number, paymentType: string) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${id}/grabpay`]);
  }
  toTotalPaymentDetails(orderid: number, productid: number, paymentType: string) {
    this.router.navigate([`order/payment-gateway/${orderid}/${productid}/${paymentType}`]);
  }

  toTotalPaymentCreditCard(paymentType: string, securityId: string, productid: number, productType: number) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${securityId}/${productid}/${productType}/credit-card`]);
  }
  toTotalPaymentCreditCardPaymongo(paymentType: string, securityId: string, productid: number, productType: number) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${securityId}/${productid}/${productType}/credit-card`]);
  }
  toTotalPaymentPaypal(paymentType: string, securityId: string, productid: number, productType: number) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${securityId}/${productid}/${productType}/paypal`]);
  }
  toTotalPaymentGCash(paymentType: string, securityId: string, productid: number, productType: number) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${securityId}/${productid}/${productType}/gcash`]);
  }
  toTotalPaymentGrabPay(paymentType: string, securityId: string, productid: number, productType: number) {
    this.router.navigate([`order/payment-gateway/${paymentType}/${securityId}/${productid}/${productType}/grabpay`]);
  }

  toPaymentComplete(id) {
    this.router.navigate([`order/payment-complete/${id}`]);
  }

  toSubscription() {
    this.router.navigate([`subscribe-user`]);
  }

  toCustomerOrderReviews(order: Order) {
    this.router.navigate([`client-order/reviews/${order.securityId}`]);
  }

}
