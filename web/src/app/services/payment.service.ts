import { Injectable } from '@angular/core';
import { FilterSetting } from '../classes/filter-settings';
import { HttpClient } from '@angular/common/http';
import { PaymentMethod } from '../classes/payment-method';
import { PaymentDetails } from '../classes/payment-details';
import { LayAwaySchedule } from '../classes/layaway-schedule';
import { PreOrderSchedule } from '../classes/pre-order-schedule';
import { PaymentTotal } from '../classes/payment-total';
import { TransactionFee } from '../classes/transaction-fee';
import { GCashPayment } from '../classes/gcash-payment';
import { DataService } from './data.service';
import { CreditCardPayment } from '../classes/credit-card-payment';
import { Utils } from '../app.utils';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  api: string;
  constructor(private http: HttpClient,
        private dataService: DataService) {
    this.api = '/payment';
  }



  getPaymentMethodListRange(filter: FilterSetting) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getpaymentmethodlistrange`, filter)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }
  getCheckoutPaymentMethodListRange(filter: FilterSetting) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getcheckoutpaymentmethodlistrange`, filter)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  

  createPaymentMethod(paymentMethod: PaymentMethod) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createpaymentmethod`, paymentMethod)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getPaymentMethodById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getpaymentmethodbyid/${id}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updatePaymentMethod(paymentMethod: PaymentMethod) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updatepaymentmethod`, paymentMethod)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  deletePaymentMethodById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deletepaymentmethodbyid`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  completePayment(paymentDetails: PaymentDetails) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/completepayment`, paymentDetails)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }


  paymentLayawaySchedule(paymentDetails: PaymentDetails) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/paymentlayawayschedule`, paymentDetails)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  paymentPreOrderSchedule(paymentDetails: PaymentDetails) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/paymentpreorderschedule`, paymentDetails)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  updatePaymentLayawaySchedule(sched: LayAwaySchedule) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/updatepaymentlayawayschedule`, sched)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  updatePaymentPreOrderSchedule(sched: PreOrderSchedule) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/updatepaymentpreorderschedule`, sched)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }


  getPaymentTotal(paymentTotal: PaymentTotal) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getpaymenttotal`, paymentTotal)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  createTransactionFees(transactionFee: TransactionFee) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createtransactionfees`, transactionFee)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createTransactionFeesBulk(transactionFees: Array<TransactionFee>) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createtransactionfeesbulk`, transactionFees)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updateTransactionFees(transactionFee: TransactionFee) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updatetransactionfees`, transactionFee)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getTransactionFeesByPaymentMethodId(paymentmethodid: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/gettransactionfeesbypaymentmethodid/${paymentmethodid}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteTransactionFees(transactionFee: TransactionFee) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deletetransactionfees`, transactionFee)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createGCashPayment(payment: GCashPayment) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/creategcashpayment`, payment)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updateStatusSource(sourceId: string, status: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/updatestatussource`, { sourceId: sourceId, status: status })
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }
  
  getCreditCardPaymentMethod() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getcreditcardmethod`)
        .subscribe((data: any) => {
          this.dataService.setCreditCardMethod(data);
          localStorage.setItem(Utils.LS_ISPAYMONGO, data.isPaymongo)
          resolve(data)
        }, (error) => reject(error));
    });
  }

  createCreditCardPayment(payment: CreditCardPayment) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/creategcashpayment`, payment)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createOnlineBankingPayment(payment: CreditCardPayment) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/creategcashpayment`, payment)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

}
