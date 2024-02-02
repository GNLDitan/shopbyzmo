import { PaymentMethodAccount } from './payment-method-account';
import { ShippingSpecialItemCost } from './shipping-special-item-cost';
import { TransactionFee } from './transaction-fee';

export class PaymentMethod {
    id: number;
    name: string;
    description: string;
    withAccount: boolean;
    emailInstruction: string;
    paymentMethodAccounts: Array<PaymentMethodAccount>;
    transactionFee: Array<TransactionFee>;
    isActive: boolean;
    isSelected: boolean;
    withTransactionFee: boolean;
    hasMinimumAmount: boolean;
    isPaymongo: boolean;

    constructor() {
        this.hasMinimumAmount = false;
    }
}
