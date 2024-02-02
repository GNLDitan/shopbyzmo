import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { CategoryService } from 'src/app/services/category.service';
import { Utils } from 'src/app/app.utils';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { FilterService } from 'src/app/services/filter.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { DOCUMENT } from '@angular/common';
import { NavigationService } from 'src/app/services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.scss']
})
export class ProductFilterComponent implements OnInit, OnDestroy {

  filters: any;
  summaryFilter: any;
  filterOrder: any;
  allCategory: any;
  proxy: any;
  activeGroup = [];
  filterChangeHandler: any;
  filterSettings: FilterSetting;
  selectedGlobalFilter: Subscription;
  selectedCategory: Subscription;
  triggerClick: boolean;
  isMobile: boolean;
  paramCategory: any;
  paramTags: any;
  sort: string;
  tag: string;
  summaryTagFilter: any;
  isFilter: boolean;

  constructor(
    public dataService: DataService,
    public categoryService: CategoryService,
    public filterService: FilterService,
    @Inject(DOCUMENT) private document,
    public navigationService: NavigationService,
    public route: ActivatedRoute,
    private router: Router,
    public metaService: MetaTagService) {
    this.summaryFilter = [];
    this.allCategory = [];
    this.filters = [];
    this.proxy = [];
    this.filterSettings = new FilterSetting();
    this.filterOrder = [];
    this.summaryTagFilter = [];

    this.route.queryParams.subscribe(params => {
      this.summaryTagFilter = [];
      if (!Utils.isArrayNullOrUndefinedOrEmpty(params.category)) {
        this.paramCategory = params.category.replace(/-/g, ' ').split(':');
        if (this.allCategory.length > 0) {
          const data = this.allCategory.filter(x => this.paramCategory.indexOf(x.category) >= 0);
          this.summaryFilter = [];
          data.forEach((result, i) => {
            // categoryDec += ((i == 0 ? '' : ' - ') + result.category);
            this.summaryFilter.push({
              name: result.category,
              code: result.code,
              order: result.categoryHierarchy
            });
          });
        }
      } else {
        // * RESET ALL FILTER * //
        this.summaryFilter = [];
        if (this.filters.length > 0) {
          this.filters.filter(x => x.category.length > 0)
            .map(x => {
              x.category.forEach(category => {
                category.isSelected = false;
              });
            });
        }
      }
      if (!Utils.isArrayNullOrUndefinedOrEmpty(params.tags)) {
        this.paramTags = params.tags.replace(/-/g, ' ').split(':');
        if (this.paramTags.length > 0) {
          this.paramTags.forEach(tag => {
            this.summaryTagFilter.push(tag);
          });
        }
      }

      if (!Utils.isArrayNullOrUndefinedOrEmpty(params.sort)) {
        this.sort = params.sort.replace(/-/g, ' ');
      } else {
        this.filterSettings.sort = '';
      }

      if (!Utils.isArrayNullOrUndefinedOrEmpty(params.tag)) {
        this.tag = params.tag.replace(/-/g, ' ');
      } else {
        this.filterSettings.tag = '';
      }


    });

  }

  ngOnInit() {
    this.filterOrder = Utils.FILTER_ORDER;
    this.isMobile = window.outerWidth <= 500 && window.outerHeight <= 800;
    this.filterSettings = this.dataService.activeFilter;
    // this.selectedGlobalFilter = this.dataService.selectedGlobalFilter$.subscribe((filter) => {
    //   if (filter.hasOwnProperty('category')) {
    //     if ((filter.category.length > 0 && filter.category.length < 2) || !Utils.isArrayNullOrUndefinedOrEmpty(filter.sort) || !Utils.isArrayNullOrUndefinedOrEmpty(filter.tag)) {
    //       this.summaryFilter = new Array();
    //       this.allCategory = this.dataService.allCategory;
    //       this.filterSettings = filter;
    //       // Must Be Single Category
    //       if ((filter.category.length > 0 && filter.category.length < 2)) {
    //         filter.category.forEach((catCode) => {
    //           const category = this.allCategory.filter(x => x.code === catCode)[0];
    //           this.summaryFilter.push({
    //             name: category.category,
    //             code: category.code,
    //             order: category.categoryHierarchy
    //           });
    //         });
    //       }

    //       this.setFilter();
    //       // this.dataService.setGlobalFilter(new FilterSetting());


    //     } else {
    //       this.summaryFilter = new Array();
    //     }
    //     if (!Utils.isArrayNullOrUndefinedOrEmpty(filter.sort) || !Utils.isArrayNullOrUndefinedOrEmpty(filter.tag)) {
    //       const index = Utils.FILTER_ORDER.length;
    //       if (this.filters.length > 0) {
    //         this.filters[index - 1].name = !Utils.isArrayNullOrUndefinedOrEmpty(filter.sort) ? filter.sort : filter.tag;
    //       }
    //     } else {
    //       const index = Utils.FILTER_ORDER.length;
    //       if (this.filters.length > 0) {
    //         this.filters[index - 1].name = 'Sort';
    //       }
    //     }
    //   }
    // });
    if (this.filterOrder.filter(x => x.name === 'Availability').length <= 0) {
      this.filterOrder.push({
        name: 'Availability',
        code: 'Availability'
      });
    }
    if (this.filterOrder.filter(x => x.name === 'Sort').length <= 0) {
      this.filterOrder.push({
        name: 'Sort',
        code: 'Sort'
      });
    }

    const parent = this;
    // if (this.dataService.allCategory.length === 0) {
    this.selectedCategory = this.dataService.selectedCategory$.subscribe((category) => {
      if (category.length > 0) {
        this.filterSettings = new FilterSetting();
        this.allCategory = category;
        this.allCategory.map(x => {
          x.category = x.category.toLowerCase()
        })
        if (!Utils.isArrayNullOrUndefinedOrEmpty(this.paramCategory)) {
          this.filterSettings.category = category.filter(x => this.paramCategory.indexOf(x.category) >= 0).map(x => x.code);
        }
        if (!Utils.isArrayNullOrUndefinedOrEmpty(this.sort)) {
          this.filterSettings.sort = this.sort;
        }
        if (!Utils.isArrayNullOrUndefinedOrEmpty(this.tag)) {
          this.filterSettings.tag = this.tag;
        }

        if (!Utils.isArrayNullOrUndefinedOrEmpty(this.paramTags)) {
          this.filterSettings.tags = this.paramTags;
        }
        this.loadFilterOrder();
      }
    });

  }

  ngOnDestroy() {
  }

  loadFilterOrder() {
    let groupId = 0;
    const parent = this;
    const pendingFilter = this.filterSettings.category;
    const pendingTags = this.filterSettings.tags;
    this.filterOrder.forEach((order) => {
      const filters = {
        name: order.name,
        code: order.code,
        category: [],
        sorts: [],
        availability: []
      };
      if (order.code !== 'Sort' && order.code != 'Availability') {
        this.allCategory = this.allCategory.sort((a, b) => (a.parentRowNumber < b.parentRowNumber ? -1 : 1));

        // this.allCategory = this.allCategory.sort(function (a, b) {
        //   return a.parentRowNumber.localeCompare(b.parentRowNumber) && b.rowNumber - a.rowNumber;
        // });

        let category = this.allCategory.filter(x => x.categoryHierarchy === order.code);
        category.forEach((cat, row) => {
          if (Utils.isStringNullOrEmpty(cat.parentCategory)) {
            groupId = row;
          } else {
            const parentCat = cat.parentCategory;
            parent.filters.forEach((filter: any) => {
              const getCat = filter.category.filter(x => x.code === parentCat);
              if (!Utils.isNullOrUndefined(getCat)) {
                if (getCat.length > 0) {
                  groupId = getCat[0].groupId;
                  return;
                }
              }
            });
          }
          const isSelected = pendingFilter.indexOf(cat.code) > -1;

          const categoryChild = {
            category: cat.category,
            code: cat.code,
            order: order.code,
            isSelected,
            groupId,
            isDisplay: true
          };
          if (isSelected) {
            this.summaryFilter.push({
              name: categoryChild.category,
              code: categoryChild.code,
              order: categoryChild.order
            });
          }
          filters.category.push(categoryChild);
        });
      } else {
        if (order.code == 'Availability') {
          filters.availability.push({
            isSelected: pendingTags.filter(x => x == 'Just Arrived').length > 0,
            name: 'Just Arrived'
          });

          filters.availability.push({
            isSelected: pendingTags.filter(x => x == 'On Hand').length > 0,
            name: 'On Hand'
          });

          filters.availability.push({
            isSelected: pendingTags.filter(x => x == 'Pre Order').length > 0,
            name: 'Pre Order'
          });

          filters.availability.push({
            isSelected: pendingTags.filter(x => x == 'On Sale').length > 0,
            name: 'On Sale'
          });
        }
        if (order.code == 'Sort') {
          filters.sorts.push('Name: A to Z');
          filters.sorts.push('Name: Z to A');
          filters.sorts.push('Price: Low to High');
          filters.sorts.push('Price: High to Low');
          if (!Utils.isArrayNullOrUndefinedOrEmpty(this.filterSettings.sort)) {
            filters.name = !Utils.isArrayNullOrUndefinedOrEmpty(this.filterSettings.sort) ? this.filterSettings.sort : this.filterSettings.tag;
          } else {
            filters.name = order.code;
          }

        }


      }
      this.filters.push(filters);
    });
  }

  openFilterDialog(id: any) {
    if (!(window.outerWidth <= 500 && window.outerHeight <= 800)) {
      const element = this.document.getElementById(id);
      const isOpen = Object.entries(element.classList)
        .filter(x => x[1] === 'open').length > 0;
      const child = element.firstElementChild as HTMLBodyElement;

      // prevent multiple open
      while (this.document.getElementsByClassName('open').length > 0) {
        const openTab = this.document.getElementsByClassName('open')[0];
        const openTabchild = openTab.firstElementChild as HTMLBodyElement;

        openTab.classList.remove('open');
        openTabchild.style.backgroundColor = 'transparent';
      }

      if (!isOpen) {
        element.classList.add('open');
        child.style.backgroundColor = 'transparent';
      } else {
        element.classList.remove('open');
        child.style.backgroundColor = 'transparent';
      }
    }

  }

  selectedFilter(cat: any, i = 0) {
    cat.isSelected = !cat.isSelected;
    this.setFilterList(cat, cat.isSelected);
    if (this.isMobile) {
      this.clickPanel('collapse' + i);
      this.closeNav();
    }

  }

  setFilterList(data, value) {
    if (value) {
      this.summaryFilter.push({
        name: data.category,
        code: data.code,
        order: data.order
      });
    } else {
      const remove = this.summaryFilter.filter(x => x.code === data.code)[0];
      const index = this.summaryFilter.indexOf(remove);

      this.summaryFilter.splice(index, 1);
    }
    // this.filterSettings.tag = '';
    // this.filterSettings.sort = '';

    // const index = Utils.FILTER_ORDER.length;
    // this.filters[index - 1].name = 'SORT'
    this.setCategoryUrl();
  }

  setCategoryUrl() {
    const cat = this.summaryFilter.map(x => Utils.stringReplace(x.name, '-'));
    const tags = this.summaryTagFilter.map(x => Utils.stringReplace(x, '-'));
    const filter = this.filterSettings;
    filter.category = cat;
    filter.forProductList = true;
    filter.forLanding = false;
    filter.sort = Utils.stringReplace(filter.sort, '-');
    filter.tag = Utils.stringReplace(filter.tag, '-');
    filter.tags = tags;
    this.navigationService.toProductsFilter(filter);
  }

  removeFilter(filter: any) {
    const index = this.summaryFilter.indexOf(filter);
    this.summaryFilter.splice(index, 1);

    this.filters.filter(x => x.code === filter.order)[0]
      .category.filter(x => x.code === filter.code).map((data) => {
        data.isSelected = false;
      });

    this.setCategoryUrl();
  }

  selectedSort(cat, i) {
    const sortHeader = this.document.getElementById('sortId');

    while (this.document.getElementsByClassName('open').length > 0) {
      const openTab = this.document.getElementsByClassName('open')[0];
      const openTabchild = openTab.firstElementChild as HTMLBodyElement;

      openTab.classList.remove('open');
      openTabchild.style.backgroundColor = 'transparent';
    }
    this.filters[i].name = cat;
    this.filterSettings.tag = '';
    this.filterSettings.forProductList = true;
    this.filterSettings.forAdmin = false;
    this.filterSettings.sort = cat;
    this.filterSettings.offset = 0;
    this.setCategoryUrl();
  }

  mouseLeave() {
    if (!this.triggerClick) {
      while (this.document.getElementsByClassName('open').length > 0) {
        const openTab = this.document.getElementsByClassName('open')[0];
        const openTabchild = openTab.firstElementChild as HTMLBodyElement;
        openTab.classList.remove('open');
        openTabchild.style.backgroundColor = 'transparent';
      }
    }
    this.triggerClick = false;
  }


  click() {
    this.triggerClick = true;
  }

  selectedTag(availability, cat, i = 0) {
    cat.isSelected = !cat.isSelected;
    this.summaryTagFilter = [];
    availability.filter(x => x.isSelected).map((data) => {
      this.summaryTagFilter.push(data.name);
    });
    this.filterSettings.tags = this.summaryTagFilter.map(x => x);
    this.setCategoryUrl();
    if (this.isMobile) {
      this.clickPanel('collapse' + i);
      this.closeNav();
    }
  }

  removeTagFilter(cat) {
    this.filters.filter(x => x.code == 'Availability')
      .map(x => {
        x.availability.filter(x => x.name == cat)
          .map(x => x.isSelected = false);
      });
    this.summaryTagFilter.splice(this.summaryTagFilter.indexOf(cat), 1);
    this.filterSettings.tags = this.summaryTagFilter.map(x => x);
    this.setCategoryUrl();
  }


  openModal(isFilter) {
    this.document.getElementById("mobileFilter").style.width = "100%";
    this.isFilter = isFilter;
  }

  closeNav() {
    this.document.getElementById("mobileFilter").style.width = "0%";
  }

  mobileSort(cat, i) {
    this.selectedSort(cat, i)
    this.closeNav();
  }

  clickPanel(id) {
    let panel = this.document.getElementById(id);
    let fc = panel.firstChild;
    fc.classList.toggle('active')

    var ns = fc.nextElementSibling;
    if (ns.style.maxHeight) {
      ns.style.maxHeight = null;
    } else {
      ns.style.maxHeight = ns.scrollHeight + "px";
    }
  }


  myFunction() {
    const x = document.getElementById('myTopnav');
    if (x.className === 'topnav') {
      x.className += ' responsive';
    } else {
      x.className = 'topnav';
    }
  }
}
