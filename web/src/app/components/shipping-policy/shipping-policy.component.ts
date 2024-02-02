import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-shipping-policy',
  templateUrl: './shipping-policy.component.html',
  styleUrls: ['./shipping-policy.component.scss']
})
export class ShippingPolicyComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private metaService: MetaTagService,
    private domService: DomService) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setH1Body('Shop Byzmo Shipping policy');
      this.domService.setCanonicalURL(`${environment.webUrl}/shipping-policy`);

      this.metaService.setTitle('Shipping policy - Shop Byzmo')
      this.metaService.setSocialMediaTags(`${environment.webUrl}/shipping-policy`,
        'Shipping policy - Shop Byzmo',
        'LOCAL Shipping is via LBC. You may track your shipment through https://www.lbcexpress.com/. Grab/Lalamove/Mr Speedy. Please put in Special instruction field (Shipping details) upon checkout, what day or time we can send the shipments. We will text you the cost of the grab/lalamove/mrspeedy.',
        `${environment.webUrl}/assets/img/byzmo_header.png`);
    }
  }
}
