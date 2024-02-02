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
  selector: 'app-product-price-report',
  templateUrl: './product-price-report.component.html',
  styleUrls: ['./product-price-report.component.scss']
})
export class ProductPriceReportComponent implements OnInit, OnDestroy {

  filterSetting: FilterSetting;
  reports: Array<ReportProducts>;
  reportType: number;
  categories: string;
  allCategory: any;
  productType: any;
  categorySubscription: Subscription;
  productTypeDesc: string;
  public tagFilterDesc: string;
  constructor(private SpinnerService: NgxSpinnerService,
    private reportService: ReportService,
    private toasterService: ToasterService,
    private dataService: DataService,
    private categoryService: CategoryService,
    private printService: PrintService,
    private exportToExcelService: ExportToExcelService) {
    this.filterSetting = new FilterSetting();
    this.reports = new Array();
    this.reportType = Utils.PRODUCT_PRICE_LIST_REPORT
    this.categorySubscription = new Subscription();
    this.allCategory = [];
    this.productType = [];
    Object.assign(this.productType, Utils.REPORT_PRODUCT_TYPE);
  }

  ngOnInit() {
    this.categorySubscription = this.dataService.selectedCategory$.subscribe((category: any) => {
      this.allCategory = category;
    })
  }

  ngOnDestroy() {
    this.categorySubscription.unsubscribe();
  }

  search(event: any) {
    this.filterSetting = event;
    this.categories = 'ALL';
    if (this.filterSetting.category.length > 0) {
      if (this.allCategory.length > 0) {
        var categories = this.allCategory.filter((x: any) => this.filterSetting.category.indexOf(x.code) >= 0);
        this.categories = categories.map((x: any) => x.category).join(' - ').toString();
      }
    }
    this.productTypeDesc = this.getProductTypeDesc();
    this.setFilter();
    this.getProductReport();
  }

  getProductReport() {
    this.SpinnerService.show();
    this.reportService.getProductsReport(this.filterSetting, Utils.PRODUCT_PRICE_LIST_REPORT).then((reports: any) => {
      this.reports = reports;
      this.SpinnerService.hide();
    }).catch((ex) => {
      this.toasterService.alert('error', ex.statusText)
    });
  }

  setFilter() {
    if (this.filterSetting.category.length > 0) {
      let category = this.filterSetting.category;
      let hierarch = []
      category.forEach((code) => {
        let subs = this.categoryService.getAllSubCategories(code)
        let filterDetails = this.allCategory.filter(x => x.code == code);
        const found = subs.some(r => filterDetails.filter(x => x.code != code).indexOf(r) >= 0)

        if (!found) {
          hierarch.push(code)
          subs.map(x => {
            hierarch.push(x.code)
          });
        }
      })

      this.filterSetting.category = hierarch;
    }
  }

  print() {
    this.printService.printProductPriceListReport(this.reports, this.filterSetting);
  }

  export() {
    let title = 'Product Price List';
    let columns = [
      { key: 'Product Name', column: 'productName', cellFormat: 'text' },
      { key: 'Item Number', column: 'itemNumber', cellFormat: 'text' },
      { key: 'Selling Price', column: 'price', cellFormat: 'numeric' },
      { key: 'Cost Price', column: 'costPrice', cellFormat: 'numeric' },
      { key: 'Sale Price', column: 'salePrice', cellFormat: 'numeric' },
      { key: 'Pre Order DP', column: 'preOrderDepositAmount', cellFormat: 'numeric' },
      { key: 'Rush Fee', column: 'rushFee', cellFormat: 'numeric' },
      { key: 'Stock Balance', column: 'remainingQuantity', cellFormat: 'numeric' }
    ]

    let header = [
      { col: 'A2', value: title },
      { col: 'A3', value: 'Categories: ' + this.categories },
      { col: 'A4', value: 'Product Type: ' + this.productTypeDesc },
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 6)
  }


  getProductTypeDesc() {
    let ptype = this.filterSetting.productType;
    if (ptype == 0)
      return 'All'
    return this.productType.filter(x => x.id == this.filterSetting.productType)[0].description;
  }

}
