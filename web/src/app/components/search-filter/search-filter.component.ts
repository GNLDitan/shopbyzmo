import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/app.utils';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { FilterService } from 'src/app/services/filter.service';
import { DataService } from 'src/app/services/data.service';
import { DatePipe } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {
  @Output() filterSettings = new EventEmitter<FilterSetting>();
  @Output() dateSelect = new EventEmitter<NgbDateStruct>();
  searchForm: FormGroup;
  searchInput: string;
  valuedate = new Date();
  statusFilter: any;
  filter: FilterSetting;
  selectedFilter: any;
  paymentStatus: any;
  allTags: any;

  constructor(private formBuilder: FormBuilder,
              private dataService: DataService,
              private datePipe: DatePipe) {

    this.searchForm = this.formBuilder.group({
      searchInput: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      withDateRange: [false],
      statusId: [0],
      tag: ['all'],
      paymentStatusId: [0],
      isRushFee: [false]
    });
    this.searchInput = '';
    this.statusFilter = Utils.ORDER_STATUS;
    this.filter = new FilterSetting();
    this.paymentStatus = [];
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

    Object.assign(this.paymentStatus, Utils.PAYMENT_STATUS);
    this.paymentStatus.unshift({
      id: 0,
      description: 'All'
    });
    this.selectedFilter = this.dataService.selectedFilter$.subscribe((filter) => {
      filter.limit = 9999999;
      this.searchForm.patchValue(filter);
      if (Utils.isNullOrUndefined(filter.startDate)) {
        this.searchForm.controls.startDate.setValue(this.datePipe.transform(this.valuedate, 'MM-dd-yyyy'));
      }

      if (Utils.isNullOrUndefined(filter.endDate)) {
        this.searchForm.controls.endDate.setValue(this.datePipe.transform(this.valuedate, 'MM-dd-yyyy'));
      }
      if (Utils.isStringNullOrEmpty(filter.tag)) {
        this.searchForm.controls.tag.setValue('all');
      }

      this.statusFilter = Utils.ORDER_STATUS;
      console.log(this.statusFilter);
    });
  }

  onDateSelect() {
    this.searchFilter();
  }
  searchFilter() {
    const filters = this.searchForm.getRawValue();
    const exists = ['pre order'].indexOf(filters.tag) > -1;
    if (!exists) {
      filters.isRushFee = false;
    }
    this.filterSettings.emit(filters);
  }


  get isShowRushFee() {
    const tag = this.searchForm.controls.tag.value;
    const isavailable = ['pre order'].indexOf(tag) > -1;
    return isavailable;
  }

}
