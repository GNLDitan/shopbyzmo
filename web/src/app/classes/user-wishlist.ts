import { Address } from './address';
import { Product } from './product';

export class UserWishlist {

    id: number;
    email: string;
    productId: number;
    product: Product
}
