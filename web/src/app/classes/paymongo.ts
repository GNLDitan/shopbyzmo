
export class PaymentResource {
    id: string;
    type: string;
    attributes: Attributes;

    constructor() {
        this.attributes = new Attributes();
    }
}

export class Attributes {
    billing?: Billing;
    details?: string;
    type?: string;
    amount?: number;
    currency?: string;
    redirect?: Redirect;
    description?: string;
    statement_descriptor?: string;
    status?: string;
    livemode: boolean = true;
    client_key?: string;
    created_at: number;
    updated_at: number;
    last_payment_error?: any;
    payment_method_allowed?: string[];
    payments?: [];
    next_action?: any;
    payment_method_options?: PaymentMethodOptions;
    metadata: MetaData;
    source: Source;
    capture_type: string;

    constructor() {
        this.payment_method_options = new PaymentMethodOptions();
        this.redirect = new Redirect();
        this.source = new Source();
    }
}



export class PaymentMethodOptions {
    card: {
        request_three_d_secure: any
    };
}


export class MetaData {
    yet_another_metadata?: string;
    reference_number?: string;
    sample?: string;
}


export class Billing {
    address: Address;
    email: string;
    name: string;
    phone: string;
    type?: string;
}

export class Address {
    city?: string;
    country: string;
    line1: string;
    line2: string;
    postal_code: string;
    state: string;
}

export class Redirect {
    checkout_url: string;
    success: string;
    failed: string;
}


export class Source {
    id: string;
    type: string;
}

// Payment Intent
export class AttachPaymentIntent {
    attributes: AttachPaymentIntentAttributes;
    constructor() {
        this.attributes = new AttachPaymentIntentAttributes();
    }
  }


  export class AttachPaymentIntentAttributes {
    payment_method?: string;
    client_key?: string;
    constructor() {
       
    }
}
  

// Payment Method
export class PaymentMethod {
    attributes: CreditCardAttributes;

    constructor() {
        this.attributes = new CreditCardAttributes();
    }
}
// Credit Card

export class CreditCardAttributes {
    billing?: Billing;
    details?: CreditCardDetails;
    type?: string;
    livemode: boolean;
    description : string;
    payment_method_types: string[];
    reference_number: string;
    success_url: string;
    line_items: LineItem[]
    cancel_url: string;

    constructor() {
       
    }
}

export class CreditCardDetails {
    card_number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    bank_code?: string;
}

export class LineItem {
    amount: number;
    currency: string;
    description: string;
    name: string;
    quantity: number
}
