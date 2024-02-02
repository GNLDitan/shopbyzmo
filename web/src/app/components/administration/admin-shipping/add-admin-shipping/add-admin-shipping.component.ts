import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/app.utils';
import { ShippingService } from 'src/app/services/shipping.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Shipping } from 'src/app/classes/shipping';
import { NavigationService } from 'src/app/services/navigation.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { ShippingSpecialItemCost } from 'src/app/classes/shipping-special-item-cost';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-add-admin-shipping',
  templateUrl: './add-admin-shipping.component.html',
  styleUrls: ['./add-admin-shipping.component.scss']
})
export class AddAdminShippingComponent implements OnInit, OnDestroy {
  shippingForm: FormGroup;
  currencyType: any;
  shipping: Shipping;
  shippingItemCost: Array<ShippingSpecialItemCost>;
  insuranceSubscription: Subscription;

  constructor(private formBuilder: FormBuilder,
              private shippingService: ShippingService,
              private toasterService: ToasterService,
              private navigationService: NavigationService,
              private validatorService: ValidatorService) {

    this.currencyType = Utils.CURRENCY;
    this.shipping = new Shipping();
    this.shippingItemCost = new Array();
    this.shippingForm = this.formBuilder.group({
      shippingName: ['', Validators.required],
      trackingUrl: ['', Validators.required],
      description: ['', Validators.required],
      rate: ['0', [Validators.required, validatorService.decimalValidator]],
      currencyId: [1, Validators.required],
      hasAdditionRate: [false],
      hasInsurance: [false],
      everyAmount: ['0'],
      insuranceFee: ['0'],
      isInternational: [false]
    });
  }

  ngOnInit() {

    const everyAmountControl = this.shippingForm.controls.everyAmount;
    const insuranceFeetControl = this.shippingForm.controls.insuranceFee;

    this.insuranceSubscription = this.shippingForm.controls.hasInsurance.valueChanges.subscribe(
      (isInsurance: boolean) => {
        if (isInsurance) {
          everyAmountControl.setValidators([this.validatorService.numberRequired]);
          insuranceFeetControl.setValidators([this.validatorService.numberRequired]);
        } else {
          insuranceFeetControl.setValue(0);
          insuranceFeetControl.setValue(0);
          everyAmountControl.clearValidators();
          insuranceFeetControl.clearValidators();
        }
        insuranceFeetControl.updateValueAndValidity();
        everyAmountControl.updateValueAndValidity();
      });
      
  }


  ngOnDestroy() {
    this.insuranceSubscription.unsubscribe();
  }

  save() {

    if (!this.shippingForm.valid) {
      this.toasterService.alert('danger', 'please fill up required fields.');
      return;
    }

    if (this.shippingForm.valid) {
      this.shipping = this.shippingForm.getRawValue();
      this.shippingService.createShipping(this.shipping).then((shipping: any) => {
        if (!Utils.isNullOrUndefined(shipping)) {

          const shippingItemCost = this.shippingItemCost.filter(x => x.fromCount > 0);
          shippingItemCost.map((item) => {
            item.shippingId = shipping.id;
          });
          this.shippingService.createShippingSpecialItemCostBulk(this.shippingItemCost);

          this.toasterService.alert('success', 'saving shipping');
          this.navigationService.toAdminShipping();
        } else {
          this.toasterService.alert('danger', 'saving shipping');
        }
      });
    }
  }

  addItem() {
    const newShipping = new ShippingSpecialItemCost();
    newShipping.isEdited = true;
    this.shippingItemCost.push(newShipping);
  }

  deleteItem(i) {
    this.shippingItemCost.splice(i, 1);
  }

  saveItem(item, i) {
    if (item.fromCount > 0 && item.amount > 0) {
      item.isEdited = !item.isEdited;
    } else { this.toasterService.alert('danger', `Error saving. Please fill all fields in row ${i + 1}`); }

  }

  onchangeFrom(event, item) {
    if (parseInt(event.target.value) <= 1) {
      this.toasterService.alert('error', 'value must greater than 1');
      event.target.value = 2;
      item.fromCount = 2;
      event.stopPropagation();
    }
  }

  onchangeTo(event, fromAmount, i) {
    if (parseInt(event.target.value) <= 1) {
      this.toasterService.alert('error', 'value must greater than 1');
      event.target.value = 2;
      event.stopPropagation();
    } else if (parseInt(event.target.value) <= fromAmount) {
      this.toasterService.alert('error', `value must greater than from amount in row ${i + 1}`);
      event.target.value = fromAmount + 1;
      event.stopPropagation();
    }
  }
}
