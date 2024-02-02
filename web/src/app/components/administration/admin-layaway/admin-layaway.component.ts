import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { LayAway } from 'src/app/classes/layaway';
import { FormBuilder, Validators } from '@angular/forms';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { LayAwayDates } from 'src/app/classes/layaway-date';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-admin-layaway',
  templateUrl: './admin-layaway.component.html',
  styleUrls: ['./admin-layaway.component.scss']
})
export class AdminLayawayComponent implements OnInit {

  currentLayAway: LayAway;
  layAwayForm: any;
  layAwayDates: Array<LayAwayDates>;
  newDate: number;
  constructor(public activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    public navigationService: NavigationService,
    private validatorService: ValidatorService,
    public toasterService: ToasterService,
    public productService: ProductService) {
    this.currentLayAway = new LayAway();
    this.layAwayDates = new Array();
    this.layAwayForm = this.formBuilder.group({
      id: ['0'],
      description: ['', Validators.required],
      datesOfPayment: ['0'],
      maxNumberOfInstallmentPayment: ['0', validatorService.invalidIstallment],
      percentOfNonRefundDeposit: ['0']
    });
  }

  ngOnInit() {
    this.productService.getActivelayaway().then((result: any) => {
      this.layAwayForm.patchValue(result);
    });
    this.productService.getLayAwayDates().then((result: Array<LayAwayDates>) => {
      if (result == null)
        result = Array<LayAwayDates>();
      this.layAwayDates = result;
    });
  }


  save() {
    if (!this.layAwayForm.valid) return;
    let layAwayForm = this.layAwayForm.getRawValue();
    layAwayForm.percentOfNonRefundDeposit = layAwayForm.percentOfNonRefundDeposit / 100;
    this.productService.updateProductLayAway(layAwayForm).then(() => {
      this.toasterService.alert('success', 'Saving LayAway');
    })
  }

  saveDates() {

    let found = this.layAwayDates.filter(x => x.paymentDay == this.newDate).length > 0;
    if (!found) {
      this.productService.createLayAwayDates({
        id: 0,
        paymentDay: this.newDate
      }).then((result: any) => {
        this.layAwayDates.push(result)
        this.toasterService.alert('success', 'Saving LayAway Date');
      })
    } else {
      this.toasterService.alert('warning', 'Date is already exist.');
    }
    console.log(this.newDate)
  }

  deleteDate(date: any) {
    this.productService.deleteLayAwayDates(date).then(() => {
      let index = this.layAwayDates.indexOf(date);
      this.layAwayDates.splice(index, 1);
      this.toasterService.alert('success', 'Deleting LayAway Date');
    });
  }
}
