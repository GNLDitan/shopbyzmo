import { Component, OnInit } from '@angular/core';
import { LoyaltyService } from 'src/app/services/loyalty.service';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/classes/user';
import { Discount } from 'src/app/classes/discount';
import { LoyaltyDiscount } from 'src/app/classes/loyalty-discount';
import { LoyaltyVoucher } from 'src/app/classes/loyalty-voucher';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { FormBuilder, Validators } from '@angular/forms';
import { LoyaltyQualified } from 'src/app/classes/loyalty-qualified';

@Component({
  selector: 'app-loyalty-discount',
  templateUrl: './loyalty-discount.component.html',
  styleUrls: ['./loyalty-discount.component.scss']
})
export class LoyaltyDiscountComponent implements OnInit {
  loyaltyVoucher: Array<LoyaltyVoucher>;
  loyaltyDiscount: Array<LoyaltyDiscount>;
  activeLoyaltyVoucher: Array<LoyaltyVoucher>;
  loyaltyForm: any;
  header: string;
  hasLoyalty: boolean;
  constructor(private loyaltyService: LoyaltyService,
    public dataService: DataService,
    private formBuilder: FormBuilder) {
    this.loyaltyVoucher = new Array();
    this.loyaltyDiscount = new Array();

    this.loyaltyForm = this.formBuilder.group({
      accumulatedPurchaseAmount: [{ value: '', disabled: true }],
      qualifiedDiscount: [{ value: '', disabled: true }],
      qualifiedDiscountId: [{ value: '', disabled: true }]
    });

  }

  ngOnInit() {
    this.dataService.user$.subscribe((user: User) => {
      if (user.id > 0) {
        let filter = new FilterSetting();
        filter.limit = 99999;
        this.loyaltyService.getActiveVoucherByUser(user).then((loyalty: any) => {
          this.loyaltyVoucher = loyalty;
          this.hasLoyalty = this.loyaltyVoucher.filter(x => x.loyaltyDiscount.discount > 0).length > 0;
        });
        this.loyaltyService.getLoyaltyDiscountListRange(filter).then((loyalty: any) => {
          this.loyaltyDiscount = loyalty;
        });

        let voulcher = new LoyaltyVoucher();
        voulcher.userId = user.id;
        voulcher.email = user.email;
        this.loyaltyService.getActiveLoyaltyVoucher(voulcher).then((loyalty: LoyaltyQualified) => {
          let format = loyalty.accumulatedPurchaseAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          this.loyaltyForm.patchValue(loyalty);
          this.loyaltyForm.controls.accumulatedPurchaseAmount.setValue(format);


        });

      }

    })
  }


}
