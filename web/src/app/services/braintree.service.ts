import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Nonce } from '../classes/nonce';
import { HttpClient } from '@angular/common/http';

// var braintree = require("braintree");

@Injectable({
    providedIn: 'root'
})

export class BraintreeService {
    gateway: any;
    api: string;
    constructor(private http: HttpClient) {
        this.api = '/braintree';
    }

    creatPurchace(nonce: Nonce) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/createpurchase`, nonce)
                .subscribe(next => resolve(next), error => reject(error));
        });
    }

}