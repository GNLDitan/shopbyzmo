import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { DataService } from 'src/app/services/data.service';
import { ProductService } from 'src/app/services/product.service';
import { NavigationService } from 'src/app/services/navigation.service';

import { ProductInventory } from 'src/app/classes/product-inventory';
import { Product } from 'src/app/classes/product';
import { Utils } from 'src/app/app.utils';

@Component({
  selector: 'app-product-inventory',
  templateUrl: './product-inventory.component.html',
  styleUrls: ['./product-inventory.component.scss']
})
export class ProductInventoryComponent implements OnInit, OnDestroy {

  inventoryList: Array<ProductInventory>;
  product: Product;
  inventory: ProductInventory;
  inventoryForm: any;
  productSubscription: any;
  Quantity: any;
  config: any;
  statusList: any;
  paymentStatusList: any;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private navigationService: NavigationService,
    private productService: ProductService) {
    this.inventoryList = new Array();
    this.product = new Product();
    this.inventory = new ProductInventory();

    this.inventoryForm = this.formBuilder.group({
      quantity: ['0', Validators.required],
      minimumQuantity: ['0']
    });

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.inventoryList.length
    };
    this.statusList = Utils.ORDER_STATUS;
    this.Quantity = 0
    this.paymentStatusList = Utils.PAYMENT_STATUS;;
  }

  ngOnInit() {
    this.productSubscription = this.dataService.selectedproduct$.subscribe((product: any) => {
      this.inventoryList = new Array();
      this.product = new Product();
      if (product.hasOwnProperty('id')) {
        this.product = product;
        this.productService.getInventoryByProductId(product.id).then((inventory: any) => {
          this.Quantity = 0;
          this.inventoryList = inventory;
          this.inventoryList.map((x) => {
            this.Quantity = this.Quantity + x.quantity;
          });

          const cur = this.inventoryList.length / 10;
          const intCur = Math.floor(cur);
          const currentP = cur > intCur ? intCur + 1 : intCur;
          this.config = {
            itemsPerPage: 10,
            currentPage: currentP,
            totalItems: this.inventoryList.length
          };

        });


      }
    });


  }


  pageChanged(event) {
    this.config.currentPage = event;
  }

  ngOnDestroy() {
    this.dataService.selectedproduct$.subscribe();
  }

  getDateFormat(dateString: string) {
    const date = new Date(dateString + 'Z');

    return date.toLocaleDateString('en-PH') + ' ' + date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  save() {
    this.inventory = this.inventoryForm.getRawValue();
    this.inventory.productId = this.product.id;
    this.inventory.dateCreated = new Date();
    this.inventory.deliveryDate = new Date();
    this.productService.createInventory(this.inventory).then(() => {
      this.dataService.setProduct(this.product);
      this.navigationService.toAdminProduct();
    });
  }

  goBack() {
    this.navigationService.toAdminProduct();
  }

  getStatus(statusId: any): string {
    let status = '';
    this.statusList.filter(x => x.id === statusId).map((st: any) => {
      status = st.description;
    });
    return status;
  }

  getPaymentStatus(statusId: any): string {
    let paymentStatus = '';
    this.paymentStatusList.filter(x => x.id === statusId).map((st: any) => {
      paymentStatus = st.description;
    });
    return paymentStatus;
  }


  toOrderPage(product: ProductInventory) {
    if (product.orderNumber === 0) {
      return;
    }
    this.navigationService.toAdminOrderId(product.orderNumber);
  }


}
