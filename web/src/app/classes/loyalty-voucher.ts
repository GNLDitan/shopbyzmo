import { LoyaltyDiscount } from './loyalty-discount';


export class LoyaltyVoucher {
    id: number;
    userId: number;
    email: string;
    discountCode: string;
    isLifeTime: number;
    isActive: boolean;
    isClaimed: boolean;
    loyaltyDiscount: LoyaltyDiscount;
}

