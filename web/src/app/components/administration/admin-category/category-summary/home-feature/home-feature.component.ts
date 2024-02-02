import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ProductCategory } from 'src/app/classes/product-category';
import { CategoryService } from 'src/app/services/category.service';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-home-feature',
  templateUrl: './home-feature.component.html',
  styleUrls: ['./home-feature.component.scss']
})
export class HomeFeatureComponent implements OnInit {
  categoryForm: any;
  collectibleDolls: ProductCategory[];

  constructor(public formBuilder: FormBuilder,
    public dataService: DataService,
    private categoryService: CategoryService,
    private toasterService: ToasterService,
    private navigationService: NavigationService) {
    this.collectibleDolls = new Array();
    this.categoryForm = this.formBuilder.group({
      first: [''],
      second: [''],
      third: [''],
      fourth: ['']
    });
  }

  ngOnInit() {

    this.dataService.selectedCategory$.subscribe((cat) => {
      var cdname = cat.filter(x => x.category.toLowerCase() == 'collectible dolls')[0];
      this.collectibleDolls = cat.filter(x => x.parentCategory == cdname.code);
    })

    this.dataService.selectedHomeFeature$.subscribe((feautre) => {
      this.categoryForm.patchValue(feautre);
    })

  }

  save() {
    var data = this.categoryForm.getRawValue();
    this.categoryService.createHomeFeature(data).then((result) => {
      if (result != null) {
        this.toasterService.alert('success', 'Creating Home Feature');
        this.categoryService.getHomeFeature();
        this.navigationService.toAdminCategoryMaintenance();
      } else {
        this.toasterService.alert('error', 'Creating Home Feature');
      }
    }).catch(() => {
      this.toasterService.alert('error', 'Creating Home Feature');
    })
  }

}
