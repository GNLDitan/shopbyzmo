import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from 'src/app/app.utils';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { Report } from 'src/app/classes/report';
import { ExportToExcelService } from 'src/app/services/export-excel.servicel';
import { PrintService } from 'src/app/services/print.service';
import { ReportService } from 'src/app/services/report.service';
import { ToasterService } from 'src/app/services/toaster.service';
import * as moment from 'moment';

@Component({
  selector: 'app-order-preorder-report',
  templateUrl: './order-preorder-report.component.html',
  styleUrls: ['./order-preorder-report.component.scss']
})
export class OrderPreorderReportComponent implements OnInit {

  public reports: Array<Report>;
  public totalOrder: number;
  public filterSetting: FilterSetting;
  public reportType: number;
  public orderStatus: string;
  statusFilter: any;
  constructor(public reportService: ReportService,
              public SpinnerService: NgxSpinnerService,
              public toasterService: ToasterService,
              public printService: PrintService,
              public exportToExcelService: ExportToExcelService) {
    this.reports = new Array<Report>();
    this.filterSetting = new FilterSetting();
    this.statusFilter = Utils.ORDER_STATUS;
  }

  ngOnInit() {
    this.reportType = Utils.ORDER_WITH_PREORDER_REPORT;
  }

  getSalesReport() {

  }
  search(event) {
    this.filterSetting = event;
    this.orderStatus = this.statusFilter.filter(x => x.id == this.filterSetting.statusId)[0].description;
    this.getOrderReport();
  }


  getOrderReport() {
    this.SpinnerService.show();
    this.reportService.getOrderReport(this.filterSetting, Utils.ORDER_WITH_PREORDER_REPORT).then((reports: any) => {
      this.reports = reports;
      this.totalOrder = this.reports.reduce(function(a, b) {
        return a + b.total;
      }, 0);
      this.SpinnerService.hide();
    }).catch((ex) => {
      this.toasterService.alert('error', ex.statusText);
    });
  }
  descriptionStatus(code) {
    const status = this.statusFilter.filter(x => x.id == code);
    if (status.length > 0) {
      return status[0].description;
    } else { return ''; }
  }

  print() {
    this.printService.printOrdersWithPreOrderReport(this.reports, this.filterSetting);
  }

  export() {
    const title = 'Orders with Pre Order';
    const desc = this.descriptionStatus(this.filterSetting.statusId);
    const columns = [
      { key: 'Order Date', column: 'orderDate', cellFormat: 'text' },
      { key: 'Order Number', column: 'orderId', cellFormat: 'text' },
      { key: 'Customer Name', column: 'completeName', cellFormat: 'text' },
      { key: 'Email', column: 'email', cellFormat: 'text' },
      { key: 'Order Amount', column: 'total', cellFormat: 'numeric' },
      { key: 'Balance Amount', column: 'balance', cellFormat: 'numeric' },
      { key: 'Rush fee', column: 'hasRushFee', cellFormat: 'text' },
      { key: 'Order Status', column: 'statusId', cellFormat: 'text' }
    ];

    const header = [
      { col: 'A2', value: title },
      { col: 'A3', value: 'Order Status: ' + this.orderStatus },
      { col: 'A4', value: moment(this.filterSetting.startDate).format('MM/DD/YYYY') + ' to ' + moment(this.filterSetting.endDate).format('MM/DD/YYYY') }
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 6, this.totalOrder);
  }


}
