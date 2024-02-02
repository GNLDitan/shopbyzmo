import { Component, OnInit, Input, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/classes/product';
import { environment } from 'src/environments/environment';
import { Utils } from 'src/app/app.utils';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';
import { User } from 'src/app/classes/user';
import { NavigationService } from 'src/app/services/navigation.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {

  public products: Array<Product>;
  @Input() inputFeatureType: any;
  filter: FilterSetting;
  user: User;

  productFolder: any;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private navigationService: NavigationService,
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.products = new Array();
    this.user = new User();
    this.productFolder = environment.productFolderPath;
    this.filter = new FilterSetting();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getProducts();
      this.checkUser();
      this.subscribeUser();
    }
  }

  checkUser() {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        this.dataService.setUser(success);
      }, (error) => {
        console.log(error.error);
      });
    }

  }

  subscribeUser() {
    this.dataService.user$.subscribe(next => {
      this.user = next;
    });
  }


  getProducts() {
    // this.filter.tag = this.inputFeatureType;
    this.filter.forLanding = true;
    this.filter.forProductList = false;
    this.filter.tags.push(this.inputFeatureType);
    // this.filter.sort = this.inputFeatureType;
    this.productService.getProductsListRange(this.filter).then((product: any) => {
      this.products = product;
      this.products = this.products.filter(x => x.quantity > 0 && x.isactive);
      this.products.map((p) => {

        const currentImage = p.productImages.filter(x => x.isDefaultImage).length > 0 ? p.productImages.find(x => x.isDefaultImage) :
          p.productImages[0];
        p.currentImageUrl = this.productFolder + currentImage.fileName;
        p.originalQuantity = p.quantity;
      });
    });
  }

  seeMore() {
    this.filter.forLanding = true;
    this.filter.forProductList = false;
    this.filter.tag = this.inputFeatureType;
    this.filter.tags = [];
    this.filter.tags.push(this.inputFeatureType);
    // this.filter.sort = this.inputFeatureType;
    // this.dataService.setGlobalFilter(this.filter);
    this.navigationService.toProductsFilter(this.filter);
  }

}

