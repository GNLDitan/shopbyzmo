import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/app.utils';
import { LoyaltyService } from 'src/app/services/loyalty.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-add-loyalty-discount',
  templateUrl: './add-loyalty-discount.component.html',
  styleUrls: ['./add-loyalty-discount.component.scss']
})
export class AddLoyaltyDiscountComponent implements OnInit {
  loyaltyDiscountForm: any;
  currencyType: any;
  amountType: any;
  constructor(private formBuilder: FormBuilder,
    public loyaltyService: LoyaltyService,
    private toasterService: ToasterService,
    private navigationService: NavigationService) {

    this.currencyType = Utils.CURRENCY;
    this.amountType = Utils.AMOUNT_TYPE;

    this.loyaltyDiscountForm = this.formBuilder.group({
      id: ['0'],
      tierLevel: [''],
      rangeFrom: [0, Validators.required],
      rangeFromCurrencyType: [1],
      rangeTo: [0],
      rangeToCurrencyType: [1],
      discount: [0],
      discountAmountType: [1]
    });
  }

  ngOnInit() {

  }

  save() {
    if (this.validateData()) {
      let loyaltyDiscount = this.loyaltyDiscountForm.getRawValue();
      this.loyaltyService.createLoyaltyDiscount(loyaltyDiscount).then(() => {
        this.navigationService.toAdminLoyaltyDiscount();
      }).catch((error) => {
        this.toasterService.alert('danger', error.statusText);
      });
    }
  }

  validateData() {
    let loyaltyDiscount = this.loyaltyDiscountForm.getRawValue();
    if ((parseFloat(loyaltyDiscount.rangeFrom) > parseFloat(loyaltyDiscount.rangeTo)) && parseFloat(loyaltyDiscount.rangeTo) > 0) {
      this.toasterService.alert('warning', 'Cannot Save. Range To must be greater than Range From');
      return false;
    } else {
      return true;
    }
  }
}
