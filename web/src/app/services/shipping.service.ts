import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Shipping } from '../classes/shipping';
import { FilterSetting } from '../classes/filter-settings';
import { ShippingDetails } from '../classes/shipping-details';
import { ShippingSpecialItemCost } from '../classes/shipping-special-item-cost';
import { Utils } from '../app.utils';
import { Cart } from '../classes/cart';
import { Discount } from '../classes/discount';
import { PaymentMethod } from '../classes/payment-method';
import { TransactionFee } from '../classes/transaction-fee';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  api: string;

  constructor(private http: HttpClient) {
    this.api = '/shipping';
  }

  createShipping(shipping: Shipping) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createshipping`, shipping)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }


  createShippingItemCost(shippingItemCost: Array<ShippingSpecialItemCost>) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createshippingitemcost`, shippingItemCost)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getShippingListRange(filter: FilterSetting) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getshippinglistrange`, filter)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteShippingById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteshippingbyid`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  getShippingById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getshippingbyid/${id}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updateShipping(shipping: Shipping) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updateshipping`, shipping)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }


  createShippingDetails(shipping: ShippingDetails) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createshippingdetails`, shipping)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }



  updateShippingDetails(shipping: ShippingDetails) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updateshippingdetails`, shipping)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }



  getShippingDetailsById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getshippingdetailsbyid/${id}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getShippingSpecialItemCostByShippingId(shippingId: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getshippingspecialitemcost/${shippingId}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createShippingSpecialItemCost(shippingSpecialItemCost: ShippingSpecialItemCost) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createshippingspecialitemcost`, shippingSpecialItemCost)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updateShippingSpecialItemCost(shippingSpecialItemCost: ShippingSpecialItemCost) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updateshippingspecialitemcost`, shippingSpecialItemCost)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteShippingSpecialItemCost(shippingSpecialItemCost: ShippingSpecialItemCost) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteshippingspecialitemcost`, shippingSpecialItemCost)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createShippingSpecialItemCostBulk(shippingSpecialItemCost: Array<ShippingSpecialItemCost>) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createshippingspecialitemcostbulk`, shippingSpecialItemCost)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  computeShippingBreakDown(selectedShipping: Shipping, quantity: number) {
    let amount = 0, strCnt = 2, qtyBrkdwn = [];
    // Base Quantity
    qtyBrkdwn.push({
      quantity: 1,
      amount: selectedShipping.rate
    });
    if (selectedShipping.hasAdditionRate) { // Additional  Rates
      const spclItmCost = selectedShipping.shippingSpecialItemCost;
      if (spclItmCost.length > 0) {
        const lastTier = spclItmCost.sort((a, b) => a.fromCount - b.fromCount)[spclItmCost.length - 1];
        const cntPerItem = lastTier.toCount == 0; // Check if theres a (Range To) in last rates
        for (let i = strCnt; i <= quantity; i++) {
          let qlfied = spclItmCost.filter(x => x.fromCount <= i && x.toCount >= i);
          if (Utils.isArrayNullOrUndefinedOrEmpty(qlfied)) {// check if no range then exact (Count From Range)
            qlfied = spclItmCost.filter(x => x.fromCount == i);
          }

          const isRchMxTier = lastTier.fromCount <= i;

          if (qlfied.length > 0) { // if qualifies to setup add
            const applyTier = qlfied[qlfied.length - 1]; // incase two rates result max is priority
            qtyBrkdwn.push({
              quantity: i,
              amount: applyTier.amount
            });
          } else {
            if (isRchMxTier && cntPerItem) {// if meet last tier but no (Range To) then compute the rest by last Rate
              qtyBrkdwn.push({
                quantity: i,
                amount: lastTier.amount
              });
            }
          }
        }
      }
    }
    amount = qtyBrkdwn.reduce((a, b) => {
      return a + b.amount;
    }, 0);
    return {
      qtyBrkdwn,
      amount
    };
  }


  computeTotalBreakDown(cart: Array<Cart>, shippingAmount: number, discount: Discount,
    paymentMethod: PaymentMethod = new PaymentMethod(), insurance: number) {

    let subTotal = 0, amountToPay = 0, totalAmount = 0,
      nrd = 0, nlamt = 0, discountAmt = 0, amttdsct = 0, trnRtFee = 0,
      fnlAmtTp = 0;
    cart.map((crt: Cart) => {
      // Get price to be pay
      let sellingPrice = (crt.product.onSale ? crt.product.salesPrice : crt.product.price);

      // For Layaway get NRD + Normal product Price
      if (crt.isLayAway) {
        nrd += crt.layAwaySchedule.filter(x => x.isNonRefundDeposit)
          .reduce((a, b) => {
            return a + b.monthly;
          }, 0);
      } else { nlamt += (sellingPrice * crt.quantity) }// Non layaway amount


      // For (Pre Order and preorder layaway with no layaway) compute Subtotal by DP
      if (crt.product.preOrder || (crt.product.preOrderLayaway && !crt.isLayAway)) {
        sellingPrice = crt.product.preOrderDepositAmount;
      }

      // Amount To be Discounted (Normal Items and not onsale + Pre Order DP)
      if (!crt.product.onSale && !crt.isLayAway) {
        amttdsct += (sellingPrice * crt.quantity);
      }

      subTotal += (sellingPrice * crt.quantity) + (crt.hasRushFee ? crt.rushFee : 0);

    });

    // if (shipping != null && hasInsurance) {
    //   insurance = this.computeShippingInsurance(subTotal, shipping);
    // }

    discountAmt = discount.amountTypeId === 1 ? discount.amount
      : amttdsct * (discount.amount / 100);
    // condition if with pre order
    totalAmount = cart.filter(x => x.product.preOrder || (x.product.preOrderLayaway && !x.isLayAway)).length > 0 ?
      (subTotal - discountAmt) :
      (subTotal - discountAmt) + (shippingAmount + insurance);
    amountToPay = (nrd + nlamt) - discountAmt; // (Non Refund Deposit + Non-layaway amount) - discount



    // Transaction Fees
    if (paymentMethod.withTransactionFee) {
      // 1. non refund deposit > 0 means layaway
      let ttlAmnt = nrd > 0 ? amountToPay : totalAmount;
      trnRtFee = this.computeTransactionFee(paymentMethod.transactionFee, ttlAmnt);
      // Final amount (Total amount + transactionfee)
      fnlAmtTp = ttlAmnt + trnRtFee;
    }


    return {
      discountAmt,
      shippingAmount,
      subTotal,
      totalAmount,
      amountToPay: amountToPay,
      trnRtFee: trnRtFee,
      insurance: insurance,
      fnlAmtTp: fnlAmtTp
    }
  }


  computeTransactionFee(transactionFee: Array<TransactionFee>, amount: number) {
    // 1. non refund deposit > 0 means layaway
    let ttlAmnt = amount, trnRtFee = 0;
    transactionFee.map((fees) => {
      trnRtFee += fees.amountTypeId === 1 ? fees.amount
        : ttlAmnt * (fees.amount / 100);
    });
    // Final amount (Total amount + transactionfee)
    return Math.round((trnRtFee + Number.EPSILON) * 100) / 100;
  }

  computeShippingInsurance(total: number, shipping: Shipping) {
    let insc = Math.trunc(total / shipping.everyAmount) - 1;
    return insc < 1 ? 0 : (insc * shipping.insuranceFee);
  }
}


