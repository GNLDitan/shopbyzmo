import { Component, OnInit, Input, Inject, PLATFORM_ID, OnDestroy, SimpleChange } from '@angular/core';
import { Product } from 'src/app/classes/product';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { User } from 'src/app/classes/user';
import { ProductService } from 'src/app/services/product.service';
import { UserService } from 'src/app/services/user.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Utils } from 'src/app/app.utils';
import { CategoryService } from 'src/app/services/category.service';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/services/cart.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-features-related',
  templateUrl: './features-related.component.html',
  styleUrls: ['./features-related.component.scss']
})
export class FeaturesRelatedComponent implements OnInit, OnDestroy {

  public products: Array<Product>;
  @Input() relate: string;
  @Input() productId: number;

  public inputFeatureType: string = '';
  user: User;
  allCategory: any;
  productFolder: any;
  categorySubscription: Subscription;
  ipAddress: string;
  filter: FilterSetting;

  constructor(
    private productService: ProductService,
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private categoryService: CategoryService,
    private navigationService: NavigationService,
    private cartService: CartService,
    private toasterService: ToasterService) {
    this.products = new Array();
    this.user = new User();
    this.productFolder = environment.productFolderPath;
    this.filter = new FilterSetting();
    this.categorySubscription = new Subscription();
  }

  ngOnInit() {
    this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        this.ipAddress = ipAddress;
      }
    });
    this.subscribeUser();
  }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    const parent = this;

    if (isPlatformBrowser(this.platformId)) {
      this.categorySubscription = this.dataService.selectedCategory$.subscribe((allcategory) => {
        if (allcategory.length > 0) {
          this.allCategory = allcategory;
          this.getAllRelatedCategory(this.relate);
          this.getProducts();
        }
      });
    }

  }

  ngOnDestroy() {
    this.categorySubscription.unsubscribe();

  }


  subscribeUser() {
    this.dataService.user$.subscribe(next => {
      this.user = next;
    });
  }


  getProducts() {
    this.filter.productId = this.productId;
    this.filter.limit = 8;
    this.productService.getProductRelated(this.filter).then((product: any) => {
      this.products = product;
      this.products = this.products.filter(x => x.quantity > 0);
      this.products.map((p) => {

        const currentImage = p.productImages.filter(x => x.isDefaultImage).length > 0 ? p.productImages.find(x => x.isDefaultImage) :
          p.productImages[0];
        p.currentImageUrl = this.productFolder + currentImage.fileName;
        p.originalQuantity = p.quantity;

        if (p.tags.length > 0) {
          const sale = Utils.FEATURE_TYPE.onSale.toLowerCase();
          const preOrder = Utils.FEATURE_TYPE.preOrder.toLowerCase();
          const justArrived = Utils.FEATURE_TYPE.justArrived.toLowerCase();
          const tag = p.tags.filter(x => x.name.toLowerCase() === sale);

          if (tag.length > 0 || p.onSale) {
            p.displayTag = tag.length > 0 ? tag[0].name : sale;
          } else {
            const tag = p.tags.filter(x => x.name.toLowerCase() === justArrived);
            if (tag.length > 0) {
              p.displayTag = tag[0].name;
            } else {
              const tag = p.tags.filter(x => x.name.toLowerCase() === preOrder);
              if (tag.length > 0 || p.preOrder) {
                p.displayTag = tag.length > 0 ? tag[0].name : preOrder;
              }
            }
          }
        }
      });
    });
  }

  getAllRelatedCategory(code: string) {
    const hierarch = [];
    this.filter = new FilterSetting();

    const subs = this.categoryService.getAllSubCategories(code);
    const parent = this.categoryService.categoryMapping(code);
    const related = subs.concat(parent);
    const filterDetails = this.allCategory.filter(x => x.code == code);
    // const found = subs.some(r => filterDetails.filter(x => x.code != code).indexOf(r) >= 0)

    // if (!found) {
    hierarch.push(code);
    related.map(x => {
      hierarch.push(x.code);
    });
    // }

    this.filter.category = hierarch;
  }

  /* Removed for SEO crawl
  selectProduct(product: Product) {
    this.navigationService.toProductInformationByLinkName(product);
  }
  */

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
