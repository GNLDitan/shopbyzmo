import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Utils } from '../app.utils';
import { DataService } from './data.service';

import * as  data from '../data/Common-Currency.json';
import * as fx from 'money/money.js';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CurrenyService {
    base: string;
    rates: any;
    selectedCurrency: string;
    api: string;

    constructor(private http: HttpClient,
        public dataService: DataService) {
        this.base = Utils.BASE_CURRENCY;
        this.api = '/currency';
    }

    getForexRate() {
        return new Promise((resolve, reject) => {
            if (!this.validLocalRates()) {
                // this.http.get(`${environment.exchangeRateApi}/${environment.exchangeRateKey}/latest/${this.base}`)
                //     .subscribe((next: any) => {
                       
                //     }, error => reject(error));
                this.getCurrencyData().then((data: any) => {
                    this.rates = data.conversion_Rates;
                    this.dataService.setCurrencyRates(this.rates);
                    this.setRates();

                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (!Utils.isNullOrUndefined(this.rates) && Object.entries(this.rates).length > 0) {
                        var localRates = {
                            base: this.base,
                            selectedCurrency: this.selectedCurrency,
                            date: today.toString(),
                            rates: this.rates
                        }
                        localStorage.setItem(Utils.LS_FOREX, JSON.stringify(localRates));
                        this.setSelectedRate(this.rates);
                    }
                    resolve(data);
                })
            } else {
                var localForex: any = JSON.parse(localStorage.getItem(Utils.LS_FOREX));
                this.rates = localForex.rates;
                this.dataService.setCurrencyRates(this.rates);
                this.setRates();
                resolve(localForex.rates);
            }

        });
    }

    setRates() {
        fx.base = this.base;
        fx.rates = this.rates;

        if (!Utils.isNullOrUndefined(this.rates) && Object.entries(this.rates).length > 0) {
            this.setSelectedRate(this.rates);
        }
    }

    setInitialCurrency() {
        const curr = localStorage.getItem(Utils.LS_CURRENCY);
        if (Utils.isArrayNullOrUndefinedOrEmpty(curr)) {
            this.setCurrency(this.base);
        } else {
            this.selectedCurrency = curr;
        }
    }

    getCurrency() {
        return localStorage.getItem(Utils.LS_CURRENCY);
    }

    setCurrency(selectedCurrency) {
        this.selectedCurrency = selectedCurrency;
        localStorage.setItem(Utils.LS_CURRENCY, selectedCurrency);
        if (!Utils.isNullOrUndefined(this.rates) && this.rates.length > 0) {
            this.setSelectedRate(this.rates);
        }
    }

    priceConvert(amount: number): number {
        if (!Utils.isNullOrUndefined(fx)) {
            return fx.convert(amount, { from: this.base, to: this.selectedCurrency });
        } else {
            return 0;
        }

    }

    getCurrencySymbol(symble: string) {
        const symblos: any = (data as any).default;
        return symblos[symble].symbol;
    }

    setSelectedRate(rates: any) {
        const curr = localStorage.getItem(Utils.LS_CURRENCY);
        var selectedCurr;

        if (Utils.isArrayNullOrUndefinedOrEmpty(curr)) {
            selectedCurr = this.base
        } else {
            selectedCurr = curr
        }

        if (!Utils.isNullOrUndefined(rates)) {
            const selectedRate = rates[selectedCurr];
            this.dataService.setSelectedRate(selectedRate);
        }
    }

    validLocalRates() {
        var localForex: any = JSON.parse(localStorage.getItem(Utils.LS_FOREX));
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!Utils.isArrayNullOrUndefinedOrEmpty(localForex)) {
            let d = new Date(localForex.date);
            d.setHours(0, 0, 0, 0);

            if ((d.toISOString() != today.toISOString()) || localForex.selectedCurrency != this.selectedCurrency) {
                localStorage.removeItem(Utils.LS_FOREX);
                return false
            }
            return true
        } else {
            return false
        }
    }

    getCurrencyData() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getcurrency/${this.base}`)
                .subscribe((next: any) => {
                    let rates = {};
                    Object.entries(next.conversion_Rates).map((res) => {
                        var c = res[0].toUpperCase();
                        rates[c] = res[1];
                    })
                    next.conversion_Rates = rates;
                    resolve(next)
                }, error => reject(error));
        });
    }
}
