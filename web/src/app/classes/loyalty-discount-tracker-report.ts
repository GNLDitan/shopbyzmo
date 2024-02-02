import { LoyaltyDiscountTracker } from './loyalty-discount-tracker';

export class LoyaltyDiscountTrackerReport {
    name: string;
    email: string;
    userId: number;
    discountCode: string;
    tierLevel: string;
    accumulatedPurchaseAmount: number;
    loyaltyId: number;
    loyaltyDiscountTracker: Array<LoyaltyDiscountTracker>;

    constructor() {
        this.loyaltyDiscountTracker = new Array();
    }

}


