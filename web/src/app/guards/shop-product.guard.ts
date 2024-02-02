import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { DataService } from '../services/data.service';
import { ProductService } from '../services/product.service';

import { Product } from '../classes/product';
import { MetaTagService } from '../services/meta-tag.service';
import { DomService } from '../services/dom-service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ShopProductGuard implements CanActivate {
    productFolder: string;
    constructor(private dataService: DataService,
        private productService: ProductService,
        private metaService: MetaTagService,
        private domService: DomService) {
        this.productFolder = environment.productFolderPath;
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const param: any = next.params.id;
        this.productService.getProductByLinkName(param).then((product: Product) => {
            if (product != null) {

                const currentImage = product.productImages.filter(x => x.isDefaultImage).length > 0
                    ? product.productImages.find(x => x.isDefaultImage) :
                    product.productImages[0];
                const productDesc = product.productDescription.replace(/(<([^>]+)>|&nbsp;)/gi, "");
                this.domService.setCanonicalURL(`${environment.webUrl}/products/${product.linkName}`);
                this.metaService.setTitle(`Shop Byzmo | ${product.productName}`)
                this.metaService.setSocialMediaTags(`${environment.webUrl}/products/${product.linkName}`,
                    `Shop Byzmo | ${product.productName}`,
                    productDesc,
                    this.productFolder + currentImage.fileName,
                    '1920',
                    '1080');
                this.dataService.setProduct(product);
                return false;
            } else return false;
        }).catch((ex) => {
            return false;
        });
        return true;
    }
}