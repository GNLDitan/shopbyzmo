import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { LoyaltyDiscount } from 'src/app/classes/loyalty-discount';
import { LoyaltyService } from 'src/app/services/loyalty.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-admin-loyalty-discount',
  templateUrl: './admin-loyalty-discount.component.html',
  styleUrls: ['./admin-loyalty-discount.component.scss']
})
export class AdminLoyaltyDiscountComponent implements OnInit {

  config: any;
  loyaltyDiscounts: Array<LoyaltyDiscount>;
  constructor(public loyaltyService: LoyaltyService,
    private confirmationService: ConfirmationService,
    private toasterService: ToasterService) {
    this.loyaltyDiscounts = new Array();
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.loyaltyDiscounts.length
    };
  }

  ngOnInit() {
    this.loadLoyaltyDiscount();
  }

  loadLoyaltyDiscount() {
    const filter = new FilterSetting();
    filter.limit = 9999999;
    this.loyaltyService.getLoyaltyDiscountListRange(filter).then((loyaltyDiscounts: Array<LoyaltyDiscount>) => {
      this.loyaltyDiscounts = loyaltyDiscounts;
    });
  }

  delete(discount: LoyaltyDiscount) {
    const dialogQuestion = 'Are you sure to delete this tier?';
    const dialogMessage = 'Selected tier will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      discount.tierLevel, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.loyaltyService.deleteLoyaltyDiscount(discount).then((success: any) => {
          if (success) {
            const index = this.loyaltyDiscounts.findIndex(x => x.id === discount.id);
            this.loyaltyDiscounts.splice(index, 1);
            this.config = {
              itemsPerPage: 10,
              currentPage: 1,
              totalItems: this.loyaltyDiscounts.length
            };
            this.toasterService.alert('success', 'deleting blog');
          }
        }).catch((error) => {
          this.toasterService.alert('danger', error.statusText);
        });
      }
    }).catch(() => { });

  }
}
