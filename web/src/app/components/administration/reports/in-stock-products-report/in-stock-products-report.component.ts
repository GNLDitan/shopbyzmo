import { Component, OnInit } from '@angular/core';
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
  selector: 'app-in-stock-products-report',
  templateUrl: './in-stock-products-report.component.html',
  styleUrls: ['./in-stock-products-report.component.scss']
})
export class InStockProductsReportComponent implements OnInit {
  filterSetting: FilterSetting;
  reports: Array<ReportProducts>;
  reportType: number;
  categories: string;
  allCategory: any;
  categorySubscription: Subscription;
  productType: any;
  productTypeDesc: string;
  stocksDesc: string;
  stocksFilter: any;
  constructor(private SpinnerService: NgxSpinnerService,
    private reportService: ReportService,
    private toasterService: ToasterService,
    private dataService: DataService,
    private categoryService: CategoryService,
    private printService: PrintService,
    public exportToExcelService: ExportToExcelService) {
    this.filterSetting = new FilterSetting();
    this.reports = new Array();
    this.reportType = Utils.STOCK_PRODUCTS_REPORT;
    this.categorySubscription = new Subscription();
    this.allCategory = [];
    this.productType = [];
    Object.assign(this.productType, Utils.REPORT_PRODUCT_TYPE);
    this.stocksFilter = []
    Object.assign(this.stocksFilter, Utils.REPORT_STOCKS_FILTER);
  }

  ngOnInit() {
    this.categorySubscription = this.dataService.selectedCategory$.subscribe((category: any) => {
      this.allCategory = category;
    })
  }

  search(event: any) {
    this.filterSetting = event;
    this.categories = '';
    if (this.filterSetting.category.length > 0) {
      if (this.allCategory.length > 0) {
        var categories = this.allCategory.filter((x: any) => this.filterSetting.category.indexOf(x.code) >= 0);
        this.categories = categories.map((x: any) => x.category).join(' - ').toString();
      }
    }
    this.productTypeDesc = this.getProductTypeDesc();
    this.stocksDesc = this.getStocksDesc();
    this.setFilter();
    this.getProductReport();
  }

  getProductReport() {
    this.filterSetting.limit = 1000;
    this.SpinnerService.show();
    this.reportService.getProductsReport(this.filterSetting, Utils.STOCK_PRODUCTS_REPORT).then((reports: any) => {
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
    this.printService.printStockProductReport(this.reports, this.filterSetting);
  }

  export() {
    let title = 'Stock Products Report';
    let columns = [
      { key: 'Product Name', column: 'productName', cellFormat: 'text' },
      { key: 'Notification', column: 'notif', cellFormat: 'text' },
      { key: 'Item Number', column: 'itemNumber', cellFormat: 'text' },
      { key: 'Balance', column: 'remainingQuantity', cellFormat: 'text' },
    ]

    let header = [
      { col: 'A2', value: title },
      { col: 'A3', value: 'Categories: ' + this.categories },
      { col: 'A4', value: 'Product Type: ' + this.productTypeDesc },
      { col: 'A5', value: 'Stocks: ' + this.stocksDesc }
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 7)
  }

  getProductTypeDesc() {
    let ptype = this.filterSetting.productType;
    if (ptype == 0)
      return 'All'
    return this.productType.filter(x => x.id == ptype)[0].description;
  }


  getStocksDesc() {
    let ptype = this.filterSetting.stockFilter;
    return this.stocksFilter.filter(x => x.id == ptype)[0].description;
  }


}
