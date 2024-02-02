import { PaymentMethod } from './payment-method';

export class PaymentTotal {
    orderId: number;
    productId: number;
    paymentType: string;
    amount: number;
    securityId: string;
    productName: string;
    productType: number;
    paymentMethod: PaymentMethod;

    constructor() {
        this.paymentMethod = new PaymentMethod();
    }
}
