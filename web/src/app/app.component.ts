import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';
import { IpService } from './services/ip.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DomService } from './services/dom-service';
import { environment } from 'src/environments/environment';
import { DataService } from './services/data.service';
import { CurrenyService } from './services/currency.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { PaymentService } from './services/payment.service';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})

export class AppComponent implements OnInit {
  title = 'Shop Byzmo';
  isDoneSetup: boolean;

  constructor(private router: Router,
    public categoryService: CategoryService,
    public productService: ProductService,
    private ipService: IpService,
    private SpinnerService: NgxSpinnerService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document,
    private domService: DomService,
    public dataService: DataService,
    public currencyService: CurrenyService,
    public metaTagService: Meta,
    public paymentService: PaymentService) {
    this.isDoneSetup = false;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'UA-191725152-1',
          {
            page_path: event.urlAfterRedirects
          }
        );
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.domService.setDnsPrefetch("https://shopbyzmo.com/assets/img");
      this.domService.setDnsPrefetch("https://fonts.gstatic.com");
      this.domService.setDnsPrefetch("https://fonts.googleapis.com");

      // this.metaTagService.addTags([
      //  { property: 'og:url', content: 'https://shopbyzmo.com' },
      //  { property: 'og:title', content: 'Shop Byzmo' },
      //  { property: 'og:image', content: 'http://api.shopbyzmo.com/file/images/products/CfDJ8ID7OJq3Lu1EpfvAxWo_2otKo-0cZEHzusfVHy8IMYSyDrpY3Mjv7eB1s9i2vliRApYIiHaD1d-8Ca1LHCiYqi7eBXekIhc4kr3sYOtJKf63cOUT5O8sng24rLoEvoPzyTV5ZNGvcaXYQyveSOhvFgTartjjtF1JVX6LucSnlBld.png' },
      // ]);
      // ** initial setup **//
      this.SpinnerService.show();
      this.dataService.productInitLoading = true;
      var cat = this.categoryService.getAllCategory();
      var actv = this.productService.getActivelayaway();
      var lydts = this.productService.getLayAwayDates();
      var ipadd = this.ipService.getIPAddress();
      var hf = this.categoryService.getHomeFeature();
      var ccp = this.paymentService.getCreditCardPaymentMethod();
     // ** initial setup **//
      
      this.currencyService.setInitialCurrency();
      var frt = this.currencyService.getForexRate();
      this.dataService.scriptDone(false)

      Promise.all([cat, actv, lydts, ipadd, hf, frt, ccp]).then((done) => {
        this.SpinnerService.hide();
        this.isDoneSetup = true;
        this.dataService.scriptDone(true)
      }).catch(() => {
        this.SpinnerService.hide();
        this.isDoneSetup = true;
        this.dataService.scriptDone(true)
      });

      // this.loadExternalScript("https://www.paypalobjects.com/api/checkout.js").then(() => {
      //   this.dataService.scriptDone(true)
      // }).catch(() => {
      //   this.dataService.scriptDone(true)
      // })
    }
  }

  // loadExternalScript(scriptUrl: string) {
  //   return new Promise((resolve, reject) => {
  //     const scriptElement = this.document.createElement('script')
  //     scriptElement.src = scriptUrl
  //     scriptElement.onload = resolve
  //     this.document.body.appendChild(scriptElement)
  //   })
  // }

}
