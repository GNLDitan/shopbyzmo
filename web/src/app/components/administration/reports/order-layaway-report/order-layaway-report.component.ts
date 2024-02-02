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
  selector: 'app-order-layaway-report',
  templateUrl: './order-layaway-report.component.html',
  styleUrls: ['./order-layaway-report.component.scss']
})
export class OrderLayawayReportComponent implements OnInit {

  public reports: Array<Report>;
  public totalOrder: number;
  public filterSetting: FilterSetting;
  public reportType: number;
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
    this.reportType = Utils.ORDER_WITH_LAYAWAY_REPORT;
  }

  getSalesReport() {

  }
  search(event) {
    this.filterSetting = event;
    this.getOrderReport();
  }


  getOrderReport() {
    this.SpinnerService.show();
    this.reportService.getOrderReport(this.filterSetting, Utils.ORDER_WITH_LAYAWAY_REPORT).then((reports: any) => {
      this.reports = reports;
      this.reports.map(x => {
        if (!this.isValid(x.shippingDate)) {
          x.shippingDate = null;
        }

        if (!this.isValid(x.dueDate)) {
          x.dueDate = null;
        }
      });
      this.totalOrder = this.reports.reduce(function (a, b) {
        return a + b.total;
      }, 0);
      this.SpinnerService.hide();
    }).catch((ex) => {
      this.toasterService.alert('error', ex.statusText);
    });
  }

  isValid(d) {
    const timestamp = Date.parse(d);

    if (isNaN(timestamp) == false) {
      if (timestamp > 0) {
        return true;
      } else { false; }
    } else { false; }
  }

  print() {
    this.printService.printOrdersWithLayawayReport(this.reports, this.filterSetting);
  }
  descriptionStatus(code) {
    const status = this.statusFilter.filter(x => x.id == code);
    if (status.length > 0) {
      return status[0].description;
    } else { return ''; }
  }

  export() {
    const title = 'Orders with Layaway Payment';
    const columns = [
      { key: 'Order Date', column: 'orderDate', cellFormat: 'text' },
      { key: 'Order Number', column: 'orderId', cellFormat: 'text' },
      { key: 'Customer Name', column: 'completeName', cellFormat: 'text' },
      { key: 'Email', column: 'email', cellFormat: 'text' },
      { key: 'Order Amount', column: 'total', cellFormat: 'numeric' },
      { key: 'Balance', column: 'balance', cellFormat: 'numeric' },
      { key: 'Order Status', column: 'statusId', cellFormat: 'text' },
      { key: 'Due Date', column: 'dueDate', cellFormat: 'numeric' },
    ];

    const header = [
      { col: 'A2', value: title },
      { col: 'A3', value: moment(this.filterSetting.startDate).format('MM/DD/YYYY') + ' to ' + moment(this.filterSetting.endDate).format('MM/DD/YYYY') }
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 5, this.totalOrder);
  }
}
