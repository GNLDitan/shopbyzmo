import { Component, OnInit } from '@angular/core';
import { Report } from 'src/app/classes/report';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { Utils } from 'src/app/app.utils';
import { PaymentService } from 'src/app/services/payment.service';
import { ReportService } from 'src/app/services/report.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToasterService } from 'src/app/services/toaster.service';
import { PrintService } from 'src/app/services/print.service';
import { ExportToExcelService } from 'src/app/services/export-excel.servicel';
import * as moment from 'moment';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {
  public reports: Array<Report>;
  public totalOrder: number;
  public filterSetting: FilterSetting;
  public orderStatus: string;
  public reportType: number;
  public paymentStatus: string;
  public paymentMethod: string;
  statusFilter: any;
  paymentStatusFilter: any;
  constructor(private paymentService: PaymentService,
              private reportService: ReportService,
              private SpinnerService: NgxSpinnerService,
              private toasterService: ToasterService,
              private printService: PrintService,
              private exportToExcelService: ExportToExcelService) {
    this.reports = new Array<Report>();
    this.filterSetting = new FilterSetting();
    this.statusFilter = Utils.ORDER_STATUS;
    this.paymentStatusFilter = Utils.PAYMENT_STATUS;

  }

  ngOnInit() {
    this.reportType = Utils.SALES_REPORT;
  }

  getSalesReport() {

  }
  search(event) {
    this.filterSetting = event;
    this.orderStatus = this.statusFilter.filter(x => x.id === this.filterSetting.statusId)[0].description;
    if (this.filterSetting.paymentStatusId > 0) {
      this.paymentStatus = this.paymentStatusFilter.filter(x => x.id === this.filterSetting.paymentStatusId)[0].description;
    } else { this.paymentStatus = 'All'; }

    if (this.filterSetting.paymentMethodId > 0) {
      this.getPaymentStatus();
    } else { this.paymentMethod = 'All'; }

    this.getOrderReport();
  }

  getPaymentStatus() {
    this.paymentService.getPaymentMethodById(this.filterSetting.paymentMethodId).then((paymentMethod: any) => {
      this.paymentMethod = paymentMethod.name;
    });
  }

  getOrderReport() {
    this.SpinnerService.show();
    this.reportService.getOrderReport(this.filterSetting, Utils.SALES_REPORT).then((reports: any) => {
      this.reports = reports;
      this.totalOrder = this.reports.reduce(function(a, b) {
        return a + b.total;
      }, 0);
      this.SpinnerService.hide();
    }).catch((ex) => {
      this.toasterService.alert('error', ex.statusText);
    });
  }
  print() {
    this.printService.printSalesReport(this.reports, this.filterSetting, this.paymentMethod);
  }
  descriptionStatus(code) {
    const status = this.statusFilter.filter(x => x.id === code);
    if (status.length > 0) {
      return status[0].description;
    } else { return ''; }
  }

  export() {
    const title = 'Sales Report';
    const desc = this.descriptionStatus(this.filterSetting.statusId);
    const columns = [
      { key: 'Order Date', column: 'orderDate', cellFormat: 'text' },
      { key: 'Order Number', column: 'orderId', cellFormat: 'text' },
      { key: 'Customer Name', column: 'completeName', cellFormat: 'text' },
      { key: 'Email', column: 'email', cellFormat: 'text' },
      { key: 'Items In Order', column: 'products', cellFormat: 'text' },
      { key: 'Order Amount', column: 'total', cellFormat: 'numeric' },
      { key: 'Balance', column: 'balance', cellFormat: 'numeric' },
      { key: 'Order Status', column: 'statusId', cellFormat: 'text' },
    ];


    const header = [
      { col: 'A2', value: title },
      { col: 'A3', value: this.paymentStatus + ' - ' + this.orderStatus },
      { col: 'A4', value: moment(this.filterSetting.startDate).format('MM/DD/YYYY') + ' to ' + moment(this.filterSetting.endDate).format('MM/DD/YYYY') },
      { col: 'A5', value: 'Payment Method: ' + this.paymentMethod },
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 7, this.totalOrder);
  }
}
