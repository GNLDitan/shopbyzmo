export class PayPalPurchaseUnit {
    amount: UnitAmount;
    items: items[];

    constructor() {
        this.amount = new UnitAmount();
    }
}

export class UnitAmount {
    currency_code: string;
    value: number;
    breakdown?: PurchaseUnitBreakdown;
}

export class PurchaseUnitBreakdown {
    item_total: UnitAmount;
    constructor() {
        this.item_total = new UnitAmount();
    }
}

export class items {
    name: string;
    quantity: number;
    category: string;
    unit_amount: UnitAmount;
    constructor() {
        this.unit_amount = new UnitAmount();
    }

}



