import { Component, OnInit } from '@angular/core';
import { Utils } from 'src/app/app.utils';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { Discount } from 'src/app/classes/discount';
import { ProductService } from 'src/app/services/product.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit {
  amountType: any;
  config: any;
  filter: FilterSetting;
  discounts: Array<Discount>;
  constructor(private productService: ProductService,
    private confirmationService: ConfirmationService,
    private toasterService: ToasterService) {
    this.discounts = new Array<Discount>();
    this.amountType = Utils.AMOUNT_TYPE;
    this.filter = new FilterSetting();

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.discounts.length
    };
  }

  ngOnInit() {
    this.getDiscounts();
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  getDiscounts() {
    this.filter.limit = 9999999;
    this.productService.getDiscountListRange(this.filter).then((shippings: any) => {
      this.discounts = shippings;
    });
  }

  deleteDiscount(discount: Discount) {
    const dialogQuestion = 'Are you sure to delete this discount?';
    const dialogMessage = 'Selected discount will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      discount.description, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.productService.deleteDiscountById(discount.id).then((success: any) => {
          if (success) {
            const index = this.discounts.findIndex(x => x.id === discount.id);
            this.discounts.splice(index, 1);

            this.config = {
              itemsPerPage: 10,
              currentPage: 1,
              totalItems: this.discounts.length
            };
            this.toasterService.alert('success', 'deleting discount');
          }
        });
      }
    }).catch(() => { });

  }

  getAmountType(amountTypeId: any): string {

    let amountType = '';
    this.amountType.filter(x => x.code === amountTypeId).map((amt: any) => {
      amountType = amt.description;
    });
    return amountType;
  }

}
