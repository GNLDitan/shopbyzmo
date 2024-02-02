

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FilterSetting } from '../classes/filter-settings';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    private readonly api: string;

    constructor(private http: HttpClient) {
        this.api = '/report';
    }

    getOrderReport(filter: FilterSetting, reportType: number) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/getorderreport/${reportType}`, filter)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getProductsReport(filter: FilterSetting, reportType: number) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/getproductsreport/${reportType}`, filter)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getLoyaltyDiscountTrackerReport(loyaltyid: number) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getloyaltydiscounttrackerreport/${loyaltyid}`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getCustomerListReport(sort: string) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getcustomerlistreport/${sort}`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    getUserSubscriptionReport() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getusersubscriptionreport`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

}
