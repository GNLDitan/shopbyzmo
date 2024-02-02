import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Utils } from '../app.utils';
import { PaymentMethod, PaymentResource } from '../classes/paymongo';

@Injectable({
    providedIn: 'root'
})
export class PaymongoService {
    api: string;
    constructor(private http: HttpClient) {
        this.api = '/paymongo';
    }

    createSourceResources(data) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/createresource`, data)
                .subscribe((data: any) => {
                    if (data.hasOwnProperty('errors')) {
                        reject(data);
                    } else {
                        let session = localStorage.getItem(Utils.LS_PMSOURCERESOURCE);
                        if (session != null) {
                            localStorage.removeItem(Utils.LS_PMSOURCERESOURCE)
                        }
                        localStorage.setItem(Utils.LS_PMSOURCERESOURCE, data.data.id)
                        resolve(data)
                    }
                }, (error) => {
                    localStorage.removeItem(Utils.LS_PMSOURCERESOURCE)
                    reject(error);
                });
        })
    }

    getSourcerResourcesById(id: any) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getsourceresourcesbyid/${id}`)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        })
    }

    creatPayment(paymentIntentResource: PaymentResource) {
        return new Promise((resolve, reject) => {
            let payment = new PaymentResource()
            payment.attributes.description = paymentIntentResource.attributes.description;
            payment.attributes.currency = paymentIntentResource.attributes.currency;
            payment.attributes.amount = paymentIntentResource.attributes.amount;
            payment.attributes.statement_descriptor = 'Shop Byzmo';
            payment.attributes.source.id = paymentIntentResource.id;
            payment.attributes.source.type = paymentIntentResource.type;

            var data = {
                "data": payment
            };

            this.http.post(`${this.api}/creatpayment`, data)
                .subscribe((data: any) => resolve(data), (error) => reject(error));

        })
    }


    creatPaymentIntent(paymentIntentResource: PaymentResource) {
        return new Promise((resolve, reject) => {
            var data = {
                "data": paymentIntentResource
            };

            this.http.post(`${this.api}/createpaymentintent`, data)
                .subscribe((data: any) => resolve(data), (error) => reject(error));

        })
    }

    createCheckoutSession(paymentIntentResource: PaymentMethod) {
        return new Promise((resolve, reject) => {
            var data = {
                "data": paymentIntentResource
            };

            this.http.post(`${this.api}/createcheckoutsession`, data)
                .subscribe((data: any) => resolve(data), (error) => reject(error));

        })
    }



    createPaymentMethod(paymentMethod: PaymentMethod) {
        var data = {
            "data": paymentMethod
        };

        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/createpaymentmethod`, data)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        })
    }

    attachToPaymentIntent(id: any, payload: any) {
        var data = {
            "data": payload
        };

        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/attachtopaymentintent/${id}`, data)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        })
    }
}
