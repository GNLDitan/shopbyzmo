import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/app.utils';
import { ActivatedRoute } from '@angular/router';
import { LoyaltyService } from 'src/app/services/loyalty.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';

@Component({
  selector: 'app-edit-loyalty-discount',
  templateUrl: './edit-loyalty-discount.component.html',
  styleUrls: ['./edit-loyalty-discount.component.scss']
})
export class EditLoyaltyDiscountComponent implements OnInit {

  loyaltyDiscountForm: any;
  currencyType: any;
  amountType: any;
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private loyaltyService: LoyaltyService,
    private toasterService: ToasterService,
    private navigationService: NavigationService,
    private validatorService: ValidatorService,
    private confirmationService: ConfirmationService) {

    this.currencyType = Utils.CURRENCY;
    this.amountType = Utils.AMOUNT_TYPE;

    this.loyaltyDiscountForm = this.formBuilder.group({
      id: ['0'],
      tierLevel: ['', Validators.required],
      rangeFrom: [0, [Validators.required, this.validatorService.numberRequired]],
      rangeFromCurrencyType: [1],
      rangeTo: [0],
      rangeToCurrencyType: [1],
      discount: [0],
      discountAmountType: [1]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMaps: any) => {
      let id = paramMaps.params.id;
      this.loyaltyService.getLoyaltyDiscountById(id).then((result: any) => {
        this.loyaltyDiscountForm.patchValue(result);
      });
    });
  }


  save() {
    if (this.validateData() && this.loyaltyDiscountForm.valid) {
      const dialogQuestion = 'Do you want to save changes?';
      const dialogMessage = 'Selected user will be update.';
      const dialogDanger = 'This operation can not be undone.';
      let loyalty = this.loyaltyDiscountForm.getRawValue();
      this.confirmationService.confirm(
        dialogQuestion, // Title
        dialogMessage, // Message
        loyalty.tierLevel, // Highlighted text after title = nullable
        dialogDanger // Danger text after message = nullable
      ).then((confirmed: any) => {
        if (confirmed) {
          this.loyaltyService.updateLoyaltyDiscount(loyalty).then(() => {
            this.navigationService.toAdminLoyaltyDiscount();
          }).catch((error) => {
            this.toasterService.alert('danger', error.statusText);
          });
        }
      }).catch(() => { });
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
