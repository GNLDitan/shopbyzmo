import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private metaService: MetaTagService,
    private domService: DomService) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setH1Body('Shop Byzmo Terms and Conditions');
      this.domService.setCanonicalURL(`${environment.webUrl}/terms-and-conditions`);

      this.metaService.setTitle('Terms and Conditions - Shop Byzmo')
      this.metaService.setSocialMediaTags(`${environment.webUrl}/terms-and-conditions`,
        'Terms and Conditions - Shop Byzmo',
        'Your access to ShopByzmo and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service. By accessing or using the Service You agree to be bound by these Terms and Conditions.If You disagree with any part of these Terms and Conditions then You may not access the Service.',
        `${environment.webUrl}/assets/img/byzmo_header.png`);
    }
  }
}
