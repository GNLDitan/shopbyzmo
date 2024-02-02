import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from 'src/app/app.utils';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { Report } from 'src/app/classes/report';
import { ReportService } from 'src/app/services/report.service';
import { ShippingService } from 'src/app/services/shipping.service';
import { ToasterService } from 'src/app/services/toaster.service';
import * as moment from 'moment';
import { PrintService } from 'src/app/services/print.service';
import { ExportToExcelService } from 'src/app/services/export-excel.servicel';
@Component({
  selector: 'app-shipped-order-report',
  templateUrl: './shipped-order-report.component.html',
  styleUrls: ['./shipped-order-report.component.scss']
})
export class ShippedOrderReportComponent implements OnInit {

  public reports: Array<Report>;
  public totalOrder: number;
  public filterSetting: FilterSetting;
  public orderStatus: string;
  public reportType: number;
  public shippingMethod: string;
  statusFilter: any;
  constructor(private shippingService: ShippingService,
              public reportService: ReportService,
              public SpinnerService: NgxSpinnerService,
              public toasterService: ToasterService,
              public printService: PrintService,
              public exportToExcelService: ExportToExcelService) {
    this.reports = new Array<Report>();
    this.filterSetting = new FilterSetting();
    this.statusFilter = Utils.ORDER_STATUS;

  }

  ngOnInit() {
    this.reportType = Utils.SHIPPED_ORDER_REPORT;
  }

  getSalesReport() {

  }
  search(event) {
    this.filterSetting = event;
    if (this.filterSetting.shippingMethodId > 0) {
      this.getPaymentStatus();
    } else { this.shippingMethod = 'All'; }

    this.getOrderReport();
  }

  getPaymentStatus() {
    this.shippingService.getShippingById(this.filterSetting.shippingMethodId).then((shippingMethod: any) => {
      this.shippingMethod = shippingMethod.shippingName;
    });
  }

  getOrderReport() {
    this.SpinnerService.show();
    this.reportService.getOrderReport(this.filterSetting, Utils.SHIPPED_ORDER_REPORT).then((reports: any) => {
      this.reports = reports;
      this.reports.map(x => {
        if (!this.isValid(x.shippingDate)) {
          x.shippingDate = null;
        }
      });
      this.totalOrder = this.reports.reduce(function(a, b) {
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

  descriptionStatus(code) {
    const status = this.statusFilter.filter(x => x.id == code);
    if (status.length > 0) {
      return status[0].description;
    } else { return ''; }
  }

  print() {
    this.printService.printShippingReport(this.reports, this.filterSetting);
  }

  export() {
    const title = 'Shipping Report';
    const desc = this.descriptionStatus(this.filterSetting.statusId);
    const columns = [
      { key: 'Order Date', column: 'orderDate', cellFormat: 'text' },
      { key: 'Order Number', column: 'orderId', cellFormat: 'text' },
      { key: 'Shipping Date', column: 'shippingDate', cellFormat: 'text' },
      { key: 'Customer Name', column: 'completeName', cellFormat: 'text' },
      { key: 'Email', column: 'email', cellFormat: 'text' },
      { key: 'Tracking No.', column: 'trackingNumber', cellFormat: 'text' },
      { key: 'Invoice No.', column: 'invoiceNumber', cellFormat: 'text' },
      { key: 'Order Amount', column: 'total', cellFormat: 'numeric' },
      { key: 'Balance Amount', column: 'balance', cellFormat: 'numeric' },
      { key: 'Order Status', column: 'statusId', cellFormat: 'text' },
    ];

    const header = [
      { col: 'A2', value: title },
      { col: 'A3', value: 'Shipping Method: ' + this.shippingMethod },
      { col: 'A4', value: moment(this.filterSetting.startDate).format('MM/DD/YYYY') + ' to ' + moment(this.filterSetting.endDate).format('MM/DD/YYYY') }
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 6, this.totalOrder);
  }


}
