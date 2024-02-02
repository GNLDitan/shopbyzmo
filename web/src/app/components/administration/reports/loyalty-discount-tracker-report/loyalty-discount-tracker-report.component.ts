import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { LoyaltyDiscount } from 'src/app/classes/loyalty-discount';
import { LoyaltyDiscountTrackerReport } from 'src/app/classes/loyalty-discount-tracker-report';
import { ExportToExcelService } from 'src/app/services/export-excel.servicel';
import { LoyaltyService } from 'src/app/services/loyalty.service';
import { ReportService } from 'src/app/services/report.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-loyalty-discount-tracker-report',
  templateUrl: './loyalty-discount-tracker-report.component.html',
  styleUrls: ['./loyalty-discount-tracker-report.component.scss']
})
export class LoyaltyDiscountTrackerReportComponent implements OnInit {

  public reports: Array<LoyaltyDiscountTrackerReport>;
  public qualifiedDiscount: number;
  public loyalDiscount: Array<LoyaltyDiscount>;
  constructor(public reportService: ReportService,
    public SpinnerService: NgxSpinnerService,
    public toasterService: ToasterService,
    public discountService: LoyaltyService,
    public exportToExcelService: ExportToExcelService) {
    this.reports = new Array<LoyaltyDiscountTrackerReport>();
    this.loyalDiscount = new Array<LoyaltyDiscount>();
    this.qualifiedDiscount = 0;
  }

  ngOnInit() {
    this.getLoyaltyDiscount();
    this.getLoyaltyDiscountTracker();
  }

  getLoyaltyDiscountTracker() {
    this.reportService.getLoyaltyDiscountTrackerReport(this.qualifiedDiscount).then((rest: any) => {
      this.reports = rest;
    });
  }
  getLoyaltyDiscount() {
    var filter = new FilterSetting();
    this.discountService.getLoyaltyDiscountListRange(filter).then((rest: any) => {
      this.loyalDiscount = rest;
      this.loyalDiscount.unshift({
        id: 0,
        tierLevel: 'all',
        rangeFrom: 0,
        rangeFromCurrencyType: 0,
        rangeTo: 0,
        rangeToCurrencyType: 0,
        discount: 0,
        discountAmountType: 0,
      })
    });
  }


  export() {
    let title = 'Loyalty Discount Tracker';
    let qd = this.loyalDiscount.filter(x => x.id == this.qualifiedDiscount);
    let desc = 'All';
    if (qd.length > 0)
      desc = qd[0].tierLevel;

    let columns = [
      { key: 'Customer Name', column: 'name', cellFormat: 'text' },
      { key: 'Email', column: 'email', cellFormat: 'text' },
      { key: 'Accumulated Purchase Amount', column: 'accumulatedPurchaseAmount', cellFormat: 'numeric' },
      { key: 'Qualified Discount', column: 'tierLevel', cellFormat: 'text' },
      { key: 'Discount Codes', column: 'loyaltyDiscountTracker', cellFormat: 'text' },
      { key: 'Availed', column: 'loyaltyDiscountTracker', cellFormat: 'text' },
      { key: 'Order No.', column: 'loyaltyDiscountTracker', cellFormat: 'text' },
    ]

    let header = [
      { col: 'A2', value: title },
      { col: 'A3', value: desc }
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 5)
  }



}


