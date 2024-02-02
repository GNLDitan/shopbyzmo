import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private metaService: MetaTagService,
    private domService: DomService) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setH1Body('About Shop Byzmo');
      this.domService.setCanonicalURL(`${environment.webUrl}/about-us`);
      
      this.metaService.setTitle('About us - Shop Byzmo')
      this.metaService.setSocialMediaTags(`${environment.webUrl}/about-us`,
        'About us - Shop Byzmo',
        'Shopbyzmo is an online third party reseller. We are not affiliated with any of the brands we are selling in our website. We simply order our products from manufacturers and stores and bring them in. Login to our byzmo shop for convenient shopping and we also publish blog to our site for some updates to our genuine products. We are, in the literal sense, your personal shopper',
        `${environment.webUrl}/assets/img/byzmo_header.png`);
    }
  }
}
