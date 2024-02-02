export class Address {
    id: number;
    userId: number;
    address: string;
    city: string;
    province: string;
    barangay: string;
    countryCode: string;
    zipCode: string;
    isDefault: boolean;
    completeAddress: string;
    isSelected: boolean;
    postalCode: string;
    prefecture: string;
    states: string;
    constructor() {
        this.id = 0;
    }
}
