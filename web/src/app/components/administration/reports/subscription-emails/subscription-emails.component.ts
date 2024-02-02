import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserSubscriptions } from 'src/app/classes/user-subscriptions';
import { ExportToExcelService } from 'src/app/services/export-excel.servicel';
import { ReportService } from 'src/app/services/report.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-subscription-emails',
  templateUrl: './subscription-emails.component.html',
  styleUrls: ['./subscription-emails.component.scss']
})
export class SubscriptionEmailsComponent implements OnInit {
  reports: Array<UserSubscriptions>;
  isSortAsc: boolean;
  unsubsLink: string;

  constructor(public reportService: ReportService,
    public SpinnerService: NgxSpinnerService,
    public exportToExcelService: ExportToExcelService,
    public userService: UserService,
    public toasterService: ToasterService) {
    this.reports = new Array<UserSubscriptions>();
    this.isSortAsc = true;
    this.unsubsLink = environment.webUrl + '/unsubscribe-user';
  }

  ngOnInit() {
    this.SpinnerService.show();
    this.reportService.getUserSubscriptionReport().then((result: any) => {
      this.reports = result;
      this.SpinnerService.hide();
    });
  }

  sort() {
    this.isSortAsc = !this.isSortAsc;
    if (this.isSortAsc)
      this.reports.sort((a, b) => (a.dateCreated < b.dateCreated ? 1 : -1))
    else this.reports.sort((a, b) => (a.dateCreated < b.dateCreated ? -1 : 1))

  }

  export() {
    let title = 'Subscription Emails Report';
    let columns = [
      { key: 'Email', column: 'email', cellFormat: 'text' },
      { key: 'Date Subscribed', column: 'dateCreated', cellFormat: 'text' }
    ]

    let header = [
      { col: 'A2', value: title }
    ];
    this.exportToExcelService.exportExcelOrderMaster(this.reports, header, columns, title, 4)
  }

  unsubscribe(email, i) {
    this.userService.deleteUserSubscription(email).then((result) => {
      if (result) {
        this.toasterService.alert('success', 'Unsubscribe successfully.')
        this.reports.splice(i, 1);
      }
    })
  }

}
