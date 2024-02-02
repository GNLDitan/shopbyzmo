import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { DataService } from 'src/app/services/data.service';
import { Utils } from 'src/app/app.utils';
import { Product } from 'src/app/classes/product';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ProductService } from 'src/app/services/product.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ProductCategory } from 'src/app/classes/product-category';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-admin-category',
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.scss']
})
export class AdminCategoryComponent implements OnInit {
  allCategory: any;
  categoryTree: any;
  hierarchy: any;
  currentCategory: string;
  isLoading: boolean = false;

  selectedCategory: ProductCategory;
  optionConfig: any = {
    onEdit: false,
    onUpdateHirarchy: false,
    onAddChildren: false
  }

  constructor(private dataService: DataService,
    private categorySerice: CategoryService,
    private navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object) {

    this.allCategory = new Array();
    this.categoryTree = [];
    this.selectedCategory = new ProductCategory();

  }

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.allCategory = this.dataService.allCategory;
      this.hierarchy = this.categorySerice.categoryHierarchy;
      this.currentCategory = '';

      this.dataService.selectedCategory$.subscribe((category) => {
        this.allCategory = this.dataService.allCategory;
        this.getCategoryTree();
      })
    }
  }

  getCategoryTree() {

    let parent = this;
    this.isLoading = true;
    this.categoryTree = [];
    this.allCategory.filter(x => x.categoryHierarchy == this.hierarchy.category).forEach((category) => {
      let catSubs = parent.allCategory.filter(x => x.parentCategory === category.code).sort((a, b) => (a.rowNumber < b.rowNumber ? -1 : 1));

      let categoryTree = {
        category: category,
        name: category.category,
        hierarchy: parent.hierarchy.category,
        subs: []
      }
      // Populate SubCategory
      if (catSubs.length > 0) {
        catSubs.forEach((subCat) => {

          let subCatTree = {
            category: subCat,
            name: subCat.category,
            hierarchy: subCat.categoryHierarchy,
            subs: []
          }
          categoryTree.subs.push(subCatTree);

        })
      }

      // Populate Brand
      categoryTree.subs.forEach((subCat) => {
        let brand = parent.allCategory.filter(x => x.parentCategory === subCat.category.code).sort((a, b) => (a.rowNumber < b.rowNumber ? -1 : 1));;
        if (brand.length > 0) {
          brand.forEach((brand) => {
            let brandTree = {
              category: brand,
              name: brand.category,
              hierarchy: brand.categoryHierarchy,
              subs: []
            }
            // Populate Sub Brand 
            let subBrand = parent.allCategory.filter(x => x.parentCategory === brandTree.category.code).sort((a, b) => (a.rowNumber < b.rowNumber ? -1 : 1));;
            subBrand.forEach((subBrand) => {
              let subBrandTree = {
                category: subBrand,
                name: subBrand.category,
                hierarchy: subBrand.categoryHierarchy,
                subs: []
              }
              brandTree.subs.push(subBrandTree);
            })

            subCat.subs.push(brandTree);

          })
        }
      })

      this.categoryTree.push(categoryTree);
    });
    this.isLoading = false;
  }

  getCategory(param: any) {
    this.currentCategory = param.category.code;
    this.selectedCategory = param.category;
    this.navigationService.toAdminEditProductCategory(this.currentCategory);
  }

  addCategory() {
    this.currentCategory = 'CD'
  }




}
