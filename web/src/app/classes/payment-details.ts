import { LayawayTransactionFee } from './layaway-transaction-fee';
import { LoyaltyPayment } from './loyalty-payment';
import { PayPalPayment } from './paypal-payment';
import { PreOrderTransactionFee } from './pre-order-transactionFee';

export class PaymentDetails {
    id: number;
    orderId: number;
    productId: number;
    paymentMethod: string;
    paymentId: string;
    paypalPaymentId: string;
    paypalPayerId: string;
    paypalDebugId: string;
    graphQLId: string;
    layawayId: number;
    loyaltyPayment: LoyaltyPayment;
    amountPaid: number;
    preOrderId: number;
    isTotal: boolean;
    withTransactionFee: boolean;
    preOrderTransactionFee: PreOrderTransactionFee;
    layawayTransactionFee: LayawayTransactionFee;
    paypalPayment: PayPalPayment;
    pmSourceResourceId: string;
    pmPaymentId: string;

    constructor() {
        this.paypalPaymentId = '';
        this.paypalPayerId = '';
        this.paypalDebugId = '';
        this.paypalPayment = new PayPalPayment();
        this.loyaltyPayment = new LoyaltyPayment();
    }
}

