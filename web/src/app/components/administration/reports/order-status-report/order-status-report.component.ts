import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from 'src/app/app.utils';
import { ReportService } from 'src/app/services/report.service';
import { Report } from 'src/app/classes/report';
import { ToasterService } from 'src/app/services/toaster.service';
import { PrintService } from 'src/app/services/print.service';
import { ExportToExcelService } from 'src/app/services/export-excel.servicel';
import * as moment from 'moment';

@Component({
  selector: 'app-order-status-report',
  templateUrl: './order-status-report.component.html',
  styleUrls: ['./order-status-report.component.scss']
})
export class OrderStatusReportComponent implements OnInit {

  public reports: Array<Report>;
  public totalOrder: number;
  public filterSetting: FilterSetting;
  public orderStatus: FilterSetting;
  public paymentStatus: string;
  public paymentMethod: string;
  public reportType: number;
  statusFilter: any;
  fileName = 'ExcelSheet.xlsx';

  constructor(private orderService: OrderService,
              private SpinnerService: NgxSpinnerService,
              private reportService: ReportService,
              private toasterService: ToasterService,
              private printService: PrintService,
              private exportToExcelService: ExportToExcelService) {
    this.reports = new Array<Report>();
    this.filterSetting = new FilterSetting();
    this.statusFilter = Utils.ORDER_STATUS;
    this.reportType = Utils.ORDER_STATUS_REPORT;
  }

  ngOnInit() {
  }

  getOrder() {
    this.SpinnerService.show();
    this.reportService.getOrderReport(this.filterSetting, Utils.ORDER_STATUS_REPORT).then((reports: any) => {
      this.reports = reports;
      this.totalOrder = this.reports.reduce(function(a, b) {
        return a + b.total;
      }, 0);
      this.SpinnerService.hide();
    }).catch((ex) => {
      this.toasterService.alert('error', ex.statusText);
    });
  }

  search(event) {
    this.filterSetting = event;
    this.orderStatus = this.statusFilter.filter(x => x.id == this.filterSetting.statusId)[0].description;
    this.getOrder();
  }

  print() {
    this.printService.printOrderStatusReport(this.reports, this.filterSetting);
  }

  descriptionStatus(code) {
    const status = this.statusFilter.filter(x => x.id == code);
    if (status.length > 0) {
      return status[0].description;
    }
    else { return ''; }
  }

  export() {
    const title = 'Order Status Report';
    const desc = this.descriptionStatus(this.filterSetting.statusId);
    const columns = [
      { key: 'Order Date', column: 'orderDate', cellFormat: 'text' },
      { key: 'Order Number', column: 'orderId', cellFormat: 'text' },
      { key: 'Customer Name', column: 'completeName', cellFormat: 'text' },
      { key: 'Email', column: 'email', cellFormat: 'text' },
      { key: 'Items In Order', column: 'products', cellFormat: 'text' },
      { key: 'Email Status', column: 'isSendEmail', cellFormat: 'text' },
      { key: 'Order Amount', column: 'total', cellFormat: 'numeric' },
      { key: 'Order Status', column: 'statusId', cellFormat: 'text' },
      { key: 'Payment Status', column: 'paymentStatus', cellFormat: 'text' }
    ];

    const header = [
      { col: 'A2', value: title },
      { col: 'A3', value: 'Order Status: ' + this.orderStatus },
      { col: 'A4', value: moment(this.filterSetting.startDate).format('MM/DD/YYYY') + ' to ' + moment(this.filterSetting.endDate).format('MM/DD/YYYY') }
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 6, this.totalOrder);
  }
}
