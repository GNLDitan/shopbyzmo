import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment-terms',
  templateUrl: './payment-terms.component.html',
  styleUrls: ['./payment-terms.component.scss']
})
export class PaymentTermsComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private metaService: MetaTagService,
    private domService: DomService) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setH1Body('Shop Byzmo Payment terms');
      this.domService.setCanonicalURL(`${environment.webUrl}/payment-terms`);

      this.metaService.setTitle('Payment terms - Shop Byzmo')
      this.metaService.setSocialMediaTags(`${environment.webUrl}/payment-terms`,
        'Payment terms - Shop Byzmo',
        'Layaway Payment - monthly installments of payment. In shopping cart you can avail of the layaway payment option (not all items have a layaway payment term) where you can select how many installment payments and the date of the month to process the payment. A non-refundable deposit (NRD) is required to be able to reserve the item. You can view your installment payment amount, shipping amount and payment schedule in View Orders of your logged in account.',
        `${environment.webUrl}/assets/img/byzmo_header.png`);
    }
  }
}
