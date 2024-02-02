import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ProductCategory } from 'src/app/classes/product-category';
import { CategoryService } from 'src/app/services/category.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-hierarchy',
  templateUrl: './category-hierarchy.component.html',
  styleUrls: ['./category-hierarchy.component.scss']
})
export class CategoryHierarchyComponent implements OnInit, OnDestroy {
  selectedAdminCategory: Subscription;
  selectedCategory: ProductCategory;
  category: any;
  allCategory: any;
  selectedHierarchy: any;
  categoryHierarchy: any;
  resultCategory: Array<ProductCategory>;
  categoryHierarchyList: any;
  selectedLevel: string;

  constructor(public dataService: DataService,
    public categoryService: CategoryService,
    private toasterService: ToasterService,
    private navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.category = {
      category: [],
      subcategory: [],
      brand: []
    }

    this.selectedHierarchy = {
      category: '',
      subcategory: '',
      brand: ''
    }

    this.categoryHierarchyList = new Array();
    this.categoryHierarchy = this.categoryService.categoryHierarchy;
    this.resultCategory = new Array();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.allCategory = this.dataService.allCategory;
      this.selectedAdminCategory = this.dataService.selectedAdminCategory$.subscribe((category) => {
        this.selectedCategory = category;
        this.getHirarchy();
        this.setCategoryHierarchy();
      });
    }


  }

  ngOnDestroy() {
    this.selectedAdminCategory.unsubscribe();
  }

  getHirarchy() {

    this.category.category = this.allCategory.filter(x => x.categoryHierarchy == this.categoryService.categoryHierarchy.category);
    this.category.category.unshift({
      id: 0,
      code: 'N/A',
      category: 'N/A',
      categoryHierarchy: 'N/A',
      parentCategory: 'N/A'
    })
    this.selectedHierarchy.category = 'N/A'

  }

  configHierarchy(category: string) {
    switch (category) {
      case this.categoryHierarchy.category:
        this.selectedHierarchy.subcategory = 'N/A'
        this.selectedHierarchy.brand = 'N/A'

        this.category.subcategory = this.allCategory.filter(x => x.categoryHierarchy == this.categoryService.categoryHierarchy.subcategory
          && x.parentCategory == this.selectedHierarchy.category);
        this.category.subcategory.unshift({
          id: 0,
          code: 'N/A',
          category: 'N/A',
          categoryHierarchy: 'N/A',
          parentCategory: 'N/A'
        })

        this.category.brand = this.allCategory.filter(x => x.categoryHierarchy == this.categoryService.categoryHierarchy.brand
          && x.parentCategory == this.selectedHierarchy.category);
        this.category.brand.unshift({
          id: 0,
          code: 'N/A',
          category: 'N/A',
          categoryHierarchy: 'N/A',
          parentCategory: 'N/A'
        })
        break;
      case this.categoryHierarchy.subcategory:
        this.category.brand = this.allCategory.filter(x => x.categoryHierarchy == this.categoryService.categoryHierarchy.brand
          && x.parentCategory == this.selectedHierarchy.subcategory);
        this.category.brand.unshift({
          id: 0,
          code: 'N/A',
          category: 'N/A',
          categoryHierarchy: 'N/A',
          parentCategory: 'N/A'
        })
        break;
    }
    this.setResult()
  }

  setResult() {
    this.resultCategory = new Array();
    if (this.selectedHierarchy.category != 'N/A') {
      Array.prototype.push.apply(this.resultCategory, this.allCategory.filter(x => x.code == this.selectedHierarchy.category));
    }
    if (this.selectedHierarchy.subcategory != 'N/A') {
      Array.prototype.push.apply(this.resultCategory, this.allCategory.filter(x => x.code == this.selectedHierarchy.subcategory));
    }
    if (this.selectedHierarchy.brand != 'N/A') {
      Array.prototype.push.apply(this.resultCategory, this.allCategory.filter(x => x.code == this.selectedHierarchy.brand));
    }

  }


  setCategoryHierarchy() {
    this.categoryHierarchyList = [{
      code: this.categoryHierarchy.category,
      description: 'Category'
    }, {
      code: this.categoryHierarchy.subcategory,
      description: 'Sub Category'
    }, {
      code: this.categoryHierarchy.brand,
      description: 'Brand'
    }, {
      code: this.categoryHierarchy.subbrand,
      description: 'Sub Brand'
    }]
  }

  save() {
    let newParent = '';
    if (this.selectedLevel == this.categoryHierarchy.subcategory)
      newParent = this.selectedHierarchy.category;
    else if (this.selectedLevel == this.categoryHierarchy.brand) {
      newParent = this.selectedHierarchy.subcategory;
      if (newParent == 'N/A')
        newParent = this.selectedHierarchy.category;
    }

    else if (this.selectedLevel == this.categoryHierarchy.subbrand)
      newParent = this.selectedHierarchy.brand;

    let updateHierarchy = new ProductCategory();
    updateHierarchy = this.selectedCategory;
    updateHierarchy.categoryHierarchy = this.selectedLevel.toLowerCase();
    updateHierarchy.parentCategory = newParent;
    updateHierarchy.isChangeHierarchy = true;
    this.categoryService.updateProductCategory(updateHierarchy).then((result) => {
      if (result != null) {
        this.toasterService.alert('success', 'Creating Category');
        this.categoryService.getAllCategory();
        this.navigationService.toAdminCategoryMaintenance();
      } else {
        this.toasterService.alert('error', 'Creating Category');
      }
    })
  }
}
