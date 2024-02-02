import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/classes/product';
import { UserProductNotification } from 'src/app/classes/user-product-notification';
import { DataService } from 'src/app/services/data.service';
import { ProductService } from 'src/app/services/product.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-product-notification',
  templateUrl: './product-notification.component.html',
  styleUrls: ['./product-notification.component.scss']
})
export class ProductNotificationComponent implements OnInit {
  public product: Product;
  public productNotification: Array<UserProductNotification>;
  public isSending: boolean;
  constructor(public dataService: DataService,
    public userService: UserService,
    public productService: ProductService,
    public toasterService: ToasterService) {
    this.product = new Product();
    this.productNotification = new Array();
  }

  ngOnInit() {
    this.dataService.selectedproduct$.subscribe((product) => {
      if (product.hasOwnProperty('id')) {
        this.product = product;
        this.userService.getUserProductNotificationByProduct(product.id).then((notif: any) => {
          this.productNotification = notif;
        });
      }

    });
  }

  sendEmail(notif) {
    this.isSending = true;
    this.productService.sendProductNotification(notif).then((notifResult) => {
      if (!notif.isSend) {
        this.productService.updateSendProductNotification(notif).then((result) => {
          if (result) {
            this.toasterService.alert('success', 'Send notification Complete');
            notif.isSend = true;
            this.isSending = false;
          } else {
            this.toasterService.alert('danger', 'Send notification failed. Please try again later');
            this.isSending = false;
          }
        }).catch(() => {
          this.toasterService.alert('danger', 'Send notification failed. Please try again later');
          this.isSending = false;
        })
      } else {
        this.toasterService.alert('success', 'Send notification Complete');
        this.isSending = false;
      }
    }).catch(() => {
      this.toasterService.alert('danger', 'Send notification failed. Please try again later');
      this.isSending = false;
    });

  }

}
