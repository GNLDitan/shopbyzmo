import { ShippingSpecialItemCost } from './shipping-special-item-cost';

export class Shipping {
    id: number;
    shippingName: string;
    trackingUrl: string;
    description: string;
    rate: number;
    currencyId: number;
    isSelected: boolean;
    hasAdditionRate: boolean;
    shippingSpecialItemCost: Array<ShippingSpecialItemCost>;
    hasInsurance: boolean;
    everyAmount: number;
    insuranceFee: number;
    applyInsurance: boolean;
    isInternational: boolean;
    constructor() {
        this.applyInsurance = false;
        this.rate = 0;
        this.isSelected = false;
        this.hasInsurance = false;
        this.shippingSpecialItemCost = new Array();
    }
}
