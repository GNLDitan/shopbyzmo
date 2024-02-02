import { Component, OnInit, Output, EventEmitter, Input, SimpleChange } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/app.utils';
import { DatePipe } from '@angular/common';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { PaymentMethod } from 'src/app/classes/payment-method';
import { PaymentService } from 'src/app/services/payment.service';
import { ShippingService } from 'src/app/services/shipping.service';
import { Shipping } from 'src/app/classes/shipping';
import { PrintService } from 'src/app/services/print.service';

@Component({
  selector: 'app-report-filter',
  templateUrl: './report-filter.component.html',
  styleUrls: ['./report-filter.component.scss']
})
export class ReportFilterComponent implements OnInit {
  @Output() filterSettings = new EventEmitter<FilterSetting>();
  @Output() outputPrint = new EventEmitter<FilterSetting>();
  @Output() outputExport = new EventEmitter();
  @Input() inputReportType: string;

  public searchForm: any;
  public statusFilter: any;
  public paymentStatus: any;
  public reportType: number;
  public paymentMethod: Array<PaymentMethod>;
  public shippingMethod: Array<Shipping>;
  public accessFilter: [];
  public allTags: any;

  constructor(private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private paymentService: PaymentService,
              private shippingService: ShippingService,
              private printService: PrintService) {
    this.statusFilter = Utils.ORDER_STATUS;
    this.paymentStatus = [];
    Object.assign(this.paymentStatus, Utils.PAYMENT_STATUS);
    this.paymentStatus.unshift({
      id: 0,
      description: 'All'
    });
    this.allTags = [{
      name: 'all'
      }, {
        name: 'layaway'
      }, {
        name: 'on sale'
      }, {
        name: 'pre order'
      }, {
        name: 'pre order layaway'
      }];
  }

  ngOnInit() {
    const currentDate = new Date();
    this.searchForm = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      statusId: [0],
      paymentStatusId: [0],
      paymentMethodId: [0],
      shippingMethodId: [0],
      tag: ['all'],
      isRushFee: [false]
    });

    this.searchForm.controls.startDate.setValue(this.datePipe.transform(currentDate, 'MM-dd-yyyy'));
    this.searchForm.controls.endDate.setValue(this.datePipe.transform(currentDate, 'MM-dd-yyyy'));
    this.search();
    this.getPaymentStatus();
    this.getShippingDetails();
  }


  // tslint:disable-next-line:use-lifecycle-interface
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    const parent = this;
    if (changes.hasOwnProperty('inputReportType')) {
      this.reportType = changes.inputReportType.currentValue;
    }
  }

  search() {
    const filterSettings = this.initializeFilter();
    this.filterSettings.emit(filterSettings);

  }

  getPaymentStatus() {
    const filterSettings = new FilterSetting();
    filterSettings.limit = 9999;
    this.paymentService.getPaymentMethodListRange(filterSettings).then((paymentMethod: any) => {
      const paymenthod = new PaymentMethod();
      this.paymentMethod = paymentMethod;
      paymenthod.id = 0;
      paymenthod.name = 'All';
      this.paymentMethod.unshift(paymenthod);
    });
  }


  getShippingDetails() {
    const filterSettings = new FilterSetting();
    filterSettings.limit = 9999;
    this.shippingService.getShippingListRange(filterSettings).then((result: any) => {
      this.shippingMethod = result;
      const shippingMethod = new Shipping();
      shippingMethod.id = 0;
      shippingMethod.shippingName = 'All';
      this.shippingMethod.unshift(shippingMethod);
    });
  }

  print() {
    const filterSettings = this.initializeFilter();
    this.outputPrint.emit(filterSettings);
  }

  initializeFilter() {
    const filterSettings = new FilterSetting();
    // filterSettings.startDate = new Date('10/17/2020');
    filterSettings.startDate = this.searchForm.controls.startDate.value;
    filterSettings.endDate = this.searchForm.controls.endDate.value;
    filterSettings.statusId = this.searchForm.controls.statusId.value;
    filterSettings.paymentStatusId = this.searchForm.controls.paymentStatusId.value;
    filterSettings.paymentMethodId = this.searchForm.controls.paymentMethodId.value;
    filterSettings.shippingMethodId = this.searchForm.controls.shippingMethodId.value;
    filterSettings.tag = this.searchForm.controls.tag.value;
    filterSettings.isRushFee = this.searchForm.controls.isRushFee.value;
    filterSettings.offset = 0;
    return filterSettings;
  }
  export() {
    this.outputExport.emit();
  }

  get isShowRushFee() {
    const tag = this.searchForm.controls.tag.value;
    const isavailable = ['pre order'].indexOf(tag) > -1;
    return isavailable;
  }
}
