import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { ProductService } from '../services/product.service';
import { Discount } from '../classes/discount';

@Injectable({
  providedIn: 'root'
})
export class DiscountGuard implements CanActivate {
  constructor(private dataService: DataService,
    private productService: ProductService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const param: any = next.params.id;
    this.productService.getDiscountById(param).then((discount: Discount) => {
      if (discount != null) {
        this.dataService.setDiscount(discount);
      } else return false;
    });
    return true;
  }

}
