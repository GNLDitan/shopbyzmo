import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FilterSetting } from '../classes/filter-settings';
import { Order } from '../classes/order';
import { PaymentDetails } from '../classes/payment-details';
import { Cart } from '../classes/cart';
import { Utils } from '../app.utils';
import { Discount } from '../classes/discount';
import { DOCUMENT } from '@angular/common';
import { LayAwaySchedule } from '../classes/layaway-schedule';
import { PreOrderSchedule } from '../classes/pre-order-schedule';
import { PreOrderNotification } from '../classes/preorder-notification';
import { OrderProductRate } from '../classes/order-product-rate';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    api: string;
    constructor(private http: HttpClient,
        @Inject(DOCUMENT) private document) {
        this.api = '/order';
    }

    getOrderListRange(filter: FilterSetting) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/getorderlistrange`, filter)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        });
    }

    getOrderById(id) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getorderbyid/${id}`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    createOrder(order: Order) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/createorder`, order)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


    CompleteOrder(order: Order) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/completeorder`, order)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }



    GetOrderByShippingId(id) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getorderbyshippingid/${id}`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    updateOrder(order: Order) {
        return new Promise((resolve, reject) => {
            this.http.patch(`${this.api}/updateorder`, order)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getOrdersByUserId(filter: FilterSetting) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/getordersbyuserid`, filter)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


    getLayawayScheduleById(id: number) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getlayawayschedulebyid/${id}`)
                .subscribe((data) => resolve(data), (error) => reject(error));
        });
    }


    sendOrderEmail(order: Order) {
        return new Promise((resolve, reject) => {
            this.http.post('/email/sendorderemail', order)
                .subscribe((data) => resolve(data), (error) => reject(error));
        });
    }

    sendAdminOrder(order: Order) {
        return new Promise((resolve, reject) => {
            this.http.post('/email/sendadminorder', order)
                .subscribe((data) => resolve(data), (error) => reject(error));
        });
    }

    getOrderBySecurityId(securityid: string) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getorderbysecurityid/${securityid}`)
                .subscribe((data) => resolve(data), (error) => reject(error));
        });
    }

    getPreOrderScheduleById(id: string) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getpreorderschedulebyid/${id}`)
                .subscribe((data) => resolve(data), (error) => reject(error));
        });
    }

     
    sendPreOrderNotification(orderNotif: PreOrderNotification) {
        return new Promise((resolve, reject) => {
            this.http.post('/email/sendpreordernotification', orderNotif)
                .subscribe((data) => resolve(data), (error) => reject(error));
        });
    }
    orderProductReview(orderProductRate: OrderProductRate) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/createorderproductrate`, orderProductRate)
                .subscribe((data) => resolve(data), (error) => reject(error));
        });
    }

    adminSendEmail(order: Order) {
        // let div = this.document.createElement('div');
        // let len = 0;
        // div.innerHTML = order.shippingDetails.emailInstruction;
        // order.shippingDetails.emailInstruction = div.innerText;
        let cartShippingAmount = 0;
        const newcart = order.orderCart;
        newcart.map((crt: Cart) => {
            const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
                ? crt.product.productImages.find(x => x.isDefaultImage) :
                crt.product.productImages[0];
            crt.product.currentImageUrl = currentImage.fileName;
            crt.paymentDates = Utils.numericSuffix(crt.datesOfPayment) + ' of the month';

            if (crt.isLayAway) {
                crt.layAwaySchedule.map((sched: LayAwaySchedule) => {
                    if (sched.isShipping) {
                        cartShippingAmount = cartShippingAmount + sched.monthly;
                    }
                });
            }

            if (crt.preOrder || (crt.preOrderLayaway && !crt.isLayAway)) {
                crt.preOrderSchedule.map((sched: PreOrderSchedule) => {
                    if (sched.paymentTerm === 'SH') {
                        cartShippingAmount = cartShippingAmount + sched.amount;
                    }
                });
            }

        });


        order.shippingAmount = cartShippingAmount > 0 ? cartShippingAmount : order.shippingAmount;
        let preOrderSum = 0;
        for (const pre of order.orderCart.filter(x => x.preOrder)) {
            preOrderSum = preOrderSum + (pre.product.price * pre.quantity) + pre.rushFee;
        }
        for (const pre of order.orderCart.filter(x => x.preOrderLayaway && !x.isLayAway)) {
            preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
        } 

        order.totalPrice = preOrderSum > 0 ? (order.shippingDetails.subTotal - order.discountAmount) + order.shippingAmount +
            order.insuranceFee : order.totalPrice;
        this.sendOrderEmail(order);
    }

    computeOrderBreakDown(order: Order, selectedDiscount: Discount, amountToPay: number) {
        let subTotal = 0, discount;
        let shippingAmount = 0;
        let shipAmount = 0;
        subTotal = order.shippingDetails.subTotal;
        shippingAmount = order.shippingDetails.rate;
        discount = selectedDiscount.amountTypeId == 1 ? selectedDiscount.amount : subTotal * (selectedDiscount.amount / 100);
        shipAmount = shippingAmount;

        order.shippingAmount = shipAmount;
        order.totalPrice = (subTotal + shipAmount) - discount;
        order.discountAmount = discount;
        order.amountToPay = amountToPay - discount;

        return order;
    }

   
}
