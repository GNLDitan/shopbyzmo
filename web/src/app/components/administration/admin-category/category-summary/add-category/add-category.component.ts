import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ProductCategory } from 'src/app/classes/product-category';
import { CategoryService } from 'src/app/services/category.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  selectedAdminCategory: Subscription;
  selectedCategory: ProductCategory;
  category: Array<ProductCategory>;
  inputName: string;

  constructor(public dataService: DataService,
    public categoryService: CategoryService,
    private toasterService: ToasterService,
    private navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.selectedCategory = new ProductCategory();
    this.category = new Array();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.selectedAdminCategory = this.dataService.selectedAdminCategory$.subscribe((category) => {
        this.selectedCategory = category;
        this.getCategoryHierarchy();
      });
    }

  }

  ngOnDestroy() {
    this.selectedAdminCategory.unsubscribe();
  }
  getCategoryHierarchy() {
    let mapping = this.categoryService.categoryMapping(this.selectedCategory.code);
    mapping.reverse()
    mapping.pop()
    this.category = mapping;
  }

  save() {

    let updateHierarchy = new ProductCategory();
    updateHierarchy.categoryHierarchy = this.selectedCategory.categoryHierarchy.toLowerCase();
    updateHierarchy.category = this.inputName;
    updateHierarchy.parentCategory = this.selectedCategory.parentCategory;
    updateHierarchy.code = this.categoryService.generateCategoryCode(this.inputName);
    this.categoryService.createProductCategory(updateHierarchy).then((result) => {
      if (result != null) {
        this.toasterService.alert('success', 'Creating Category');
        this.navigationService.toAdminCategoryMaintenance();
        this.categoryService.getAllCategory();
      } else {
        this.toasterService.alert('error', 'Creating Category');
      }
    })
  }
}
