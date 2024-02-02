import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { reverse } from 'dns';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/app.utils';
import { GCashPayment } from 'src/app/classes/gcash-payment';
import { Order } from 'src/app/classes/order';
import { PaymentDetails } from 'src/app/classes/payment-details';
import { PaymentResource } from 'src/app/classes/paymongo';
import { PayPalPayment } from 'src/app/classes/paypal-payment';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { PaymentService } from 'src/app/services/payment.service';
import { PaymongoService } from 'src/app/services/paymongo.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-credit-card-success',
  templateUrl: './credit-card-success.component.html',
  styleUrls: ['./credit-card-success.component.scss']
})
export class CreditCardSuccessComponent implements OnInit {

  subscription: Subscription;
  order: Order;
  resource: PaymentResource;
  amountPay: number;
  paymentType: string;
  paymentTypeList: any;
  refid: number;
  sourceId: string;
  paymentId: string;
  gcashPayment: GCashPayment;

  constructor(public dataService: DataService,
    public route: ActivatedRoute,
    public navigationService: NavigationService,
    public paymentService: PaymentService,
    public toasterService: ToasterService) {
    this.subscription = new Subscription();
    this.order = new Order();
    this.resource = new PaymentResource();
    this.gcashPayment = new GCashPayment();
  }

  ngOnInit() {
    this.paymentTypeList = Utils.PAYMENT_TYPE;
    this.sourceId = localStorage.getItem(Utils.LS_PMSOURCERESOURCE);
    this.route.queryParams.subscribe(params => {
      this.paymentType = params.type;
      this.refid = params.refid;
      this.dataService.selectedOrder$.subscribe((order) => {
        if (order.hasOwnProperty('id')) {
          this.order = order;
        }
      });
    })
  }
}
