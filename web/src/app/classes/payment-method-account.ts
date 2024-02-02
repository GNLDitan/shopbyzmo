export class PaymentMethodAccount {
    id: number;
    paymentMethodId: number;
    bankName: string;
    accountNumber: number;
    accountName: string;
    isDeleted: boolean;
    isNew: boolean;
    key: number;

    constructor() {
        this.id = 0;
    }
}
