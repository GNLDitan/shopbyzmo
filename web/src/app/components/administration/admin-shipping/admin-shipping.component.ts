import { Component, OnInit } from '@angular/core';
import { Shipping } from 'src/app/classes/shipping';
import { ShippingService } from 'src/app/services/shipping.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-admin-shipping',
  templateUrl: './admin-shipping.component.html',
  styleUrls: ['./admin-shipping.component.scss']
})
export class AdminShippingComponent implements OnInit {
  shippings: Array<Shipping>;
  config: any;
  filter: FilterSetting;
  constructor(private shippingService: ShippingService,
              private confirmationService: ConfirmationService,
              private toasterService: ToasterService) {
    this.shippings = new Array();
    this.filter = new FilterSetting();

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.shippings.length
    };
  }

  ngOnInit() {
    this.getShippings();
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  getShippings() {
    this.filter.limit = 9999999;
    this.shippingService.getShippingListRange(this.filter).then((shippings: any) => {
      this.shippings = shippings;
    });
  }

  deleteShipping(shipping: Shipping) {
    const dialogQuestion = 'Are you sure to delete this shipping?';
    const dialogMessage = 'Selected shipping will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      shipping.shippingName, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.shippingService.deleteShippingById(shipping.id).then((success: any) => {
          if (success) {
            const index = this.shippings.findIndex(x => x.id === shipping.id);
            this.shippings.splice(index, 1);
            this.config = {
              itemsPerPage: 10,
              currentPage: 1,
              totalItems: this.shippings.length
            };
            this.toasterService.alert('success', 'deleting shipping');
          }
        });
      }
    }).catch(() => { });

  }

}
