import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { DataService } from '../services/data.service';
import { ProductService } from '../services/product.service';

import { ProductInventory } from '../classes/product-inventory';
import { Product } from '../classes/product';

@Injectable({
    providedIn: 'root'
})
export class ProductInventoryGuard implements CanActivate {

    constructor(private dataService: DataService,
        private productService: ProductService) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const param: any = next.params.id;
        this.productService.getProductById(param).then((product: Product) => {
            if (product != null) {
                this.dataService.setProduct(product);
            } else return false;
        });
        return true;
    }
}