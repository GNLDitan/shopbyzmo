import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Product } from 'src/app/classes/product';
import { NavigationService } from 'src/app/services/navigation.service';
import { CartService } from 'src/app/services/cart.service';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/classes/user';
import { ToasterService } from 'src/app/services/toaster.service';
import { Utils } from 'src/app/app.utils';
import { IpService } from 'src/app/services/ip.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-slick-carousel',
  templateUrl: './slick-carousel.component.html',
  styleUrls: ['./slick-carousel.component.scss']
})
export class SlickCarouselComponent implements OnInit {

  @Input() products: Array<Product>;
  @Input() inputFeatureType: any;
  @Input() user: User;
  
  ipAddress: string;
  selectedIP: Subscription;
  featureType: string;
  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 4,
    nextArrow: '<div><i class=\'next-slide fas fa-chevron-right\'></i></div>',
    prevArrow: '<div><i class=\'prev-slide fas fa-chevron-left\'></i></div>',
    infinite: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          arrows: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          arrows: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          arrows: false
        }
      }
    ]
  };


  constructor(
    private navigationService: NavigationService,
    private cartService: CartService,
    private dataService: DataService,
    private toasterService: ToasterService,
    private ipService: IpService) {
    this.products = new Array();
    this.selectedIP = new Subscription();

  }

  ngOnInit() {
    // this.cartService.validateCartExpiry(this.user);
    this.featureType = this.inputFeatureType;
    this.loadAll();
  }

  /* Removed for SEO crawl
  selectProduct(product: Product) {
    this.navigationService.toProductInformationByLinkName(product);
  }
  */

  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
        }
      }

    });
  }
  addProductToCart(product: Product) {
    if (this.user.isAdmin) {
      this.toasterService.alert('danger', 'adding cart logged in as admin');
    } else {
      product.quantity = 1;
      const isValid = this.cartService.validateCart(product, this.user, product.originalQuantity, this.ipAddress);
      if (isValid || Utils.isNullOrUndefined(isValid)) {
        this.cartService.addProductToCart(this.ipAddress, product, false, this.user);
      }
    }

  }

}
