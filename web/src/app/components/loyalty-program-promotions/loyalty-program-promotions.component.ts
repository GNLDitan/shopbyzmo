import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';
import { environment } from 'src/environments/environment';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { LoyaltyDiscount } from 'src/app/classes/loyalty-discount';
import { LoyaltyService } from 'src/app/services/loyalty.service';

@Component({
  selector: 'app-loyalty-program-promotions',
  templateUrl: './loyalty-program-promotions.component.html',
  styleUrls: ['./loyalty-program-promotions.component.scss']
})
export class LoyaltyProgramPromotionsComponent implements OnInit {
  loyaltyDiscount: Array<LoyaltyDiscount>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private metaService: MetaTagService,
    private domService: DomService, 
    public loyaltyService: LoyaltyService) {

    this.loyaltyDiscount = new Array<LoyaltyDiscount>();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setH1Body('Shop Byzmo Loyalty program promotions');
      this.domService.setCanonicalURL(`${environment.webUrl}/loyalty-program-promotions`);

      this.metaService.setTitle('Loyalty program promotions - Shop Byzmo')
      this.metaService.setSocialMediaTags(`${environment.webUrl}/loyalty-program-promotions`,
        'Loyalty program promotions - Shop Byzmo',
        'From time to time, Shopbyzmo will have promos for extra discount and/or free shipping. You may use any one of them per transaction. We will not honor multiple discounts. In the event that you entered two (and by some miracle both went through), we will only honor the one with the higher discount, but not both. Promotions are subject to change without prior notice. Promotions will also be effective within a specific time frame ONLY. All dates and time will be in Philippine (GMT+8) Time. Please take note of the time as we will be holding auctions onsite. We will not be responsible for misunderstandings.',
        `${environment.webUrl}/assets/img/byzmo_header.png`);

      let filter = new FilterSetting();
      filter.limit = 99999;
      this.loyaltyService.getLoyaltyDiscountListRange(filter).then((loyalty: any) => {
        this.loyaltyDiscount = loyalty;
      });
    }
  }
}
