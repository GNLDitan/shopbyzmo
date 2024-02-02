import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    private readonly api: string;
    private readonly imageType: string;
    fileLanding: string;

    constructor(private http: HttpClient) {

        this.api = '/dashboard';
    }

    getOutOfStock() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getoutofstock`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getDelayedPayment() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getdelayedpayment`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getMonthNewOrder() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getmonthneworder`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


    getUserSubscription() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getusersubscription`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getBlogNotification() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getblognotification`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


    getMostOrderedProduct() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getmostorderedproduct`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getMostLoyaltyUser() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getmostloyaltyuser`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getOrderStatus() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getorderstatus`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


    getOrdersCount() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getorderscount`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


}