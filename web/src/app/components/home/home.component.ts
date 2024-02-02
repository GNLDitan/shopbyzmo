import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Utils } from 'src/app/app.utils';
import { NavigationService } from 'src/app/services/navigation.service';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { MetaTagService } from 'src/app/services/meta-tag.service';
import { DomService } from 'src/app/services/dom-service';
import { FilterService } from 'src/app/services/filter.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  justArrived: string;
  onHandItem: string;
  onSale: string;
  preOrder: string;
  imageCount: number;
  currentFeature: string;
  filter: FilterSetting;
  constructor(
    private navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private metaService: MetaTagService,
    private domService: DomService,
    private filterService: FilterService) {
    this.justArrived = '';
    this.onHandItem = '';
    this.onSale = '';
    this.preOrder = '';
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.justArrived = Utils.FEATURE_TYPE.justArrived;
      this.onHandItem = Utils.FEATURE_TYPE.onHandItem;
      this.onSale = Utils.FEATURE_TYPE.onSale;
      this.preOrder = 'Pre Order';

      this.domService.setH1Body('Shop at Shop Byzmo');
      this.domService.setCanonicalURL(`${environment.webUrl}/home`);

      this.metaService.setTitle('Shop Byzmo');
      this.metaService.setSocialMediaTags(`${environment.webUrl}/home`,
        'Shop Byzmo',
        'Shopbyzmo is an online third party reseller. We are not affiliated with any of the brands we are selling in our website. We simply order our products from manufacturers and stores and bring them in. Login to our byzmo shop for convenient shopping and we also publish blog to our site for some updates to our genuine products. We are, in the literal sense, your personal shopper',
        `${environment.webUrl}/assets/img/byzmo_header.png`);
    }

  }

  setImageCount(event: any) {
    this.imageCount = event;
  }

  seePreOrder() {
    this.filter = new FilterSetting();
    // this.filter.tag = Utils.FEATURE_TYPE.preOrder;
    // this.filter.sort = 'Pre-Order';
    // this.filter.forLanding = false;
    // this.filter.forProductList = true;
    this.filter.tags.push('Pre-Order');
    this.navigationService.toProductsFilter(this.filter);
    // this.navigationService.toProductFeature('Pre-Order');
    // });
  }

}
