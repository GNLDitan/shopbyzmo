import { ShippingDetails } from './shipping-details';
import { Cart } from './cart';
import { OrderReason } from './order-reason';
import { FileViewer } from './file-viewer';
import { OrderEmailStatus } from './order-email-status';
import { Product } from './product';

export class Order {

    id: number;
    orderNumber: number;
    dateOrder: Date;
    customerName: string;
    email: string;
    amount: number;
    shippingId: number;
    paymentStatusId: number;
    paymentStatus: string;
    layaway: boolean;
    statusId: number;
    status: string;
    invoiceNumber: number;
    shippingAddress: string;
    shippingDetails: ShippingDetails;
    paymentMethodDescription: string;
    paymentMethodName: string;
    orderCart: Array<Cart>;
    trackingNumber: string;
    shippingDate: Date;
    ipAddress: string;
    withPreOrder: boolean;
    transactionFee: number;
    finalAmount: number;
    insuranceFee: number;
    isEmailSubscribe: boolean;
    // for email
    amountToPay: number;
    discountAmount: number;
    shippingAmount: number;
    totalPrice: number;
    orderReason: OrderReason;
    paynowEnable: boolean;
    reason: string;
    orderAttachment: Array<FileViewer>;
    orderEmailStatus: Array<OrderEmailStatus>;
    securityId: string;
    forLayAway: boolean;
    layAwayId: number;
    isSendEmail: boolean;
    trackingUrl: string;
    forPreOrder: boolean;
    preOrderId: number;
    isPrSend: boolean;
    forPr: boolean;
    preOrderLayaway: boolean;
    paymongoStatus: number;
    NotifProduct: Product;
    forPreOrderNotif: boolean;

    constructor() {
        this.orderCart = new Array<Cart>();
        this.paymentMethodName = '';
        this.orderReason = new OrderReason();
        this.shippingDetails = new ShippingDetails();
        this.orderAttachment = new Array<FileViewer>();
        this.orderEmailStatus = new Array<OrderEmailStatus>();
        this.NotifProduct = new Product();
        this.trackingNumber = '';
        this.forPr = false;
        this.layaway = false;
        this.withPreOrder = false;
    }

}
