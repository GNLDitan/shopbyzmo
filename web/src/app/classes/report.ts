import { Product } from './product';

export class Report {
    orderId: number;
    orderDate: Date;
    completeName: string;
    email: string;
    statusId: number;
    total: number;
    balance: number;
    isSendEmail: boolean;
    products: Array<Product>;
    shippingDate: Date;
    trackingNumber: string;
    invoiceNumber: string;
    discountCode: number;
    discountAmount: number;
    dueDate: Date;
    hasRushFee: boolean;
    paymentStatus: string;
    constructor() {
        this.products = new Array();
    }
}
