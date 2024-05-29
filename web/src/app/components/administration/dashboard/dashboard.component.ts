import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
// import * as Chart from 'chart.js'
import { Dashboard } from 'src/app/classes/dashboard';
import { DashboardService } from 'src/app/services/dashboard.service';
import * as moment from 'moment';
import { Blog } from 'src/app/classes/blog';
import { NavigationService } from 'src/app/services/navigation.service';
import { Utils } from 'src/app/app.utils';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('myChartjs', { static: false }) mychart;
  monthNames = ["jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec"
  ];

  canvas: any;
  ctx: any;

  linecanvas: any;
  linectx: any;

  dashboard: Dashboard;
  chartData: any = [];
  orderCount: any = [];

  constructor(public dashboardService: DashboardService,
    public navigationService: NavigationService,
    public SpinnerService: NgxSpinnerService,) {
    this.dashboard = new Dashboard();

  }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.getData();
  }

  getData() {
    this.dashboardService.getDelayedPayment().then((data: number) => {
      this.dashboard.delayedPayment = data;
    })
    this.dashboardService.getMonthNewOrder().then((data: number) => {
      this.dashboard.orderCount = data;
    })
    this.dashboardService.getOutOfStock().then((data: number) => {
      this.dashboard.outOfStock = data;
    })
    this.dashboardService.getUserSubscription().then((data: number) => {
      this.dashboard.userSubscribed = data;
    })

    this.dashboardService.getBlogNotification().then((data: any) => {
      this.dashboard.recentBlogComment = data;
    })

    this.dashboardService.getMostOrderedProduct().then((data: any) => {
      this.dashboard.mostProduct = data;
    })


    this.dashboardService.getMostLoyaltyUser().then((data: any) => {
      this.dashboard.mostLoyaltyUser = data;
    })
    this.SpinnerService.show();
    this.dashboardService.getOrderStatus().then((data: any) => {
      this.dashboard.orders = data;
      this.orderStatus();
      this.SpinnerService.hide();
    })
    this.dashboardService.getOrdersCount().then((data: any) => {
      var record = data;
      this.chartData = [];
      this.orderCount = record;
      for (let r = 0; r < record.length; r++) {
        var rcd = record[r];
        this.chartData.push({
          x: r,
          y: rcd.cnt
        })
      }

      this.chartData.push({
        x: this.chartData.length,
        y: 0
      })
      this.chart();
    })

  }

  goToBlog(param) {
    let blog = new Blog();
    blog.id = param.id;
    blog.title = param.title;
    this.navigationService.toBlogContent(blog);
  }

  orderStatus() {
    let parent = this;
    this.canvas = document.getElementById('myChart');
    this.ctx = this.canvas.getContext('2d');

    // let myChart = new Chart(this.ctx, {
    //   type: 'pie',
    //   data: {
    //     labels: ["Unfilfilled", "Processing", "Shipped", "fullfield", "cancelled"],
    //     datasets: [{
    //       label: '# of status',
    //       data: [
    //         parent.dashboard.orders.unfulfilled,
    //         parent.dashboard.orders.processing,
    //         parent.dashboard.orders.shipped,
    //         parent.dashboard.orders.fulfilled,
    //         parent.dashboard.orders.cancelled
    //       ],
    //       backgroundColor: [
    //         'rgba(221,154,172, 0.8)',
    //         'rgba(54, 162, 235, 1)',
    //         'rgba(255, 206, 86, 1)',
    //         'rgb(51, 225, 51)',
    //         'rgb(220,53,69)'
    //       ],
    //       borderWidth: 1
    //     }]
    //   },
    //   options: {
    //     responsive: false,
    //     display: true
    //   }
    // });
  }


  chart() {
    let parent = this;
    this.linecanvas = this.mychart.nativeElement;
    this.linectx = this.linecanvas.getContext('2d');

    // let myChart = new Chart(this.linectx, {
    //   type: 'line',

    //   data: {
    //     datasets: [{
    //       label: 'Orders',
    //       backgroundColor: "rgba(255, 99, 132,0.4)",
    //       borderColor: "rgb(255, 99, 132)",
    //       fill: true,
    //       data: parent.chartData,
    //     }]
    //   },
    //   options: {
    //     responsive: true,
    //     title: {
    //       display: true,
    //       text: '2021'
    //     },
    //     scales: {
    //       xAxes: [{
    //         type: 'linear',
    //         position: 'bottom',
    //         ticks: {
    //           userCallback: function (tick) {
    //             if (Utils.isArrayNullOrUndefinedOrEmpty(parent.orderCount[tick]))
    //               return '';
    //             let dtl = parent.orderCount[Math.trunc(tick)];
    //             return '(' + dtl.yr + ') ' + dtl.mon;
    //           }
    //         },
    //         scaleLabel: {
    //           display: true,
    //         }
    //       }],
    //       yAxes: [{
    //         type: 'linear',
    //         ticks: {
    //           userCallback: function (tick) {
    //             return tick;
    //           }
    //         },
    //         scaleLabel: {
    //           display: true
    //         }
    //       }]
    //     }
    //   }
    // });
  }

  calcDate(date1) {
    var date2 = new Date() as any;
    date1 = new Date(date1);
    var diff = Math.floor(date1.getTime() - date2.getTime());
    var day = 1000 * 60 * 60 * 24;

    var minutes = Math.floor((diff / 1000) / 60);
    var hrs = Math.abs(date1 - date2) / 36e5;
    var days = Math.floor(diff / day);
    var months = Math.floor(days / 31);
    var years = Math.floor(months / 12);
    var message = date2.toDateString();

    if (Math.abs(years) > 1) {
      message = Math.abs(years) + " years ago."
    } else if (Math.abs(months) > 1) {
      message = Math.abs(months) + " months ago."
    } else if (Math.abs(days) > 1) {
      message = Math.abs(days) + " days ago."
    } else if (hrs > 1) {
      message = Math.round(hrs) + " hours ago."
    } else {
      message = Math.abs(minutes) + " minutes ago."
    }

    return message
  }

}
