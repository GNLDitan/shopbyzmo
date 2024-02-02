import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Utils } from 'src/app/app.utils';
import { NavigationService } from 'src/app/services/navigation.service';
import { ProductService } from 'src/app/services/product.service';

import { Tag } from 'src/app/classes/tag';
import { ProductInventory } from 'src/app/classes/product-inventory';
import { Product } from 'src/app/classes/product';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { ToasterService } from 'src/app/services/toaster.service';
import { Subscription } from 'rxjs';
import { LayAway } from 'src/app/classes/layaway';
import { ValidatorService } from 'src/app/services/validator.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SitemapService } from 'src/app/services/sitemap.service';

import { Sitemap } from 'src/app/classes/sitemap';
import { environment } from 'src/environments/environment';
import { Frequency } from 'src/app/enums/frequency.enum';
import { SitemapProc } from 'src/app/enums/sitemap-proc.enum';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit, AfterViewInit {
  @ViewChild('quillEditor', { static: false }) quillEditor: any;
  productForm: FormGroup;
  isProcessing: boolean;
  imageBlobs: ImageViewer[];
  imageUrls: string[];
  product: Product;
  currentCategory: string;
  designTags: Tag[];
  removedTags: Tag[];
  tagNameQuery: string;
  topSuggestedTags: Tag[];
  newTags: [];
  layAways: Array<LayAway>;
  isSaving: boolean;

  editor_modules = {};

  private checkBoxSubscription: Subscription;
  private preOrderSubscription: Subscription;
  private rushFeeSubscription: Subscription;
  private preOrderLayawaySubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private navigationService: NavigationService,
    private toasterService: ToasterService,
    private validatorService: ValidatorService,
    private SpinnerService: NgxSpinnerService,
    private sitemapService: SitemapService) {
    this.layAways = Array();
    this.imageUrls = [];
    this.imageBlobs = new Array<ImageViewer>();
    this.product = new Product();
    this.topSuggestedTags = [];
    this.designTags = [];
    this.removedTags = [];
    this.newTags = [];
    this.tagNameQuery = '';
    this.editor_modules = {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ color: [] }, { background: [] }],
          ['clean']
        ]
      }
    };

    this.productForm = this.formBuilder.group({
      productName: ['', Validators.required],
      productDescription: ['', Validators.required],
      itemNumber: ['', Validators.required],
      price: [0, Validators.required],
      quantity: ['0'],
      category: [''],
      salesPrice: [''],
      onSale: [false],
      isActive: [true],
      preOrder: [false],
      isLayAway: [false],
      layAway: [''],
      preOrderDepositAmount: [0],
      costPrice: [0, Validators.required],
      hasRushFee: [false],
      rushFee: [0],
      preOrderLayaway: [false],
    });
  }

  ngOnInit() {
    this.currentCategory = 'CD';
    this.changed();
    this.getLayAway();
    this.SpinnerService.show();
  }

  ngOnDestroy() {
    this.checkBoxSubscription.unsubscribe();
    this.preOrderSubscription.unsubscribe();
    this.rushFeeSubscription.unsubscribe();
    this.preOrderLayawaySubscription.unsubscribe();
  }

  changed() {
    const salesPriceControl = this.productForm.controls.salesPrice;
    const rushFeePriceControl = this.productForm.controls.rushFee;
    const hasRushFeeControl = this.productForm.controls.hasRushFee;
    const preOrderDepositControl = this.productForm.controls.preOrderDepositAmount;

    this.checkBoxSubscription = this.productForm.controls.onSale.valueChanges.subscribe(
      (isOnSale: boolean) => {
        if (isOnSale) {
          salesPriceControl.setValidators([Validators.required]);
          this.tagNameQuery = 'on sale';
          this.addTag();
          preOrderDepositControl.setValidators([Validators.required]);
        } else {
          salesPriceControl.clearValidators();
          const index = this.designTags.findIndex(x => x.name === 'on sale');
          this.designTags.splice(index, 1);
        }
        salesPriceControl.updateValueAndValidity();
      });

    this.preOrderSubscription = this.productForm.controls.preOrder.valueChanges.subscribe(
      (isPreOrder: boolean) => {
        if (isPreOrder) {
          this.tagNameQuery = 'pre-order';
          this.addTag();
          preOrderDepositControl.setValidators([this.validatorService.numberRequired]);
        } else {
         
          const index = this.designTags.findIndex(x => x.name === 'pre-order');
          this.designTags.splice(index, 1);
          rushFeePriceControl.setValue(0);
          hasRushFeeControl.setValue(false);
          preOrderDepositControl.setValue(0);
          if(!this.productForm.controls.preOrderLayaway.value)
               preOrderDepositControl.clearValidators();
        }
        preOrderDepositControl.updateValueAndValidity();
      });


    this.preOrderLayawaySubscription = this.productForm.controls.preOrderLayaway.valueChanges.subscribe(
      (isPreOrder: boolean) => {
        if (isPreOrder) {
          this.tagNameQuery = 'pre-order-layaway';
          this.addTag();
          preOrderDepositControl.setValidators([this.validatorService.numberRequired]);
        } else {
          const index = this.designTags.findIndex(x => x.name === 'pre-order-layaway');
          this.designTags.splice(index, 1);
          rushFeePriceControl.setValue(0);
          hasRushFeeControl.setValue(false);
          preOrderDepositControl.setValue(0);
          if(!this.productForm.controls.preOrder.value)
             preOrderDepositControl.clearValidators();
        }
        preOrderDepositControl.updateValueAndValidity();
      });



    this.rushFeeSubscription = this.productForm.controls.hasRushFee.valueChanges.subscribe(
      (hasRushFee: boolean) => {
        if (hasRushFee) {
          rushFeePriceControl.setValidators([this.validatorService.numberRequired]);
        } else {
          rushFeePriceControl.clearValidators();
          rushFeePriceControl.setValue(0);
        }
        rushFeePriceControl.updateValueAndValidity();
      });
  }

  ngAfterViewInit() {
    this.quillEditor.elementRef.nativeElement
      .querySelector('.ql-editor').classList
      .add('form-control');
  }

  uploadImages(fileEvent: any) {
    const files = fileEvent.target.files;
    for (let i = 0; i < files.length; i++) {
      const newImageBlob = new ImageViewer();
      newImageBlob.file = files.item(i);
      this.imageBlobs.push(newImageBlob);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageBlobs.find(f => f.file === files.item(i)).imageUrl = event.target.result;
        // if (i === files.length - 1) {
        //   fileEvent.target.value = '';
        // }
      };
      reader.readAsDataURL(newImageBlob.file);
    }
  }



  onEditorCreated(event: any) {
    if (event != null) {
      event.root.innerHTML = this.productForm.controls.productDescription.value;
    }
  }

  save() {


    if (this.imageBlobs.length === 0) {
      this.toasterService.alert('danger', 'please add image first.');
      return;
    } else if (!this.productForm.valid) {
      this.toasterService.alert('danger', 'please fill up required fields.');
      return;
    }

    if (this.productForm.controls.preOrder.value && this.productForm.controls.preOrderDepositAmount.value === 0) {
      this.toasterService.alert('danger', 'Pre-order deposit amount should be greater than 0.');
      return;
    }

    if (this.productForm.controls.preOrderLayaway.value && this.productForm.controls.preOrderDepositAmount.value === 0) {
      this.toasterService.alert('danger', 'Pre-order deposit amount should be greater than 0.');
      return;
    }

    if (this.productForm.controls.isLayAway.value && this.productForm.controls.preOrder.value) {
      this.toasterService.alert('danger', 'product should not be pre-order and layaway.');
      return;
    }

    if (this.productForm.controls.onSale.value && this.productForm.controls.preOrder.value) {
      this.toasterService.alert('danger', 'product should not be pre-order and on sale.');
      return;
    }



    if ((this.productForm.controls.onSale.value || this.productForm.controls.isLayAway.value ||
      this.productForm.controls.preOrder.value) && this.productForm.controls.preOrderLayaway.value) {
      this.toasterService.alert('danger', 'product cannot be pre-order-layaway with other tags.');
      return;
    }



    if (this.productForm.valid) {
      this.product = this.productForm.getRawValue();
      this.productService.checkItemNumberValidity(this.product).then((isValid: any) => {
        if (isValid != null) {
          if (!isValid) {
            this.toasterService.alert('danger', 'Item number exists.');
            return;
          } else {
            if (this.imageBlobs.filter(x => x.isDefaultImage).length === 0) {
              this.toasterService.alert('danger', 'select default image for product.');
              return;
            } else {
              this.product.tags = this.designTags;
              this.isSaving = true;
              this.SpinnerService.show();
              this.productService.addProduct(this.product, this.imageBlobs).then((product: Product) => {
                const inventory = new ProductInventory();
                inventory.id = 0;
                inventory.productId = product.id;
                inventory.quantity = this.product.quantity;
                inventory.dateCreated = new Date();
                inventory.deliveryDate = new Date();

                // For dynamic sitemap (s)
                const sMap = new Sitemap();
                sMap.loc.push(`${environment.webUrl}/products/${product.linkName}`);
                sMap.lastmod.push(new Date().toISOString().split('T')[0]);
                sMap.changefreq.push(Frequency.daily);
                sMap.priority.push('0.9');

                this.sitemapService.sitemapHandler(sMap, SitemapProc.add);
                // For dynamic sitemap (e)

                this.toasterService.alert('success', 'saving product');
                this.isSaving = false;
                this.SpinnerService.hide();
                this.navigationService.toAdminProduct();
                // this.productService.createInventory(inventory).then(() => {
                //   this.navigationService.toAdminProduct()
                // });
              }).catch((ex) => {
                var err = ex.error.message || ex.name;
                this.toasterService.alert('danger', err);
              });
            }
          }
        } else {
          this.toasterService.alert('danger', 'Item number is Invalid.');
        }
      }).catch((ex) => {
        var err = ex.error.message || ex.name;
        this.toasterService.alert('danger', err);
      });
    }
  }

  setDefaultImage(index: number) {
    this.imageBlobs.map((blob, i) => {
      if (i === index) {
        blob.isDefaultImage = !blob.isDefaultImage;
      } else { blob.isDefaultImage = false; }
    });
  }

  setCurrentCategory(event: any) {
    this.productForm.controls.category.setValue(event);
  }

  getTopSuggestedTags() {
    this.topSuggestedTags = [];
    if (Utils.isStringNullOrEmpty(this.tagNameQuery)) {
      return;
    }
    this.productService.getTopTags(this.tagNameQuery).then((tags: any) => {
      this.topSuggestedTags = tags;
    });
  }


  addTag() {
    if (this.designTags.filter(x => x.name === this.tagNameQuery).length <= 0) {
      const designTags = new Tag();
      designTags.id = 0;
      designTags.name = this.tagNameQuery;
      this.designTags.push(designTags);
      this.removedTags.filter(x => x.name === this.tagNameQuery)
        .map((x, i) => {
          this.removedTags.splice(i, 1);
        });
      this.tagNameQuery = '';
    }
  }

  removeTag(tag: Tag) {
    if (!Utils.isNullOrUndefined(this.designTags)) {
      if (tag.name === 'pre-order') {
        this.productForm.controls.preOrder.setValue(false);
      }
      this.designTags.splice(this.designTags.indexOf(tag), 1);
      this.removedTags.push(tag);
    }
  }

  addSuggestedTag(tag: Tag) {
    if (tag.name === 'pre-order') {
      this.productForm.controls.preOrder.setValue(true);
    } else {
      this.designTags.push(tag);
    }

  }

  removeImages(imageUrl: string) {
    if (Utils.isStringNullOrEmpty(imageUrl)) {
      return;
    }
    const imageViewIndex = this.imageBlobs.findIndex(f => f.imageUrl === imageUrl);
    if (imageViewIndex > -1) {
      this.imageBlobs.splice(imageViewIndex, 1);
    }
  }
  getLayAway() {
    this.productService.getLayAway().then((result: any) => {
      this.layAways = result;
    });
  }

}
