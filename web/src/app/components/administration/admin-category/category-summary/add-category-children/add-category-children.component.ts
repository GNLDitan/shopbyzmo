import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ProductCategory } from 'src/app/classes/product-category';
import { DataService } from 'src/app/services/data.service';
import { CategoryService } from 'src/app/services/category.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-category-children',
  templateUrl: './add-category-children.component.html',
  styleUrls: ['./add-category-children.component.scss']
})
export class AddCategoryChildrenComponent implements OnInit {
  selectedAdminCategory: Subscription;
  selectedCategory: ProductCategory;
  levels: Array<String>;
  selectedLevel: string;
  inputName: string;

  constructor(public dataService: DataService,
    public categoryService: CategoryService,
    private toasterService: ToasterService,
    private navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.selectedCategory = new ProductCategory();
    this.levels = Array();

  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.selectedAdminCategory = this.dataService.selectedAdminCategory$.subscribe((category) => {
        this.selectedCategory = category;
        this.getLevels();

      });
    }
  }

  ngOnDestroy() {
    this.selectedAdminCategory.unsubscribe();
  }

  getLevels() {
    let index = Object.keys(this.categoryService.categoryHierarchy).indexOf(this.selectedCategory.categoryHierarchy);
    Object.keys(this.categoryService.categoryHierarchy).map((x, i) => {
      if (i > index)
        this.levels.push(x)
    });
  }

  save() {

    let updateHierarchy = new ProductCategory();
    updateHierarchy.categoryHierarchy = this.selectedLevel.toLowerCase();
    updateHierarchy.category = this.inputName;
    updateHierarchy.parentCategory = this.selectedCategory.code;
    updateHierarchy.code = this.categoryService.generateCategoryCode(this.inputName);
    this.categoryService.createProductCategory(updateHierarchy).then((result) => {
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
