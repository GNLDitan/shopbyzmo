import { Component, OnInit, SimpleChange, Input, Inject, PLATFORM_ID } from '@angular/core';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/classes/product';
import { NavigationService } from 'src/app/services/navigation.service';
import { ProductCategory } from 'src/app/classes/product-category';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { CategoryService } from 'src/app/services/category.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-category-summary',
  templateUrl: './category-summary.component.html',
  styleUrls: ['./category-summary.component.scss']
})
export class CategorySummaryComponent implements OnInit {

  products: Array<Product>;
  currentCategory: string;
  selectedCategory: ProductCategory;
  onEdit: boolean;
  allCategory: Array<ProductCategory>;
  filter: FilterSetting;
  isCollectibleDolls: boolean;
  constructor(public productService: ProductService,
    public navigationService: NavigationService,
    public activatedRoute: ActivatedRoute,
    public categoryService: CategoryService,
    public dataService: DataService,
    public confirmationService: ConfirmationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public toasterService: ToasterService) {
    this.products = new Array();
    this.selectedCategory = new ProductCategory();
    this.allCategory = new Array();
    this.filter = new FilterSetting();
  }

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {

      this.allCategory = this.dataService.allCategory;

      this.activatedRoute.paramMap.subscribe(params => {
        this.currentCategory = params.get("id");
        this.dataService.selectedCategory$.subscribe((cat) => {
          this.selectedCategory = cat.filter(x => x.code == this.currentCategory)[0]
          this.isCollectibleDolls = this.selectedCategory.category.toLowerCase() == 'collectible dolls'
          this.dataService.setSelectedCategory(this.selectedCategory);
          this.getAllRelatedCategory(this.selectedCategory.code);
          this.getProducts();
          this.getHierarchy();
        })


      })
    }
  }



  gotoEditProduct(product: any) {
    this.navigationService.toAdminEditProduct(product.id);
  }


  getHierarchy() {
    this.categoryService.categoryMapping(this.currentCategory);
  }

  deleteCategory() {
    const dialogQuestion = 'Are you sure to delete this item?';
    const dialogMessage = 'Selected item will be removed.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      this.selectedCategory.category, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        let relatedCategory = this.filter.category;
        this.categoryService.deleteProductCategoryList(relatedCategory).then((result) => {
          if (result) {
            this.toasterService.alert('success', 'Deleting Category');
            this.categoryService.getAllCategory();
            this.navigationService.toAdminCategoryMaintenance();
          } else {
            this.toasterService.alert('error', 'Deleting Category');
          }
        })
      }
    }).catch(() => { });
  }

  saveCodeName() {
    this.onEdit = !this.onEdit
    this.categoryService.updateProductCategory(this.selectedCategory).then((result) => {
      this.navigationService.toAdminCategoryMaintenance();
    })

  }

  getProducts() {
    this.filter.limit = 9999999;
    this.filter.forAdmin = true;
    this.productService.getProductsListRange(this.filter).then((product: any) => {
      this.products = product;
    });
  }




  getAllRelatedCategory(code: string) {
    let hierarch = []
    this.filter = new FilterSetting();

    let subs = this.categoryService.getAllSubCategories(code)
    let filterDetails = this.allCategory.filter(x => x.code == code);
    const found = subs.some(r => filterDetails.filter(x => x.code != code).indexOf(r) >= 0)

    if (!found) {
      hierarch.push(code)
      subs.map(x => {
        hierarch.push(x.code)
      });
    }

    this.filter.category = hierarch;
  }

  moveOrderId(productCategory: ProductCategory, moveTypeId: number) {
    productCategory.moveTypeId = moveTypeId;
    this.productService.moveCategoryOrderId(productCategory).then((success: any) => {
      if (success) {
        this.navigationService.toAdminCategoryMaintenance();
      }
    }, (error) => { console.log(error.error); });
  }

}
