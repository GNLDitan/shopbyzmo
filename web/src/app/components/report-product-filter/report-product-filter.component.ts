import { DatePipe, DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/app.utils';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ProductCategory } from 'src/app/classes/product-category';
import { CategoryService } from 'src/app/services/category.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-report-product-filter',
  templateUrl: './report-product-filter.component.html',
  styleUrls: ['./report-product-filter.component.scss']
})
export class ReportProductFilterComponent implements OnInit {
  @Output() filterSettings = new EventEmitter<FilterSetting>();
  @Input() inputReportType: string;
  @Output() outputPrint = new EventEmitter<FilterSetting>();
  @Output() outputExport = new EventEmitter();


  public searchForm: any;
  public productType: [];
  public allCategory: any;
  public filterOrder: any;
  public sortFilter: any;
  public stocksFilter: any;
  public reportType: number;
  public tagsFilter: any;

  selectedCategory: Array<string>;
  openCombo: boolean;
  teWidth: number;

  constructor(private formBuilder: FormBuilder,
    private dataService: DataService,
    private datePipe: DatePipe,
    @Inject(DOCUMENT) private document,
    private categoryService: CategoryService) {
    this.selectedCategory = new Array();
    this.productType = [];
    Object.assign(this.productType, Utils.REPORT_PRODUCT_TYPE);

    this.sortFilter = []
    Object.assign(this.sortFilter, Utils.REPORT_SORT);

    this.stocksFilter = []
    Object.assign(this.stocksFilter, Utils.REPORT_STOCKS_FILTER);

    this.tagsFilter = []
    Object.assign(this.tagsFilter, Utils.REPORT_TAGS_FILTER);


    this.filterOrder = [];
    Object.assign(this.filterOrder, Utils.FILTER_ORDER);
    this.filterOrder.unshift({
      code: 'default',
      name: 'Default'
    });
  }

  ngOnInit() {
    this.dataService.selectedCategory$.subscribe((category: any) => {
      this.allCategory = category;
    })
    let currentDate = new Date();
    this.searchForm = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      categoryFilter: ['default'],
      productType: [0],
      productSort: [1],
      stockFilter: [0],
      tag: ['all']
    });
    this.searchForm.controls.startDate.setValue(this.datePipe.transform(currentDate, "MM-dd-yyyy"));
    this.searchForm.controls.endDate.setValue(this.datePipe.transform(currentDate, "MM-dd-yyyy"));
    this.search();

  }

  search() {
    let filterSettings = this.initializeFilter();
    this.filterSettings.emit(filterSettings);
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    const parent = this;
    if (changes.hasOwnProperty('inputReportType')) {
      this.reportType = changes.inputReportType.currentValue;
    }
  }

  onOpenCombo() {
    this.teWidth = this.document.getElementById('fake-input').clientWidth;
    this.openCombo = !this.openCombo;
  }

  changeSelection(filter: ProductCategory) {
    let index = this.selectedCategory.indexOf(filter.code);
    if (index == -1) {
      this.selectedCategory.push(filter.code);
    } else {
      this.selectedCategory.splice(index, 1);
    }
  }


  selectAll() {
    this.selectedCategory = [];
    for (let i in this.allCategory) {
      this.selectedCategory.push(this.allCategory[i].code);
    }
  }

  deselectAll() {
    this.selectedCategory = [];
  }

  setFilter() {

  }

  print() {
    let filterSettings = this.initializeFilter();
    this.outputPrint.emit(filterSettings);
  }

  initializeFilter() {
    var filterSettings = new FilterSetting();
    filterSettings.categoryFilter = this.searchForm.controls.categoryFilter.value;
    filterSettings.productType = this.searchForm.controls.productType.value;
    filterSettings.productSort = this.searchForm.controls.productSort.value;
    filterSettings.stockFilter = this.searchForm.controls.stockFilter.value;
    filterSettings.startDate = this.searchForm.controls.startDate.value;
    filterSettings.endDate = this.searchForm.controls.endDate.value;
    filterSettings.tag = this.searchForm.controls.tag.value;
    filterSettings.offset = 0;
    filterSettings.category = this.selectedCategory;
    return filterSettings;
  }

  export() {
    this.outputExport.emit();
  }


}
