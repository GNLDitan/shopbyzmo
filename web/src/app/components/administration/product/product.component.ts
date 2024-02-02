import { Component, OnInit, Inject } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/classes/product';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { environment } from 'src/environments/environment';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { ProductCategory } from 'src/app/classes/product-category';
import { DataService } from 'src/app/services/data.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CategoryService } from 'src/app/services/category.service';
import { DOCUMENT } from '@angular/common';
import { NavigationService } from 'src/app/services/navigation.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SitemapService } from 'src/app/services/sitemap.service';

import { Sitemap } from 'src/app/classes/sitemap';
import { SitemapProc } from 'src/app/enums/sitemap-proc.enum';
import { Frequency } from 'src/app/enums/frequency.enum';
import { Tag } from 'src/app/classes/tag';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  public products: Array<Product>;
  config: any;
  filter: FilterSetting;
  productFolder: any;
  selectedCategory: Array<string>;
  openCombo: boolean;
  teWidth: number;
  allCategory: any;
  productFilterForm: FormGroup;
  removedTags: Tag[];
  selectedTag: string;
  selectedReTag: string;
  allTags: any;
  availableRetags: any;
  isSelectAll: boolean;
  isRetagged: boolean;
  
  constructor(
    private productService: ProductService,
    private confirmationService: ConfirmationService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public categoryService: CategoryService,
    private toasterService: ToasterService,
    private SpinnerService: NgxSpinnerService,
    @Inject(DOCUMENT) private document,
    private navigationService: NavigationService,
    private sitemapService: SitemapService) {
    this.products = new Array();
    this.filter = new FilterSetting();
    this.selectedCategory = new Array();
    this.productFolder = environment.productFolderPath;
    this.openCombo = false;
    this.allCategory = this.dataService.allCategory;
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.products.length
    };
    this.removedTags = [];
    this.initializeFilter();
    this.allTags = [{
      name: 'all'
      },{
        name: 'just arrived'
      },{
        name: 'on hand'
      }, {
        name: 'on sale'
      }];
    this.availableRetags = [];
    this.selectedReTag = '';
    this.selectedTag = 'all'
  }

  ngOnInit() {
    this.getProducts();
  }

  initializeFilter() {
    this.productFilterForm = this.formBuilder.group({
      productName: [''],
      itemNumber: [''],
      tag: ['']
    });
  }

  getProducts() {
    this.filter.limit = 9999999;
    this.filter.forAdmin = true;
    this.filter.forProductList = false;
    this.filter.forLanding = false;
    this.filter.tags = [];
    if (this.filter.tag !== '') {
      this.filter.tags.push(this.filter.tag);
    }

    this.SpinnerService.show();
    this.productService.getProductsListRange(this.filter).then((product: any) => {
      this.products = product.filter(x => !x.isDeleted);
      this.selectedTag == 'all'
      this.products.map((p) => {
        p.isSelected = false;
        const currentImage = p.productImages.filter(x => x.isDefaultImage).length > 0 ? p.productImages.find(x => x.isDefaultImage) :
          p.productImages[0];
        p.currentImageUrl = this.productFolder + (currentImage ? currentImage.fileName : '');
      });

      this.config = {
        itemsPerPage: 10,
        currentPage: 1,
        totalItems: this.products.length
      };
      this.SpinnerService.hide();
    });
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  deleteProduct(product: Product) {
    const dialogQuestion = 'Are you sure to delete this product?';
    const dialogMessage = 'Selected product will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      product.productName, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.productService.deleteProductById(product.id).then((success: any) => {
          if (success) {
            const index = this.products.findIndex(x => x.id === product.id);
            this.products.splice(index, 1);
            this.config = {
              itemsPerPage: 10,
              currentPage: 1,
              totalItems: this.products.length
            };

            // For dynamic sitemap (s)
            const sMap = new Sitemap();
            sMap.loc.push(`${environment.webUrl}/products/${product.linkName}`);
            sMap.lastmod.push(new Date().toISOString().split('T')[0]);
            sMap.changefreq.push(Frequency.daily);
            sMap.priority.push('0.9');

            this.sitemapService.sitemapHandler(sMap, SitemapProc.remove);
            // For dynamic sitemap (e)

            this.toasterService.alert('success', 'deleting product');
          }
        });
      }
    }).catch(() => { });

  }

  onOpenCombo() {
    this.teWidth = this.document.getElementById('fake-input').clientWidth;
    this.openCombo = !this.openCombo;
  }

  changeSelection(filter: ProductCategory) {
    const index = this.selectedCategory.indexOf(filter.code);
    if (index == -1) {
      this.selectedCategory.push(filter.code);
    } else {
      this.selectedCategory.splice(index, 1);
    }
  }


  selectAll() {
    this.selectedCategory = [];
    for (const i in this.allCategory) {
      this.selectedCategory.push(this.allCategory[i].code);
    }
  }

  deselectAll() {
    this.selectedCategory = [];
  }

  searchProduct() {
    this.filter = this.productFilterForm.getRawValue();
    this.setFilter();

    this.getProducts();


  }

  clearAllFilter() {
    this.selectedCategory = [];
    this.initializeFilter();
  }

  setFilter() {
    const category = this.selectedCategory;
    const hierarch = [];
    category.forEach((code) => {
      const subs = this.categoryService.getAllSubCategories(code);
      const filterDetails = this.allCategory.filter(x => x.code == code);
      const found = subs.some(r => filterDetails.filter(x => x.code != code).indexOf(r) >= 0);

      if (!found) {
        hierarch.push(code);
        subs.map(x => {
          hierarch.push(x.code);
        });
      }
    });

    this.filter.category = hierarch;
  }

  toProductInventory(product: Product) {
    this.navigationService.toProductInventory(product);
  }

  toNotification(product: Product) {
    this.navigationService.toProductNotification(product);
  }

  setUntagged() {
    if (this.selectedTag != 'all') {
    
      let selectedProduct = this.products.filter(x => x.isSelected);
      if (selectedProduct.length == 0) {
        this.toasterService.alert('info', 'please select atleast one product');
        return;
      }
   
      const dialogQuestion = 'Are you sure to untagged Arrival these';
      const dialogMessage = 'Selected product will be untagged.';
      const dialogDanger = 'This operation can not be undone.';

      this.confirmationService.confirm(
        dialogQuestion,
        dialogMessage,
        selectedProduct.length + ' products',
        dialogDanger
      ).then((confirmed: any) => {
        if (confirmed) {
          this.removedTags = [];
          selectedProduct.map((product) => {
            let jstArrv = product.tags.filter(x => x.name = this.selectedTag);
            if (jstArrv.length > 0)
              this.removedTags.push(jstArrv[0]);
          });
          this.SpinnerService.show();
          this.productService.deleteProductTags(this.removedTags).then(() => {
            this.filter.tag = '';
            this.getProducts();
            this.toasterService.alert('success', 'product untagged successfully');
            this.SpinnerService.hide();
          }).catch(() => {
            this.SpinnerService.hide();
            this.toasterService.alert('danger', 'Theres something happen. please try again later.');
          });
        }
      })
    }
  }

  selectAllProduct(event) {
    let isSelect = event.currentTarget.checked;
    if (isSelect)
      this.products.filter(x => x.tags.filter(b => b.name == this.selectedTag).length > 0).map(x => x.isSelected = isSelect);
    else
      this.products.map(x => x.isSelected = isSelect);
  }

  changeTagSelected() {
    this.isSelectAll = false;
    this.isRetagged = false;
    this.products.map(x => x.isSelected = false);
    this.pageChanged(1)
  }

  get productsDisplay() {
    // this.selectedTag = 'just arrived';
    let products: any;
    if (this.selectedTag == 'all') {
      products = this.products;
    } else
      products = this.products.filter(x => x.tags.filter(b => b.name == this.selectedTag).length > 0);
    this.config.totalItems = products.length;
    return products;
  }

  setRetag() {
    if (!this.isRetagged) {
      this.isRetagged = true;
      this.availableRetags = this.allTags.filter(x => (x.name != 'all' && x.name != this.selectedTag && x.name != 'on sale'));
      this.selectedReTag = this.availableRetags[0].name;
    } else {

      let selectedProduct = this.products.filter(x => x.isSelected);
      if (selectedProduct.length == 0) {
        this.toasterService.alert('info', 'please select atleast one product');
        return;
      }

      const dialogQuestion = 'Are you sure to Retagged ?';
      const dialogMessage = `Selected product will be untagged to ${this.selectedTag} and rettaged to ${this.selectedReTag}`;
      const dialogDanger = 'This operation can not be undone.';

      this.confirmationService.confirm(
        dialogQuestion,
        dialogMessage,
        selectedProduct.length + ' products',
        dialogDanger
      ).then((confirmed: any) => {
        if (confirmed) {
          this.removedTags = [];
          let createTags = [];
          selectedProduct.map((product) => {
            let retag = product.tags.filter(x => x.name = this.selectedReTag);
            let newTag = new Tag();
            if (retag.length > 0) {
              this.removedTags.push(retag[0]);
            }
            newTag.productId = product.id;
            newTag.name = this.selectedReTag;
            createTags.push(newTag);
          });
          this.SpinnerService.show();
          this.productService.deleteProductTags(this.removedTags).then(() => {

            this.productService.createProductTags(createTags).then(() => {
              this.filter.tag = '';
              this.getProducts();
              this.toasterService.alert('success', 'product untagged successfully');
              this.SpinnerService.hide();
            });

          }).catch(() => {
            this.SpinnerService.hide();
            this.toasterService.alert('danger', 'Theres something happen. please try again later.');
          });
        }
      })
    }
  
  }

}
