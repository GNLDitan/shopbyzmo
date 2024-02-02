import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from 'src/app/services/product.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { Discount } from 'src/app/classes/discount';
import { Utils } from 'src/app/app.utils';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-discount',
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.scss']
})
export class AddDiscountComponent implements OnInit {
  discountForm: FormGroup;
  amountType: any;
  discount: Discount
  valuedate = new Date();

  constructor(private formBuilder: FormBuilder,
    private productService: ProductService,
    private toasterService: ToasterService,
    private navigationService: NavigationService,
    private validatorService: ValidatorService,
    private datePipe: DatePipe) {

    this.amountType = Utils.AMOUNT_TYPE;
    this.discount = new Discount();
    this.discountForm = this.formBuilder.group({
      code: ['', Validators.required],
      description: [''],
      amountTypeId: [1, Validators.required],
      amount: ['0', [Validators.required, validatorService.decimalValidator]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      isOneTimeUse: [false]
    });
  }

  ngOnInit() {
    this.discountForm.controls.startDate.setValue(this.datePipe.transform(this.valuedate, "MM-dd-yyyy"));
    this.discountForm.controls.endDate.setValue(this.datePipe.transform(this.valuedate, "MM-dd-yyyy"));
  }

  onOptionsSelected(value: number) {
    this.discountForm.controls['amountTypeId'].setValue(value);
    this.discountForm.controls['amount'].setValue(0);
  }

  save() {

    if (!this.discountForm.valid) {
      this.toasterService.alert('danger', 'please fill up required fields.');
      return;
    }
    if (this.discountForm.controls['amount'].value > 100 && this.discountForm.controls['amountTypeId'].value === '2') {
      this.toasterService.alert('danger', 'amount must be less than 100.');
      return;
    }

    if (this.discountForm.valid) {
      this.discount = this.discountForm.getRawValue();
      this.discount.isActive = true;
      this.productService.createDiscount(this.discount).then((discount: any) => {
        if (!Utils.isNullOrUndefined(discount)) {
          this.toasterService.alert('success', 'saving discount');
          this.navigationService.toAdminDiscount();
        } else {
          this.toasterService.alert('danger', 'saving discount');
        }
      });
    }
  }

}
