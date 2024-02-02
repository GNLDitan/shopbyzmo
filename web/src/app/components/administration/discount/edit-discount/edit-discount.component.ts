import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from 'src/app/services/toaster.service';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { Discount } from 'src/app/classes/discount';
import { Utils } from 'src/app/app.utils';

@Component({
  selector: 'app-edit-discount',
  templateUrl: './edit-discount.component.html',
  styleUrls: ['./edit-discount.component.scss']
})
export class EditDiscountComponent implements OnInit {
  discountForm: FormGroup;
  amountType: any;
  discount: Discount
  valuedate = new Date();
  discountSubscription: any;

  constructor(private formBuilder: FormBuilder,
    private productService: ProductService,
    private toasterService: ToasterService,
    private dataService: DataService,
    private navigationService: NavigationService,
    private validatorService: ValidatorService) {
    this.amountType = Utils.AMOUNT_TYPE;
    this.discount = new Discount();
    this.discountForm = this.formBuilder.group({
      id: [0],
      code: ['', Validators.required],
      description: [''],
      amountTypeId: [1, Validators.required],
      amount: ['0', [Validators.required, validatorService.decimalValidator]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      isOneTimeUse: [true]
    });
  }

  ngOnInit() {
    this.subscribeDiscount();
  }

  ngOnDestroy() {
    this.dataService.selectedDiscount$.subscribe();
  }

  subscribeDiscount() {
    this.discountSubscription = this.dataService.selectedDiscount$.subscribe((discount: any) => {
      if (discount.hasOwnProperty('id')) {
        this.discount = discount
        this.discountForm.patchValue(this.discount);
      }
    });

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
      this.productService.updateDiscount(this.discount).then((discount: any) => {
        if (!Utils.isNullOrUndefined(discount)) {
          this.toasterService.alert('success', 'updating discount');
          this.navigationService.toAdminDiscount();
        } else {
          this.toasterService.alert('danger', 'updating discount');
        }
      });
    }
  }

}
