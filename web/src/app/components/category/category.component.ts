import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChange, Inject } from '@angular/core';
import { CategoryService } from 'src/app/services/category.service';
import { Utils } from 'src/app/app.utils';
import { ProductCategory } from 'src/app/classes/product-category';
import { DataService } from 'src/app/services/data.service';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit, OnChanges {
  @Output() outputCategory: EventEmitter<string>;
  @Input() inputCurrentCategory: string;

  category: any;
  selectedCategory: any;
  currentCategory: string;
  allCategory: Array<ProductCategory>;
  constructor(private categoryService: CategoryService,
    private dataService: DataService,
    @Inject(DOCUMENT) private document) {
    this.outputCategory = new EventEmitter();
    this.allCategory = new Array();
  }

  ngOnInit() {
    this.allCategory = this.dataService.allCategory;
  }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.inputCurrentCategory.previousValue != changes.inputCurrentCategory.currentValue) {
      let level = 0;
      this.currentCategory = changes.inputCurrentCategory.currentValue;
      this.allCategory = this.dataService.allCategory;
      this.removeAllChild();
      var list = this.categoryService.categoryMapping(this.currentCategory);

      if (!Utils.isNullOrUndefined(list[0])) {
        for (var a = list.length - 1; a >= 0; a--) {
          this.setSelectOption(list[a].code);
        }
        if (list.length > 0) {
          level = Object.values(this.categoryService.categoryHierarchy).map((x: any) => x.toLowerCase()).indexOf(list[0].categoryHierarchy.toLowerCase()) + 1;
          if (level <= 3) {
            var option;
            var optionId = 'categoryId';
            var lastOption = list[0].code;
            switch (level) {
              case 0:
                option = this.allCategory.filter(x => x.categoryHierarchy == 'category' && x.parentCategory == lastOption);
                optionId = this.categoryService.generateCategoryId('category');
                break;
              case 1:
                option = this.allCategory.filter(x => x.categoryHierarchy == 'subcategory' && x.parentCategory == lastOption);

                if (option.length <= 0) {
                  option = this.allCategory.filter(x => x.categoryHierarchy == 'brand' && x.parentCategory == lastOption)
                  optionId = this.categoryService.generateCategoryId('brand');
                } else
                  optionId = this.categoryService.generateCategoryId('subcategory');
                break;
              case 2:
                option = this.allCategory.filter(x => x.categoryHierarchy == 'brand' && x.parentCategory == lastOption)
                optionId = this.categoryService.generateCategoryId('brand');
                break;
              case 3:
                option = this.allCategory.filter(x => x.categoryHierarchy == 'subbrand' && x.parentCategory == lastOption);
                optionId = this.categoryService.generateCategoryId('subbrand');
                break;
            }
            this.generateSelectOption(optionId, option, 'N/A')
          }
        }
      } else {
        this.setSelectOption('');
      }
    }
  }


  setSelectOption(selectedCategory: string) {
    var selectedCat = this.allCategory.filter(x => x.code == selectedCategory)[0];
    var categoryOptions = this.categoryService.getChildCategory(Utils.isNullOrUndefined(selectedCat) ? '' : selectedCat.parentCategory);
    var categoryId = this.categoryService.generateCategoryId(Utils.isNullOrUndefined(selectedCat) ? 'category' : selectedCat.categoryHierarchy);

    this.generateSelectOption(categoryId, categoryOptions, selectedCategory);
  }

  getSubBrand(event: any) {
    let curtEl: any = this.document.getElementById(event.target.id);
    let selectedCategory = curtEl.options[curtEl.selectedIndex].value;
    if (this.categoryService.getHierarchyCurrentIndex(event.target.id) < Object.keys(this.categoryService.categoryHierarchy).length - 1) {
      let nextId = this.categoryService.getNextIdHierarchy(event.target.id);
      let subCategory = this.categoryService.getChildCategory(selectedCategory);
      this.removeRightChild(event.target.id);
      this.generateSelectOption(nextId, subCategory, selectedCategory);
    } else {
      if (selectedCategory != 'N/A')
        this.outputCategory.emit(selectedCategory);
    }

  }

  generateSelectOption(id: any, options: any, defaultValue: string) {
    let parentDom = this.document.getElementById('categoryparent');
    let category = this.document.createElement('select');
    let parent = this;

    category.classList.add('browser-default', 'custom-select', 'mr-1')
    category.style.width = 'auto';
    category.id = id;

    if (!Utils.isArrayNullOrUndefinedOrEmpty(category.id)) {
      // set no category by default
      category.options.add(new Option('N/A', 'N/A'));
      // populate data 
      options.map((sub: any) => {
        category.options.add(new Option(sub.category, sub.code));
      });
      category.value = defaultValue;
      // events
      category.onchange = function (e) {
        parent.getSubBrand(e);
      }
      if (defaultValue != 'N/A')
        this.outputCategory.emit(defaultValue);
      // append to child nodes
      parentDom.appendChild(category);
    }
  }

  removeRightChild(currFormCat: string) {
    let parentDom = this.document.getElementById('categoryparent') as any;
    let hierarchyCode = currFormCat.substr(0, currFormCat.length - 2);
    let currentCategoryId = parentDom.childNodes[parentDom.children.length - 1].id;
    let lastHierarchCode = currentCategoryId
      .substr(0, currentCategoryId.length - 2);
    let currHierarchyIndex = Object.keys(this.categoryService.categoryHierarchy)
      .indexOf(hierarchyCode);
    let lastHierarchyIndex = Object.keys(this.categoryService.categoryHierarchy)
      .indexOf(lastHierarchCode);

    if (lastHierarchyIndex > currHierarchyIndex) {
      parentDom.removeChild(parentDom.childNodes[parentDom.children.length - 1]);
      this.removeRightChild(currFormCat);
    }

  }

  removeAllChild() {
    let parentDom = this.document.getElementById('categoryparent');

    if (!Utils.isNullOrUndefined(parentDom))
      while (parentDom.firstChild) {
        parentDom.removeChild(parentDom.firstChild);
      }
  }

}
