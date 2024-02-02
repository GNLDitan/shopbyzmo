import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/classes/product';
import { environment } from 'src/environments/environment';
import { Utils } from 'src/app/app.utils';
import { FilterSetting } from 'src/app/classes/filter-settings';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {

  public products: Array<Product>;
  productFolder: string;
  searchInput: string;
  filter: FilterSetting;

  constructor(private productService: ProductService) {
    this.productFolder = environment.productFolderPath;
    this.searchInput = "";
    this.filter = new FilterSetting();
  }

  ngOnInit() {
    this.getProducts();
  }

  getProducts() {
    this.filter.forProductList = true;
    this.productService.getProductsListRange(this.filter).then((product: any) => {
      this.products.map((product) => {
        if (!Utils.isArrayNullOrUndefinedOrEmpty(product.productImages))
          if (product.productImages.length > 0)
            product.currentImageUrl = this.productFolder + product.productImages[0].fileName;
      });
    });
  }

}
