import { Discount } from './discount';
import { PaymentMethod } from './payment-method';
import { Shipping } from './shipping';

export class ShippingDetails {
    id: number;
    completeName: string;
    email: string;
    mobileNumber: string;
    address: string;
    barangay: string;
    city: string;
    province: string;
    zipCode: number;
    country: string;
    specialInstruction: string;
    shippingMethod: number;
    shippingMethodDescription: string;
    paymentMethod: number;
    shippingAddressId: number;
    subTotal: number;
    shippingAmount: number;
    total: number;
    discountCode: string;
    userId: number;
    rate: number;
    amountToPay: number;
    trackingUrl: string;
    discount: Discount;
    emailInstruction: string;
    shippingMethodDetails: Shipping;
    paymentMethodDetails: PaymentMethod;
    discountAmount: number;
    shippingName: string;
    transactionFee: number;
    finalAmount: number;
    billingAddress: string;
    states: string;
    prefecture: string;
    postalCode: string;
    numCode: string;
    countryCode: string;
    baseCurrency: string;
    currencyRate: number;
    isEmailSubscribe: boolean;
    insuranceFee: number;
    hasInsurance: boolean;
    hasMinimumAmount: boolean;
    facebookName: string;
    constructor() {
        this.id = 0;
        this.paymentMethod = 0;
        this.userId = 0;
        this.discountCode = '';
        this.discount = new Discount();
        this.hasMinimumAmount = false;
        this.shippingMethodDetails = new Shipping();
    }
}
