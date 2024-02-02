export class PayPalPayment {
    id: number;
    cart: string;
    createTime: Date;
    paypalId: string
    intent: string;
    state: string;
    payerId: string;
    paymentMethod: string;
    paymentDetailsId: number;
}