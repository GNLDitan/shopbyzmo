import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/classes/product';
import { CategoryService } from 'src/app/services/category.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { DataService } from 'src/app/services/data.service';
import { FilterSetting } from 'src/app/classes/filter-settings';

@Component({
  selector: 'app-custom-breadcrumb',
  templateUrl: './custom-breadcrumb.component.html',
  styleUrls: ['./custom-breadcrumb.component.scss']
})
export class CustomBreadcrumbComponent implements OnInit {

  category: any;
  params: string;
  filter: FilterSetting;
  productName: string;
  constructor(
    public router: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private navigationService: NavigationService,
    private dataService: DataService) {
    this.category = new Array();
    this.filter = new FilterSetting();
  }

  ngOnInit() {
    this.params = this.router.snapshot.params.id;

    this.productService.getProductByLinkName(this.params).then((product: Product) => {
      this.category = this.categoryService.categoryMapping(product.category);
      this.category = this.category.reverse();
      this.productName = this.params;
    });
  }


  toProducts(category) {
    this.filter.category.push(category.category.toLowerCase());
    this.filter.forProductList = true;
    this.filter.forLanding = false;
    this.navigationService.toProductsFilter(this.filter);
  }

}
