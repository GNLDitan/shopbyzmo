import { Component, OnInit } from '@angular/core';
import { ReportCustomer } from 'src/app/classes/report-customer';
import { ExportToExcelService } from 'src/app/services/export-excel.servicel';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-customer-list-report',
  templateUrl: './customer-list-report.component.html',
  styleUrls: ['./customer-list-report.component.scss']
})
export class CustomerListReportComponent implements OnInit {
  public reports: Array<ReportCustomer>;
  public sorts: any;
  public selectedSort: string;
  constructor(public reportService: ReportService,
    public exportToExcelService: ExportToExcelService) {
    this.reports = new Array<ReportCustomer>();
    this.selectedSort = 'Highest to Lowest';
    this.sorts = ['Highest to Lowest', 'Lowest to Highest']
  }

  ngOnInit() {
    this.getCustomerListReport()
  }

  getCustomerListReport() {
    this.reportService.getCustomerListReport(this.selectedSort).then((reports: any) => {
      this.reports = reports;
    })
  }

  export() {
    let title = 'Customer List Report';

    let columns = [
      { key: 'Customer Name', column: 'name', cellFormat: 'text' },
      { key: 'Email', column: 'email', cellFormat: 'text' },
      { key: 'Phone Number', column: 'mobileNumber', cellFormat: 'numeric' },
      { key: 'Date Registered', column: 'dateCreated', cellFormat: 'text' },
      { key: 'No. of Fulfilled Orders', column: 'noFulfilled', cellFormat: 'text' }
    ]
    let header = [
      { col: 'A2', value: title },
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 4)
  }

}
