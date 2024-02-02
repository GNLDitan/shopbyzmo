import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { Utils } from 'src/app/app.utils';
import { environment } from 'src/environments/environment';

import { ProductService } from 'src/app/services/product.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { DataService } from 'src/app/services/data.service';

import { Tag } from 'src/app/classes/tag';
import { Product } from 'src/app/classes/product';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { ToasterService } from 'src/app/services/toaster.service';
import { Subscription } from 'rxjs';
import { LayAway } from 'src/app/classes/layaway';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit, OnDestroy {
  @ViewChild('quillEditor', { static: false }) quillEditor: any;
  product: Product;
  productForm: FormGroup;
  imageBlobs: ImageViewer[];
  editor_modules = {};
  productFolder: any;
  removedImageUrls: any;
  isUploading: boolean;
  currentCategory: string;
  layAways: Array<LayAway>;

  designTags: Tag[];
  removedTags: Tag[];
  tagNameQuery: string;
  topSuggestedTags: Tag[];
  newTags: [];
  isActive: string;
  isUpdateActive: boolean;

  private checkBoxSubscription: Subscription;
  private preOrderSubscription: Subscription;
  private rushFeeSubscription: Subscription;
  private preOrderLayawaySubscription: Subscription;

  constructor(public dataService: DataService,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private navigationService: NavigationService,
    private toasterService: ToasterService,
    private confirmationService: ConfirmationService,
    private validatorService: ValidatorService) {
    this.product = new Product();
    this.imageBlobs = [];
    this.removedImageUrls = [];
    this.isUploading = false;
    this.topSuggestedTags = [];
    this.designTags = [];
    this.removedTags = [];
    this.newTags = [];
    this.tagNameQuery = '';
    this.layAways = new Array();
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
    this.productFolder = environment.productFolderPath;
    this.productForm = this.formBuilder.group({
      id: [''],
      productName: ['', Validators.required],
      productDescription: [''],
      itemNumber: ['', Validators.required],
      price: ['', Validators.required],
      quantity: [''],
      category: [''],
      salesPrice: [''],
      onSale: [false],
      isactive: [],
      preOrder: [false],
      isLayAway: [false],
      preOrderDepositAmount: [''],
      costPrice: [0],
      hasRushFee: [false],
      rushFee: [0],
      preOrderLayaway: [false]
    });
  }

  ngAfterViewInit() {
    this.quillEditor.elementRef.nativeElement
      .querySelector('.ql-editor').classList
      .add('form-control');
  }

  ngOnInit() {
    this.dataService.selectedproduct$.subscribe((product) => {
      this.imageBlobs = [];
      if (product.hasOwnProperty('id')) {
        this.product = product;
        this.isActive = this.product.isactive ? 'Inactive' : 'Active';
        this.productForm.patchValue(this.product);
        this.currentCategory = product.category;
        this.designTags = product.tags;

        this.product.productImages.map((images) => {
          const image = new ImageViewer();
          image.imageUrl = this.productFolder + images.fileName;
          image.isDefaultImage = images.isDefaultImage;
          this.imageBlobs.push(image);
        });
      }
    });
    this.changed();
  }

  ngOnDestroy() {
    this.dataService.selectedproduct$.subscribe();
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
    let removedTag = new Tag();
    this.checkBoxSubscription = this.productForm.controls.onSale.valueChanges.subscribe(
      (isOnSale: boolean) => {
        if (isOnSale) {
          salesPriceControl.setValidators([Validators.required]);
          this.tagNameQuery = 'on sale';
          this.addTag();
        } else {
          const index = this.designTags.findIndex(x => x.name === 'on sale');
          removedTag = this.designTags.filter(x => x.name === 'on sale')[0];
          if (index > -1) {
            this.removedTags.push(removedTag);
          }
          salesPriceControl.clearValidators();
          this.designTags.splice(index, 1);
          salesPriceControl.setValue(0);
          this.tagNameQuery = '';
        }
        salesPriceControl.updateValueAndValidity();
      });

    this.preOrderSubscription = this.productForm.controls.preOrder.valueChanges.subscribe(
      (isPreOrder: boolean) => {
        if (isPreOrder) {
          preOrderDepositControl.setValidators([this.validatorService.numberRequired]);
          this.tagNameQuery = 'pre-order';
          this.addTag();
        } else {
          const index = this.designTags.findIndex(x => x.name === 'pre-order');
          removedTag = this.designTags.filter(x => x.name === 'pre-order')[0];
          this.designTags.splice(index, 1);

          if (index > -1) {
            this.removedTags.push(removedTag);
          }

          if (this.productForm.controls.preOrderLayaway.value) {
            return;
          }
          preOrderDepositControl.clearValidators();
          rushFeePriceControl.setValue(0);
          hasRushFeeControl.setValue(false);
          this.tagNameQuery = '';
          preOrderDepositControl.setValue(0);
        }
      });


    this.preOrderLayawaySubscription = this.productForm.controls.preOrderLayaway.valueChanges.subscribe(
      (isPreOrder: boolean) => {
        if (isPreOrder) {
          preOrderDepositControl.setValidators([this.validatorService.numberRequired]);
          this.tagNameQuery = 'pre-order-layaway';
          this.addTag();
        } else {
          const index = this.designTags.findIndex(x => x.name === 'pre-order-layaway');
          removedTag = this.designTags.filter(x => x.name === 'pre-order-layaway')[0];
          if (index > -1) {
            this.removedTags.push(removedTag);
          }
          this.designTags.splice(index, 1);
          this.tagNameQuery = '';

          if (this.productForm.controls.preOrder.value) {
            return;
          }
          preOrderDepositControl.clearValidators();
          rushFeePriceControl.setValue(0);
          hasRushFeeControl.setValue(false);
          preOrderDepositControl.setValue(0);
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


  onEditorCreated(event: any) {
    if (event != null) {
      event.root.innerHTML = this.productForm.controls.productDescription.value;
    }
  }

  uploadImages(fileEvent: any) {

    const files = fileEvent.target.files;
    this.isUploading = true;
    for (let i = 0; i < files.length; i++) {
      const newImageBlob = new ImageViewer();
      newImageBlob.file = files.item(i);
      this.imageBlobs.push(newImageBlob);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageBlobs.find(f => f.file === files.item(i)).imageUrl = event.target.result;
        // if (i === files.length - 1) {
        //   this.isUploading = false;
        //   fileEvent.target.value = '';
        // }
        this.isUploading = false;
      };
      reader.readAsDataURL(newImageBlob.file);
    }
  }

  removeImages(imageUrl: string) {
    if (Utils.isStringNullOrEmpty(imageUrl)) {
      return;
    }
    this.removedImageUrls.push(imageUrl);
    const imageViewIndex = this.imageBlobs.findIndex(f => f.imageUrl === imageUrl);
    if (imageViewIndex > -1) {
      this.imageBlobs.splice(imageViewIndex, 1);
    }
  }


  updateProduct() {

    console.log(this.designTags);
    if (this.imageBlobs.length === 0) {
      this.toasterService.alert('danger', 'please add image first.');
      return;
    } else if (!this.productForm.valid) {
      this.toasterService.alert('danger', 'please fill up required fields.');
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

    if (this.productForm.controls.onSale.value && this.productForm.controls.salesPrice.value === 0) {
      this.toasterService.alert('danger', 'Sales price should be greater than 0.');
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
      this.toasterService.alert('danger', 'product should not be pre-order-layaway with other tags.');
      return;
    }



    if (this.imageBlobs.filter(x => x.isDefaultImage).length === 0) {
      this.toasterService.alert('danger', 'select default image for product.');
    } else {
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

                if (this.isUpdateActive) {
                  this.product.isactive = this.isActive === 'Active' ? true : false;
                }

                this.productService.updateProduct(this.product, this.imageBlobs, this.removedTags).then(() => {
                  if (this.removedImageUrls.length > 0) {
                    this.productService.removeProductImages(this.removedImageUrls).then(() => {
                      this.toasterService.alert('success', 'saving product');
                      this.navigationService.toAdminProduct();
                    });
                  } else {

                    this.toasterService.alert('success', 'saving product');
                    this.navigationService.toAdminProduct();
                  }
                }).catch((ex) => {
                  this.toasterService.alert('error', ex.statusText)
                });
              }
            }
          }
        });
      }

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

  updateActive() {
    var activeMessage = '';
    this.isUpdateActive = true;
    activeMessage = this.product.isactive ? 'Inactivate' : 'Activate';
    const dialogQuestion = 'Are you sure to ' + activeMessage;
    const dialogMessage = 'Selected item will be ' + activeMessage;
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      this.product.productName, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.isActive = this.product.isactive ? 'Inactive' : 'Active';
        this.updateProduct();
      }
    }).catch(() => { });


  }


}
