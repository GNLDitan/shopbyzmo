import { Component, OnInit } from '@angular/core';
import { PaymentMethod } from 'src/app/classes/payment-method';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss']
})
export class PaymentMethodComponent implements OnInit {

  paymentMethods: Array<PaymentMethod>;
  config: any;
  filter: FilterSetting;
  constructor(
    private paymentService: PaymentService,
    private confirmationService: ConfirmationService,
    private toasterService: ToasterService) {
    this.paymentMethods = new Array();
    this.filter = new FilterSetting();

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.paymentMethods.length
    };
  }

  ngOnInit() {
    this.getPaymentMethods();
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  getPaymentMethods() {
    this.filter.limit = 9999999;
    this.paymentService.getPaymentMethodListRange(this.filter).then((shippings: any) => {
      this.paymentMethods = shippings;
    });
  }

  deletePaymentMethod(paymentMethod: PaymentMethod) {
    const dialogQuestion = 'Are you sure to delete this payment method?';
    const dialogMessage = 'Selected payment method will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      paymentMethod.name, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.paymentService.deletePaymentMethodById(paymentMethod.id).then((success: any) => {
          if (success) {
            const index = this.paymentMethods.findIndex(x => x.id === paymentMethod.id);
            this.paymentMethods.splice(index, 1);
            this.config = {
              itemsPerPage: 10,
              currentPage: 1,
              totalItems: this.paymentMethods.length
            };
            this.toasterService.alert('success', 'deleting payment method');
          }
        });
      }
    }).catch(() => { });

  }

}
