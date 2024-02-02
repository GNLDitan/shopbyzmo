import { Component, OnInit } from '@angular/core';
import { FilterSetting } from 'src/app/classes/filter-settings';
import { Order } from 'src/app/classes/order';
import { OrderService } from 'src/app/services/order.service';
import { DataService } from 'src/app/services/data.service';
import { Utils } from 'src/app/app.utils';
import { Address } from 'src/app/classes/address';
import { Cart } from 'src/app/classes/cart';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { Discount } from 'src/app/classes/discount';
import { ProductService } from 'src/app/services/product.service';
import { PrintService } from 'src/app/services/print.service';
import { environment } from 'src/environments/environment';
import { ShippingService } from 'src/app/services/shipping.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  config: any;
  filter: FilterSetting;
  orders: Array<Order>;
  selectedFilter: any;
  statusList: any;
  paymentStatusList: any;
  selectedAddress: Address;
  productFolder: string;

  constructor(
    private orderService: OrderService,
    private dataService: DataService,
    private productService: ProductService,
    private printService: PrintService,
    private SpinnerService: NgxSpinnerService,
    private shippingService: ShippingService) {
    this.orders = new Array<Order>();
    this.filter = new FilterSetting();

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.orders.length
    };

    this.statusList = Utils.ORDER_STATUS;
    this.paymentStatusList = Utils.PAYMENT_STATUS;
    this.selectedAddress = new Address();
  }

  ngOnInit() {
    this.productFolder = environment.productFolderPath;
    this.selectedFilter = this.dataService.selectedFilter$.subscribe((filter) => {
      if (!Utils.isNullOrUndefined(filter)) {
        this.filter = filter;
        this.getOrders(this.filter);
      }
    });

  }

  filterHandler($event: any) {
    if ($event != null) {
      this.filter = $event;
      this.filter.limit = 99999999;
      this.getOrders(this.filter);
      this.dataService.setFilter(this.filter);
    }
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  getOrders(filter: FilterSetting) {
    this.SpinnerService.show();
    this.orderService.getOrderListRange(filter).then((orders: any) => {
      this.orders = orders;
      this.orders.map((ord: Order) => {
        if (!Utils.isNullOrUndefined(ord.orderCart.filter(x => x.isLayAway))) {
          ord.layaway = ord.orderCart.filter(x => x.isLayAway).length >= 1 ? true : false;
        }
        if (!Utils.isNullOrUndefined(ord.orderCart.filter(x => x.preOrder))) {
          ord.withPreOrder = ord.orderCart.filter(x => x.preOrder).length >= 1 ? true : false;
        }
        if (!Utils.isNullOrUndefined(ord.orderCart.filter(x => x.preOrderLayaway))) {
          ord.preOrderLayaway = ord.orderCart.filter(x => x.preOrderLayaway).length >= 1 ? true : false;
        }

        if (ord.preOrderLayaway) {
          ord.withPreOrder = true;
        }

        let preOrderSum = 0;
        for (const pre of ord.orderCart.filter(x => x.preOrder)) {
          preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
        }

        for (const pre of ord.orderCart.filter(x => x.preOrderLayaway && !x.isLayAway)) {
          preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
        }

        ord.totalPrice = preOrderSum > 0 ? (preOrderSum - ord.discountAmount + ord.shippingAmount) + ord.insuranceFee
        : ord.totalPrice;

        // this.shippingService.getShippingDetailsById(ord.shippingId).then((shippingDetails: any) => {
        //   if (!Utils.isNullOrUndefined(shippingDetails)) {
        //     ord.totalPrice = preOrderSum > 0 ? (preOrderSum - shippingDetails.discountAmount + shippingDetails.shippingAmount)
        //       : ord.totalPrice;
        //   }
        // });


      });

      this.config = {
        itemsPerPage: 10,
        currentPage: 1,
        totalItems: this.orders.length
      };
      this.SpinnerService.hide();
    });
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

  printInvoice(order: Order) {
    order.orderCart.map((p) => {
      const currentImage = p.product.productImages.filter(x => x.isDefaultImage).length > 0
        ? p.product.productImages.find(x => x.isDefaultImage) :
        p.product.productImages[0];
      p.product.currentImageUrl = this.productFolder + currentImage.fileName;

      const totalPrice = p.onSale && !p.preOrder ? p.salesPrice : p.price;
      p.totalPrice = totalPrice;
      p.totalAmount = (totalPrice * p.quantity);
    });
    this.shippingService.getShippingDetailsById(order.shippingId).then((shipDetails: any) => {
      if (!Utils.isNullOrUndefined(shipDetails)) {
        this.shippingService.getShippingById(shipDetails.shippingMethod).then((shipping: any) => {
          shipDetails.shippingMethodDetails = shipping;
          order.shippingDetails = shipDetails;
          order.shippingAmount = shipDetails.shippingAmount;
          order.discountAmount = shipDetails.discountAmount;
          order.insuranceFee = shipDetails.insuranceFee;
          this.printService.printInvoice(order);

        });
      }
    });

  }

}
