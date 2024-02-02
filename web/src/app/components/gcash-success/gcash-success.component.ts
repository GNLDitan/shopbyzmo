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
  selector: 'app-gcash-success',
  templateUrl: './gcash-success.component.html',
  styleUrls: ['./gcash-success.component.scss']
})
export class GcashSuccessComponent implements OnInit {

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

  constructor(private paymongoService: PaymongoService,
    public dataService: DataService,
    public route: ActivatedRoute,
    public navigationService: NavigationService,
    public paymentService: PaymentService,
    public toasterService: ToasterService,
    private SpinnerService: NgxSpinnerService) {
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
          this.getSourcerResources()
        }
      });
    })
  }

  getSourcerResources() {
    this.paymongoService.getSourcerResourcesById(this.sourceId).then((result: any) => {
      this.paymentService.updateStatusSource(this.sourceId, 2);
      var amount = result.data.attributes.amount.toString();
      this.resource = result.data;
      amount = amount.slice(0, -2);
      this.amountPay = parseFloat(amount);
      //** If the customer authorize the payment then the status should be chargable **//
      // if (result.data.attributes.status === 'chargeable') {

      //   let description = `Payment for Order#${this.order.id}`;
      //   result.data.attributes.description = description;
      //   this.paymongoService.creatPayment(result.data).then((payment: any) => {
      //     this.paymentId = payment.data.id;
      //     this.completeOrder();
      //     this.updateSoureResources();
      //     console.log(payment);
      //   });
      // } else if (result.data.attributes.status !== 'paid') {

      // }
      // this.updateSoureResources();
    });

  }


  completeOrder() {
    const paymentDetails = new PaymentDetails();
    paymentDetails.paypalPayment = new PayPalPayment();
    paymentDetails.orderId = this.order.id;
    paymentDetails.paymentMethod = this.paymentType;
    paymentDetails.layawayId = this.paymentType == Utils.PAYMENT_TYPE.layaway ? this.refid : 0;
    paymentDetails.amountPaid = this.amountPay;
    paymentDetails.preOrderId = this.paymentType == Utils.PAYMENT_TYPE.preOrder ? this.refid : 0;
    paymentDetails.pmSourceResourceId = this.sourceId;
    paymentDetails.pmPaymentId = this.paymentId;
    paymentDetails.pmPaymentId = this.paymentId;
    paymentDetails.isTotal = false;


    // * Post Payment to database * //
    if (this.paymentType == this.paymentTypeList.order) {
      this.paymentService.completePayment(paymentDetails).then((result) => {
        this.SpinnerService.hide();
        this.navigationService.toOrderComplete(this.order.id);
      }).catch(() => {
        this.SpinnerService.hide();
        this.toasterService.alert('error', 'Error while processing your payment. Please try again later');
      });
    } else if (this.paymentType == this.paymentTypeList.preOrder) {
      this.paymentService.paymentPreOrderSchedule(paymentDetails).then(() => {
        this.SpinnerService.hide();
        this.navigationService.toPaymentComplete(this.order.id);
      }).catch(() => {
        this.SpinnerService.hide();
        this.toasterService.alert('error', 'Error while processing your payment. Please try again later');
      });
    } else {
      this.paymentService.paymentLayawaySchedule(paymentDetails).then(() => {
        this.SpinnerService.hide();
        this.navigationService.toPaymentComplete(this.order.id);
      }).catch(() => {
        this.SpinnerService.hide();
        this.toasterService.alert('error', 'Error while processing your payment. Please try again later');
      });
    }
  }

  updateSoureResources() {
    this.gcashPayment.orderId = this.order.id
    this.gcashPayment.paymentType = this.paymentType;
    this.gcashPayment.refId = this.refid;
    this.gcashPayment.sourceId = this.sourceId;
    this.gcashPayment.paymentId = this.paymentId;
    this.paymentService.createGCashPayment(this.gcashPayment);
  }
}
