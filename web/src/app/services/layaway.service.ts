import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LayAway } from '../classes/layaway';
import { Product } from '../classes/product';
import * as moment from 'moment';
import { LayAwaySchedule } from '../classes/layaway-schedule';
import { ProductLayAway } from '../classes/product-layaway';
@Injectable({
    providedIn: 'root'
})
export class LayAwayService {

    constructor(private http: HttpClient) {
    }

    getLayAwayDetails(layaway: LayAway, product: Product, quantity: number): ProductLayAway {
        const layAwayDetails = new ProductLayAway();
        const ponrd = layaway.percentOfNonRefundDeposit;
        const noOfInstallment = layaway.maxNumberOfInstallmentPayment;
        const price = product.onSale ? product.salesPrice : product.price;
        const nonRefundDeposit = ponrd > 0 ? (price * quantity) * (ponrd / 100) : 0;
        const monthlesspercent = (price * quantity) - (nonRefundDeposit);
        const monthly = noOfInstallment > 0 ? monthlesspercent / noOfInstallment : monthlesspercent;
        layAwayDetails.nonRefundDeposit = nonRefundDeposit;
        layAwayDetails.monthlesspercent = monthlesspercent;
        layAwayDetails.monthly = monthly;
        layAwayDetails.datesOfPayment = layaway.datesOfPayment;
        layAwayDetails.numberOfInstallmentPayment = noOfInstallment;

        return layAwayDetails;
    }

    getLayAwaySchedule(layaway: LayAway, monthly: number, productLayAway: ProductLayAway = new ProductLayAway()): Array<LayAwaySchedule> {
        const dateObj = new Date();
        const year = dateObj.getFullYear(); // months from 1-12
        let month = dateObj.getMonth();
        let monthDate = new Date(year, month, layaway.datesOfPayment);
        const sched = new Array<LayAwaySchedule>();

        if (productLayAway.nonRefundDeposit > 0) {
            const nonRefundSched: any = {
                id: 0,
                orderId: 0,
                productId: 0,
                date: new Date(),
                monthly: productLayAway.nonRefundDeposit,
                isNonRefundDeposit: true,
                isCleared: false,
                isShipping: false,
                attachment: null,
                isSendEmail: false,
                isPrSend: false
            };

            sched.push(nonRefundSched);

        }

        if (dateObj > monthDate) {
            month++;
        }

        for (let i = 0; i < layaway.maxNumberOfInstallmentPayment; i++) {
            monthDate = new Date(year, month, layaway.datesOfPayment);

            const layAwayDetails: any = {
                id: 0,
                orderId: 0,
                productId: 0,
                date: monthDate,
                monthly,
                isNonRefundDeposit: false,
                isCleared: false,
                isShipping: false,
                attachment: null,
                isSendEmail: false,
                isPrSend: false
            };
            month++;
            sched.push(layAwayDetails);
        }
        return sched;
    }

}
