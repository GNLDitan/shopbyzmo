export class Discount {
    id: number;
    code: string;
    description: string;
    amountTypeId: number;
    amount: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    isOneTimeUse: boolean;
    constructor() {
        this.amount = 0;
        this.amountTypeId = 0;
    }
}
