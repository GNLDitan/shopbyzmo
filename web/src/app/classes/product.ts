import { FileMapper } from './file-mapper';
import { Tag } from './tag';

export class Product {
    id: number;
    productName: string;
    productDescription: string;
    itemNumber: string;
    quantity: number;
    price: number;
    isactive: boolean;
    productImages: Array<FileMapper>;
    currentImageUrl: string;
    category: string;
    tags: Tag[];
    linkName: string;
    onSale: boolean;
    salesPrice: number;
    preOrder: boolean;
    isLayAway: boolean;
    isExceed: boolean;
    originalQuantity: number;
    preOrderDepositAmount: number;
    displayTag: string;
    hasCostPrice: boolean;
    costPrice: number;
    hasRushFee: boolean;
    rushFee: number;
    sorting: number;
    isNotification: boolean;
    isDeleted: boolean;
    preOrderLayaway: boolean;
    isSelected: boolean;
    constructor() {
        this.productImages = new Array<FileMapper>();
        this.tags = new Array<Tag>();
        this.preOrderDepositAmount = 0;
        this.productName = '';
        this.displayTag = '';
    }
}
