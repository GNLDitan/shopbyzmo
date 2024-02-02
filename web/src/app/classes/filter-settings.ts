import { Utils } from '../app.utils';

export class FilterSetting {
    category: Array<string>;
    productDescription: string = null;
    productName: string = null;
    blogName: string = null;
    itemNumber: string = null;
    statusId: number = null;
    offset: number;
    limit: number;
    tag: string;
    sort: string;
    forAdmin: boolean;
    searchInput: string = null;
    startDate: Date;
    endDate: Date;
    withDateRange: boolean;
    productId: number;
    paymentStatusId: number;
    paymentMethodId: number;
    shippingMethodId: number;
    name: string;
    categoryFilter: string;
    productType: number;
    productSort: number;
    stockFilter: number;
    forLanding: boolean;
    forProductList: boolean;
    isInit: boolean;
    tags: Array<string>;
    isRushFee: boolean;

    constructor() {
        this.category = [];
        this.productName = '';
        this.productDescription = '';
        this.itemNumber = '';
        this.offset = 0;
        this.limit = Utils.PRODUCT_LIMIT;
        this.tag = '';
        this.forAdmin = false;
        this.searchInput = '';
        this.startDate = null;
        this.endDate = null;
        this.withDateRange = false;
        this.statusId = 0;
        this.forLanding = false;
        this.forProductList = false;
        this.isInit = true;
        this.tags = new Array();
    }
}
