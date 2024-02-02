import { LayawayTransactionFee } from './layaway-transaction-fee';
import { Order } from './order';
import { PreOrderTransactionFee } from './pre-order-transactionFee';

export class BraintreePayment {
    orderId: number;
    productId: number;
    amount: number;
    currency: string;
    paymentType: string;
    layAwayId: number;
    preOrderId: number;
    isTotal: boolean;
    withTransactionFee: boolean;
    preOrderTransactionFee: PreOrderTransactionFee;
    layawayTransactionFee: LayawayTransactionFee;
    Order: Order;
}
