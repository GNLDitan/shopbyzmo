import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private metaService: MetaTagService,
    private domService: DomService) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setH1Body('Shop Byzmo Privacy policy');
      this.domService.setCanonicalURL(`${environment.webUrl}/privacy-policy`);

      this.metaService.setTitle('Privacy policy - Shop Byzmo')
      this.metaService.setSocialMediaTags(`${environment.webUrl}/privacy-policy`,
        'Privacy policy - Shop Byzmo',
        'At ShopByzmo.com , the privacy of our visitors is of extreme importance to us. This privacy policy document outlines the types of personal information is received and collected by ShopByzmo.com and how it is used.',
        `${environment.webUrl}/assets/img/byzmo_header.png`);
    }
  }
}
