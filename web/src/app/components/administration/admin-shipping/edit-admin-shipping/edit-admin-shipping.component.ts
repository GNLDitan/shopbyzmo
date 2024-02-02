import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ShippingService } from 'src/app/services/shipping.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Shipping } from 'src/app/classes/shipping';
import { Utils } from 'src/app/app.utils';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { ShippingSpecialItemCost } from 'src/app/classes/shipping-special-item-cost';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-admin-shipping',
  templateUrl: './edit-admin-shipping.component.html',
  styleUrls: ['./edit-admin-shipping.component.scss']
})
export class EditAdminShippingComponent implements OnInit {
  shippingForm: FormGroup;
  currencyType: any;
  shipping: Shipping;
  shippingSubscription: any;
  shippingItemCost: Array<ShippingSpecialItemCost>;
  insuranceSubscription: Subscription;

  constructor(private formBuilder: FormBuilder,
              private shippingService: ShippingService,
              private toasterService: ToasterService,
              private dataService: DataService,
              private navigationService: NavigationService,
              private validatorService: ValidatorService,
              private confirmationService: ConfirmationService) {
    this.currencyType = Utils.CURRENCY;
    this.shipping = new Shipping();
    this.shippingForm = this.formBuilder.group({
      id: [0],
      shippingName: ['', Validators.required],
      trackingUrl: ['', Validators.required],
      description: ['', Validators.required],
      rate: ['0', [Validators.required, validatorService.decimalValidator]],
      currencyId: [1, Validators.required],
      hasAdditionRate: [true],
      hasInsurance: [false],
      everyAmount: ['0'],
      insuranceFee: ['0'],
      isInternational: [false]
    });
    this.shippingItemCost = Array<ShippingSpecialItemCost>();
  }

  ngOnInit() {
    this.subscribeShipping();
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
        everyAmountControl.updateValueAndValidity();
        insuranceFeetControl.updateValueAndValidity();
      });
  }

  ngOnDestroy() {
    this.dataService.selectedShipping$.subscribe();
    this.insuranceSubscription.unsubscribe();
  }

  subscribeShipping() {
    this.shippingSubscription = this.dataService.selectedShipping$.subscribe((shipping: any) => {
      if (shipping.hasOwnProperty('id')) {
        this.shipping = shipping;
        this.shippingForm.patchValue(this.shipping);
        this.shippingService.getShippingSpecialItemCostByShippingId(this.shipping.id).then((costs: any) => {
          this.shippingItemCost = costs;
        });
      }
    });

  }

  save() {

    if (!this.shippingForm.valid) {
      this.toasterService.alert('danger', 'please fill up required fields.');
      return;
    }

    if (this.shippingForm.valid) {
      this.shipping = this.shippingForm.getRawValue();
      this.shippingService.updateShipping(this.shipping).then((shipping: any) => {
        if (!Utils.isNullOrUndefined(shipping)) {
          this.toasterService.alert('success', 'updating shipping');
          this.navigationService.toAdminShipping();
        } else {
          this.toasterService.alert('danger', 'updating shipping');
        }
      });
    }
  }


  addItem() {
    let newShipping = new ShippingSpecialItemCost();
    newShipping.isEdited = true;
    newShipping.id = 0;
    newShipping.shippingId = this.shipping.id;
    this.shippingItemCost.push(newShipping);
  }

  deleteItem(item: ShippingSpecialItemCost, i) {
    if (item.id == 0) {
      this.shippingItemCost.splice(i, 1);
    } else {
      const dialogQuestion = 'Are you sure to delete this Item?';
      const dialogMessage = 'Selected Addition Rate will be deleted.';
      const dialogDanger = 'This operation can not be undone.';

      this.confirmationService.confirm(
        dialogQuestion, // Title
        dialogMessage, // Message
        item.fromCount + ' - ' + item.toCount, // Highlighted text after title = nullable
        dialogDanger // Danger text after message = nullable
      ).then((confirmed: any) => {
        if (confirmed) {

          this.shippingService.deleteShippingSpecialItemCost(item).then((cost: any) => {
            this.shippingItemCost.splice(i, 1);
          });
        }
      }).catch(() => { });
    }
  }

  createAdditionRate(item, i) {
    if (item.fromCount > 0 && item.amount > 0) {
      if (item.id === 0) {
        this.shippingService.createShippingSpecialItemCost(item).then((cost: any) => {
          this.shippingItemCost = cost;
          this.toasterService.alert('success', 'Create shipping Additional Rate');
        }).catch(() => {
          this.toasterService.alert('danger', 'Error Create shipping Additional Rate');
        });
      } else {
        this.shippingService.updateShippingSpecialItemCost(item).then((cost: any) => {
          this.shippingItemCost = cost;
          this.toasterService.alert('success', 'Updating shipping Additional Rate');
        }).catch(() => {
          this.toasterService.alert('danger', 'Error Updating shipping Additional Rate');
        });
      }
      item.isEdited = !item.isEdited;
    } else {
      this.toasterService.alert('danger', `Error saving. Please fill all fields in row ${i + 1}`);
    }
  }


  onchangeFrom(event) {
    if (parseInt(event.target.value) <= 1) {
      this.toasterService.alert('error', 'value must greater than 1');
      event.target.value = 2;
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
