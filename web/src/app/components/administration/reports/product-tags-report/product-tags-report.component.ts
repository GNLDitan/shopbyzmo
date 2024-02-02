import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/app.utils';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ReportProducts } from 'src/app/classes/report-products';
import { CategoryService } from 'src/app/services/category.service';
import { DataService } from 'src/app/services/data.service';
import { ExportToExcelService } from 'src/app/services/export-excel.servicel';
import { PrintService } from 'src/app/services/print.service';
import { ReportService } from 'src/app/services/report.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-product-tags-report',
  templateUrl: './product-tags-report.component.html',
  styleUrls: ['./product-tags-report.component.scss']
})
export class ProductTagsReportComponent implements OnInit, OnDestroy {

  filterSetting: FilterSetting;
  reports: Array<ReportProducts>;
  reportType: number;
  categorySubscription: Subscription;
  categories: string;
  allCategory: any;
  productTypeDesc: string;
  tagFilterDesc: string;
  productType: any;
  tagsFilter: any;
  constructor(private SpinnerService: NgxSpinnerService,
              private reportService: ReportService,
              private toasterService: ToasterService,
              private dataService: DataService,
              private categoryService: CategoryService,
              private printService: PrintService,
              private exportToExcelService: ExportToExcelService) {
    this.filterSetting = new FilterSetting();
    this.reports = new Array();
    this.reportType = Utils.PRODUCT_TAG_REPORT;
    this.productType = [];
    Object.assign(this.productType, Utils.REPORT_PRODUCT_TYPE);

    this.tagsFilter = [];
    Object.assign(this.tagsFilter, Utils.REPORT_TAGS_FILTER);
  }

  ngOnInit() {
    this.categorySubscription = this.dataService.selectedCategory$.subscribe((category: any) => {
      this.allCategory = category;
    });
  }

  ngOnDestroy() {
    this.categorySubscription.unsubscribe();
  }


  search(event: any) {
    this.filterSetting = event;
    if (this.filterSetting.category.length > 0) {
      if (this.allCategory.length > 0) {
        let categories = this.allCategory.filter((x: any) => this.filterSetting.category.indexOf(x.code) >= 0);
        this.categories = categories.map((x: any) => x.category).join(' - ').toString();
      }
    }
    this.productTypeDesc = this.getProductTypeDesc();
    this.tagFilterDesc = this.getProductTagsDesc();
    this.setFilter();
    this.getProductReport();
  }


  getProductReport() {
    this.filterSetting.limit = 1000;
    this.SpinnerService.show();
    this.reportService.getProductsReport(this.filterSetting, Utils.PRODUCT_TAG_REPORT).then((reports: any) => {
      this.reports = reports;
      this.SpinnerService.hide();
    }).catch((ex) => {
      this.toasterService.alert('error', ex.statusText);
    });
  }

  setFilter() {
    if (this.filterSetting.category.length > 0) {
      const category = this.filterSetting.category;
      const hierarch = [];
      category.forEach((code) => {
        const subs = this.categoryService.getAllSubCategories(code);
        const filterDetails = this.allCategory.filter(x => x.code == code);
        const found = subs.some(r => filterDetails.filter(x => x.code != code).indexOf(r) >= 0);

        if (!found) {
          hierarch.push(code);
          subs.map(x => {
            hierarch.push(x.code);
          });
        }
      });

      this.filterSetting.category = hierarch;
    }
  }

  print() {
    this.printService.printProductTagReport(this.reports, this.filterSetting);
  }

  export() {
    const title = 'Product Tags Report';
    const columns = [
      { key: 'Product Name', column: 'productName', cellFormat: 'text' },
      { key: 'Item Number', column: 'itemNumber', cellFormat: 'text' },
      { key: 'Tags', column: 'tags', cellFormat: 'text' },
      { key: 'Selling Price', column: 'price', cellFormat: 'numeric' },
      { key: 'Sale Price', column: 'salePrice', cellFormat: 'numeric' },
      { key: 'Pre Order DP', column: 'preOrderDepositAmount', cellFormat: 'numeric' },
    ];

    const header = [
      { col: 'A2', value: title },
      { col: 'A3', value: 'Categories: ' + this.categories },
      { col: 'A4', value: 'Product Type: ' + this.productTypeDesc },
      { col: 'A5', value: 'Tags Filter: ' + this.tagFilterDesc },
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 7);
  }

  getProductTypeDesc() {
    const ptype = this.filterSetting.productType;
    if (ptype == 0) {
      return 'All'
    }
    return this.productType.filter(x => x.id == ptype)[0].description;
  }
  getProductTagsDesc() {
    const ptype = this.filterSetting.tag;
    if (ptype == 'all') {
      return 'All'
    }
    return this.tagsFilter.filter(x => x.id == ptype)[0].description;
  }


}
