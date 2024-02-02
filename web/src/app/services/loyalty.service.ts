import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FilterSetting } from '../classes/filter-settings';
import { LoyaltyDiscount } from '../classes/loyalty-discount';
import { User } from '../classes/user';
import { LoyaltyVoucher } from '../classes/loyalty-voucher';
import { Order } from '../classes/order';

@Injectable({
    providedIn: 'root'
})
export class LoyaltyService {
    api: string;
    constructor(private http: HttpClient) {
        this.api = '/loyalty';
    }

    getLoyaltyDiscountListRange(filter: FilterSetting) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/getloyaltydiscountlistrange`, filter)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        });
    }

    getLoyaltyDiscountById(id) {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getloyaltydiscountbyid/${id}`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    createLoyaltyDiscount(loyaltyDiscount: LoyaltyDiscount) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/createloyaltydiscount`, loyaltyDiscount)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


    updateLoyaltyDiscount(loyaltyDiscount: LoyaltyDiscount) {
        return new Promise((resolve, reject) => {
            this.http.patch(`${this.api}/updateloyaltydiscount`, loyaltyDiscount)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    deleteLoyaltyDiscount(loyaltyDiscount: LoyaltyDiscount) {
        return new Promise((resolve, reject) => {
            this.http.delete(`${this.api}/deleteloyaltydiscount/${loyaltyDiscount.id}`)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


    getActiveVoucherByUser(user: User) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/getloyalvoucherbyuser`, user)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    claimVoucher(voucher: LoyaltyVoucher) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/claimvoucher`, voucher)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


    getActiveLoyaltyVoucher(voucher: LoyaltyVoucher) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/getactiveloyaltyvoucher`, voucher)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

    generateLoyaltyDiscount(order: Order) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/generateloyaltydiscount`, order)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }


}
