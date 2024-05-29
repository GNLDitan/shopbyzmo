import { Product } from './product';
import { ProductLayAway } from './product-layaway';
import { LayAwaySchedule } from './layaway-schedule';
import { PreOrderSchedule } from './pre-order-schedule';

export class Cart {
    id: number;
    product: Product;
    quantity: number;
    totalPrice: number;
    cartCount: number;
    dateTime: Date;
    userId: number;
    layAway: ProductLayAway;
    layAwaySchedule: Array<LayAwaySchedule>;
    isLayAway: boolean;
    isExceed: boolean;
    datesOfPayment: number;
    numberOfInstallment: number;
    orderId: number;
    totalAmount: number;
    ipAddress: string;
    paymentDates: string;
    preOrderSchedule: Array<PreOrderSchedule>;
    hasRushFee = false;
    rushFee = 0;
    isNotifSend: boolean;
    // for order purposes
    price: number;
    onSale: boolean;
    salesPrice: number;
    preOrder: boolean;
    origPrice: number;
    numberOfInstallmentList: any;
    preOrderLayaway: boolean;
    hasMinimumAmount: boolean;
    isPreOrderNotify: boolean;
    hasReview: boolean;
    rating: number;
    constructor() {
        this.layAway = new ProductLayAway();
        this.layAwaySchedule = new Array<LayAwaySchedule>();
        this.preOrderSchedule = new Array<PreOrderSchedule>();
        this.isLayAway = false;
        this.isExceed = false;
        this.product = new Product();
        this.numberOfInstallmentList = [];

        this.hasRushFee = false;
        this.rushFee = 0;
    }
}

