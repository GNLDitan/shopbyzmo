import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrderService } from 'src/app/services/order.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { Order } from 'src/app/classes/order';
import { Utils } from 'src/app/app.utils';
import { Cart } from 'src/app/classes/cart';
import { environment } from 'src/environments/environment';
import { LayAway } from 'src/app/classes/layaway';
import { LayAwayDates } from 'src/app/classes/layaway-date';
import { LayAwayService } from 'src/app/services/layaway.service';
import { ProductService } from 'src/app/services/product.service';
import { Discount } from 'src/app/classes/discount';
import { DatePipe, DOCUMENT } from '@angular/common';
import { ShippingDetails } from 'src/app/classes/shipping-details';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { LayAwaySchedule } from 'src/app/classes/layaway-schedule';
import { OrderReason } from 'src/app/classes/order-reason';
import { FileViewer } from 'src/app/classes/file-viewer';
import { FileMapper } from 'src/app/classes/file-mapper';
import { FileService } from 'src/app/services/file.service';
import { saveAs } from 'file-saver';
import { PaymentService } from 'src/app/services/payment.service';
import { FILE } from 'dns';
import { OrderEmailStatus } from 'src/app/classes/order-email-status';
import { PreOrderSchedule } from 'src/app/classes/pre-order-schedule';
import { LoyaltyService } from 'src/app/services/loyalty.service';
import { PreOrderNotification } from 'src/app/classes/preorder-notification';
import { Product } from 'src/app/classes/product';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  orderForm: FormGroup;
  orderSubscription: any;
  order: Order;
  valuedate = new Date();
  paymentStatusList: any;
  mobileNumber: string;
  shippingMethodDescription: string;
  productFolder: string;
  layAway: LayAway;
  layAwayDates: Array<LayAwayDates>;
  daysList: any;
  sumTotalPrice: number;
  subTotal: number;
  discountAmount: number;
  shippingAmount: number;
  selectedDiscount: Discount;
  statusType: any;
  shippingDetails: ShippingDetails;
  itemNumber: string;
  cart: Cart;
  amountToPay: number;
  isWithLayAway: boolean;
  emailText: string;
  isPaymentStatusDisable: boolean;
  specialInstruction: string;
  isUpdateDisabled: boolean;
  fileList: FileViewer[];
  orderEmailStatus: OrderEmailStatus[];
  paymentAttachment: FileViewer;
  fileLanding: string;
  attachmentFolder: string;
  totalRushFee: number;
  facebookName: string;

  public isOnlinePayment: boolean;
  public clearOption: Array<any>;

  constructor(
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private toasterService: ToasterService,
    private dataService: DataService,
    private navigationService: NavigationService,
    private validatorService: ValidatorService,
    private layAwayService: LayAwayService,
    private productService: ProductService,
    private datePipe: DatePipe,
    @Inject(DOCUMENT) private document,
    private confirmationService: ConfirmationService,
    private fileService: FileService,
    private paymentService: PaymentService,
    private loyaltyService: LoyaltyService) {

    this.orderForm = this.formBuilder.group({
      id: [0],
      orderNumber: [],
      invoiceNumber: [],
      statusId: [1],
      trackingNumber: [''],
      shippingDate: [''],
      paymentStatusId: [1]
    });

    this.order = new Order();
    this.paymentStatusList = Utils.PAYMENT_STATUS;
    this.productFolder = environment.productFolderPath;
    this.attachmentFolder = environment.attachmentPath;
    this.daysList = new Array();
    this.sumTotalPrice = 0;
    this.layAway = new LayAway();
    this.layAwayDates = Array();
    this.selectedDiscount = new Discount();
    this.statusType = Utils.ORDER_STATUS;
    this.shippingDetails = new ShippingDetails();
    this.cart = new Cart();
    this.emailText = 'Resend';
    this.isPaymentStatusDisable = false;
    this.fileList = [];
    this.fileLanding = Utils.FILE_LANDING.attachment;
    this.paymentAttachment = new FileViewer();
    this.clearOption = new Array();
    this.orderEmailStatus = [];
    this.totalRushFee = 0;
  }

  ngOnInit() {
    this.clearOption.push({
      id: true,
      value: 'Paid'
    }, {
      id: false,
      value: 'Unpaid'
    });
    this.subscribeOrder();
  }

  ngOnDestroy() {
    this.dataService.setOrder(new Order());
    this.orderSubscription.unsubscribe();
  }
  getDays(paymentDay: any) {
    return Utils.numericSuffix(paymentDay) + ' of the month';
  }

  subscribeOrder() {
    // if (this.dataService.allLayAwayDates.length > 0 && this.dataService.allLayAway.id != undefined) {
    //   this.layAway = this.dataService.allLayAway;
    //   this.layAwayDates = this.dataService.allLayAwayDates;
    // } else {
    //   this.dataService.selectedLayAway$.subscribe((data: any) => {
    //     this.layAway = data.layAway;
    //     this.layAwayDates = data.layAwayDates;
    //   })
    // }
    this.statusType = Utils.ORDER_STATUS;
    this.paymentStatusList = Utils.PAYMENT_STATUS;
    this.orderSubscription = this.dataService.selectedOrder$.subscribe((order: any) => {
      if (order.hasOwnProperty('id')) {
        this.order = order;
        this.shippingDetails = this.order.shippingDetails;
        this.mobileNumber = this.order.shippingDetails.mobileNumber;
        this.shippingMethodDescription = this.order.shippingDetails.shippingName;
        this.specialInstruction = this.order.shippingDetails.specialInstruction;
        this.fileList = this.order.orderAttachment;
        this.orderEmailStatus = this.order.orderEmailStatus;
        this.facebookName = this.order.shippingDetails.facebookName;
        this.isOnlinePayment = this.order.paymentMethodName.indexOf('Bank') === -1 || this.order.paymentMethodName === Utils.ONLINE_PAYMENT.OnlineBanking;
        this.emailText = this.orderEmailStatus.filter(x => x.orderStatusId === this.order.statusId).length >= 1 ? 'Resend' : 'Send';
        console.log(this.fileList);
        if (this.order.statusId === 3 || this.order.statusId === 4) {
          this.orderForm.controls.invoiceNumber.setValidators([Validators.required]);
          this.orderForm.controls.invoiceNumber.updateValueAndValidity();
          this.orderForm.controls.trackingNumber.setValidators([Validators.required]);
          this.orderForm.controls.trackingNumber.updateValueAndValidity();
        }

        if (this.order.paymentStatusId === 3) {
          this.isPaymentStatusDisable = true;
        }

        if (this.order.statusId === 5) {
          this.isUpdateDisabled = true;
          this.isPaymentStatusDisable = true;
        }
        if (this.order.statusId !== 4) {
          this.statusType = this.statusType.filter(x => x.id >= this.order.statusId);
        } else {
          this.statusType = this.statusType.filter(x => x.id === this.order.statusId);
        }


        if (this.fileList.filter(x => x.layawayId === 0 && x.preOrderId === 0).length > 0) {
          this.paymentAttachment = this.fileList.find(x => x.layawayId === 0 && x.preOrderId === 0);
        } else {
          this.paymentAttachment = new FileViewer();
        }

        this.order.orderCart.map((crt: Cart) => {

          const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
            ? crt.product.productImages.find(x => x.isDefaultImage) :
            crt.product.productImages[0];
          crt.product.currentImageUrl = this.productFolder + currentImage.fileName;

          if (crt.preOrder || ((crt.preOrderLayaway && !crt.isLayAway))) {
            crt.isPreOrderNotify = crt.preOrderSchedule.filter(x => !x.isCleared).length > 0;
            crt.preOrderSchedule.map((sched) => {
              sched.paymentTermDesc = Utils.PREORDER_TERM.filter(x => x.code === sched.paymentTerm)[0].description;

              if (sched.paymentTerm === 'DP') {
                sched.dpWithRushFee = sched.amount + crt.rushFee;
                sched.amount = sched.dpWithRushFee;
              }

              if (this.fileList.filter(x => x.isForPreOrder).length > 0) {
                sched.attachment = this.fileList.filter(x => x.preOrderId === sched.id).length > 0
                  ? this.fileList.find(x => x.preOrderId === sched.id) : new FileViewer();
              } else {
                sched.attachment = new FileViewer();
              }
            });
          } else if (crt.preOrderLayaway && crt.isLayAway) {
            crt.isPreOrderNotify = crt.layAwaySchedule.filter(x => !x.isCleared).length > 0;
          }

          const totalPrice = crt.onSale && !(crt.preOrder || (crt.preOrderLayaway && !crt.isLayAway)) ? crt.salesPrice : crt.price;
          crt.totalPrice = totalPrice;
          crt.totalAmount = crt.preOrder || (crt.preOrderLayaway && !crt.isLayAway) ? (crt.origPrice * crt.quantity) + crt.rushFee : (totalPrice * crt.quantity);

          if (crt.isLayAway && !Utils.isNullOrUndefined(crt.layAwaySchedule)) {
            crt.layAwaySchedule.map((sched: LayAwaySchedule) => {

              if (this.fileList.filter(x => x.isForLayaway).length > 0) {
                sched.attachment = this.fileList.filter(x => x.layawayId === sched.id).length > 0
                  ? this.fileList.find(x => x.layawayId === sched.id) : new FileViewer();
              } else {
                sched.attachment = new FileViewer();
              }

            });
          }
        });


        this.subTotal = this.order.shippingDetails.subTotal;
        this.order.withPreOrder = this.order.orderCart.filter(x => x.product.preOrder).length >= 1 ? true : false;
        this.order.layaway = this.order.orderCart.filter(x => x.isLayAway).length >= 1 ? true : false;
        this.order.shippingAmount = this.shippingDetails.shippingAmount;
        this.order.totalPrice = this.shippingDetails.total;
        this.order.discountAmount = this.shippingDetails.discountAmount;
        this.order.amountToPay = this.shippingDetails.amountToPay;
        this.order.insuranceFee = this.shippingDetails.insuranceFee;


        let preOrderSum = 0;
        for (const pre of this.order.orderCart.filter(x => x.preOrder)) {
          preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
        }

        for (const pre of this.order.orderCart.filter(x => x.preOrderLayaway && !x.isLayAway)) {
          preOrderSum = preOrderSum + (pre.origPrice * pre.quantity) + pre.rushFee;
        }

        this.subTotal = preOrderSum > 0 ? preOrderSum : this.order.shippingDetails.subTotal;

        this.order.totalPrice = preOrderSum > 0 ? (this.subTotal - this.order.discountAmount) + this.order.shippingAmount +
        this.order.insuranceFee : this.order.totalPrice;
        // this.computeTotal();
        if (Utils.isNullOrUndefined(this.order.shippingDate)) {
          this.orderForm.controls.shippingDate.setValue(this.datePipe.transform(this.valuedate, 'MM-dd-yyyy'));

        }
        this.orderForm.patchValue(this.order);
      }
    });

  }

  onStatusSelected() {
    if (this.orderForm.controls.statusId.value === 3 || this.orderForm.controls.statusId.value === 4) {
      this.orderForm.controls.shippingDate.setValue(this.datePipe.transform(this.valuedate, 'MM-dd-yyyy'));
      this.orderForm.controls.invoiceNumber.setValidators([Validators.required]);
      this.orderForm.controls.invoiceNumber.updateValueAndValidity();
      this.orderForm.controls.trackingNumber.setValidators([Validators.required]);
      this.orderForm.controls.trackingNumber.updateValueAndValidity();
    } else if (this.orderForm.controls.statusId.value === 5) {
      this.orderForm.controls.invoiceNumber.clearValidators();
      this.orderForm.controls.invoiceNumber.updateValueAndValidity();
      this.orderForm.controls.trackingNumber.clearValidators();
      this.orderForm.controls.trackingNumber.updateValueAndValidity();
    }

    this.emailText = this.orderEmailStatus.filter(x => x.orderStatusId
      === this.orderForm.controls.statusId.value).length >= 1 ? 'Resend' : 'Send';
  }

  uploadFile(fileEvent: any, forLayaway: boolean, layawayId: number, forPreOrder: boolean, preOrderId: number) {

    // this.paymentAttachment = new FileViewer();
    const files = fileEvent.target.files;

    // layaway
    if (this.fileList.filter(x => x.layawayId === layawayId).length > 0 && forLayaway) {
      const index = this.fileList.findIndex(x => x.layawayId === layawayId);
      this.fileList.splice(index, 1);
    }

    // pre order
    if (this.fileList.filter(x => x.preOrderId === preOrderId).length > 0 && forPreOrder) {
      const index = this.fileList.findIndex(x => x.preOrderId === preOrderId);
      this.fileList.splice(index, 1);
    }


    const newFileViewer = new FileViewer();
    newFileViewer.file = files.item(0);
    newFileViewer.fileName = fileEvent.target.files[0].name;
    newFileViewer.isForLayaway = forLayaway;
    newFileViewer.isForPreOrder = forPreOrder;
    if (!Utils.isNullOrUndefined(newFileViewer.file)) {
      this.fileService.upload(newFileViewer.file, this.fileLanding).then((file: FileMapper) => {
        if (!Utils.isNullOrUndefined(file)) {
          newFileViewer.key = file.id;
          newFileViewer.fileUrl = file.fileName;
          newFileViewer.layawayId = layawayId;
          newFileViewer.preOrderId = preOrderId;
          newFileViewer.orderId = this.order.id;
          // newFileViewer.fileName = this.attachmentFolder + file.fileName;
          if (!forLayaway && !forPreOrder) {
            this.paymentAttachment = Utils.isNullOrUndefined(this.paymentAttachment.fileUrl) ? newFileViewer : this.paymentAttachment;
            const reader = new FileReader();
            reader.readAsDataURL(newFileViewer.file);
          } else if (forLayaway) {
            this.order.orderCart.map((crt: Cart) => {
              if (crt.isLayAway) {
                crt.layAwaySchedule.map((sched: LayAwaySchedule) => {
                  sched.attachment = sched.id === layawayId ? newFileViewer : sched.attachment;
                });
              }

            });
          } else if (forPreOrder) {
            this.order.orderCart.map((crt: Cart) => {
              if (crt.preOrder || (crt.preOrderLayaway && !crt.isLayAway)) {
                crt.preOrderSchedule.map((sched: PreOrderSchedule) => {
                  sched.attachment = sched.id === preOrderId ? newFileViewer : sched.attachment;
                });
              }

            });

          }

          this.fileList.push(newFileViewer);

        }
      });
    }


    console.log(this.fileList);
  }
  convert(value: number, rate: number) {
    return (value * rate);
  }
  downloadFile(flv: FileViewer) {
    const fileMapper = new FileMapper();
    fileMapper.fileName = flv.fileUrl;
    fileMapper.attachmentPath = this.fileLanding;
    this.fileService.download(fileMapper).subscribe((file: any) => {

      saveAs(file, flv.fileName);

    });
  }

  save() {

    // if (this.orderForm.controls.statusId.value === 2 && this.orderForm.controls.paymentStatusId.value === 1) {
    //   this.toasterService.alert('danger', 'Order should have a Paid Payment status to be able to update to Processing.');
    //   return;
    // }
    const isOnlinePayment = this.order.paymentMethodName.indexOf('Bank') === -1;
    if (this.orderForm.controls.statusId.value === 5) {
      this.cancelOrder();
    } else {
      if (this.orderForm.controls.statusId.value === 2 && this.orderForm.controls.paymentStatusId.value !== 3) {
        this.toasterService.alert('danger', 'Processing status requires a Paid Payment Status.');
        return;
      }

      // if (this.order.statusId == 2 && this.order.paymentStatusId != 3) {
      //   this.toasterService.alert('danger', 'Processing status requires a Paid Payment Status.');
      //   return;
      // }


      if (!this.orderForm.valid) {
        this.toasterService.alert('danger', 'please fill up required fields.');
        return;
      }

      if (this.orderForm.valid) {
        this.order = this.orderForm.getRawValue();
        this.order.shippingDetails = this.shippingDetails;
        this.order.orderAttachment = this.fileList;
        this.orderService.updateOrder(this.order).then((order: any) => {
          if (!Utils.isNullOrUndefined(order)) {
            this.toasterService.alert('success', 'updating order');
            if (this.orderForm.controls.statusId.value == 4) {
              this.loyaltyService.generateLoyaltyDiscount(this.order);
            }
            this.navigationService.toAdminOrder();
          } else {
            this.toasterService.alert('danger', 'updating order');
          }
        });
      }
    }


  }

  viewLayAway(cart: Cart) {
    this.itemNumber = cart.product.itemNumber;
    this.cart = cart;
  }
  cancelOrder() {
    const dialogQuestion = 'Are you sure to cancel this order?';
    const dialogMessage = 'Order will be cancelled.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      'ShopByzmo Order #' + this.order.id.toString(), // Highlighted text after title = nullable
      dialogDanger, // Danger text after message = nullable
      true
    ).then((confirmed: any) => {
      if (confirmed) {
        if (!this.orderForm.valid) {
          this.toasterService.alert('danger', 'please fill up required fields.');
          return;
        }

        if (this.orderForm.valid) {
          const newOrder = this.orderForm.getRawValue();

          this.order.shippingDetails = this.shippingDetails;
          this.order.orderReason.reason = confirmed;
          this.order.orderReason.orderId = this.order.id;
          this.order.statusId = newOrder.statusId;
          this.order.paymentStatusId = newOrder.paymentStatusId;
          this.order.invoiceNumber = newOrder.invoiceNumber;
          this.order.trackingNumber = newOrder.trackingNumber;
          this.order.shippingDate = newOrder.shippingDate;
          this.order.forLayAway = false;
          this.order.layAwayId = 0;
          this.order.forPreOrder = false;
          this.order.preOrderId = 0;
          this.orderService.adminSendEmail(this.order);
          this.orderService.updateOrder(this.order).then((order: any) => {
            if (!Utils.isNullOrUndefined(order)) {
              this.toasterService.alert('success', 'cancel order');
              this.navigationService.toAdminOrder();
            } else {
              this.toasterService.alert('danger', 'cancel order');
            }
          });
        }


      }
    }).catch(() => { });

  }
  sendEmail(
    layAwayId: number, forLayaway: boolean, preOrderid: number,
    forPreOrder: boolean,
    isSendEmail: boolean, isPrSend: boolean,
    forPr: boolean,
    isPreOrderNotif: boolean = false,
    notifProduct: Product = new Product()) {
    const newOrder = this.orderForm.getRawValue();
    const dialogQuestion = 'Are you sure to send email?';
    const dialogMessage = 'Order info will be send to email.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      'ShopByzmo Order #' + this.order.id.toString(), // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        // for sending of preorder notification always unfulfill status
        this.order.statusId = newOrder.statusId;
        this.order.paymentStatusId = newOrder.paymentStatusId;
        this.order.forLayAway = forLayaway;
        this.order.layAwayId = layAwayId;
        this.order.forPreOrder = forPreOrder;
        this.order.preOrderId = preOrderid;
        this.order.isSendEmail = isSendEmail;
        this.order.isPrSend = isPrSend;
        this.order.forPr = forPr;
        this.order.NotifProduct = notifProduct;
        this.order.forPreOrderNotif = isPreOrderNotif;
        this.emailText = 'Resend';


        // conversion for email
        this.order.orderCart.map((x) => {
          x.totalAmount = this.convert(x.totalAmount, this.order.shippingDetails.currencyRate);
          x.totalPrice = this.convert(x.totalPrice, this.order.shippingDetails.currencyRate);

          if (x.layAway) {
            x.layAwaySchedule.map((sched) => {
              sched.monthly = this.convert(sched.monthly, this.order.shippingDetails.currencyRate);
            });
          }

          if (x.preOrder || (x.preOrderLayaway && !x.isLayAway)) {
            x.preOrderSchedule.map((sched) => {
              sched.amount = this.convert(sched.amount, this.order.shippingDetails.currencyRate);
            });
          }
        });
        this.order.shippingDetails.subTotal = this.convert(this.subTotal, this.order.shippingDetails.currencyRate);
        this.order.totalPrice = this.convert(this.order.totalPrice, this.order.shippingDetails.currencyRate);
        this.order.amountToPay = this.convert(this.order.amountToPay, this.order.shippingDetails.currencyRate);
        this.order.shippingAmount = this.convert(this.order.shippingAmount, this.order.shippingDetails.currencyRate);
        this.order.discountAmount = this.convert(this.order.discountAmount, this.order.shippingDetails.currencyRate);

        this.orderService.adminSendEmail(this.order);
        this.toasterService.alert('success', 'sending email');

        this.order.orderCart.map((crt: Cart) => {
          const currentImage = crt.product.productImages.filter(x => x.isDefaultImage).length > 0
            ? crt.product.productImages.find(x => x.isDefaultImage) :
            crt.product.productImages[0];
          crt.product.currentImageUrl = this.productFolder + currentImage.fileName;
          if (crt.isLayAway) {
            crt.layAwaySchedule.map((sched: LayAwaySchedule) => {
              sched.isSendEmail = sched.id === layAwayId && !forPr ? true : sched.isSendEmail;
              sched.isPrSend = sched.id === layAwayId && forPr ? true : sched.isPrSend;
            });
          }

          if (crt.preOrder || (crt.preOrderLayaway && !crt.isLayAway)) {
            crt.preOrderSchedule.map((sched: PreOrderSchedule) => {
              sched.isSendEmail = sched.id === preOrderid && !forPr ? true : sched.isSendEmail;
              sched.isPrSend = sched.id === preOrderid && forPr ? true : sched.isPrSend;
            });
          }
          if (isPreOrderNotif) {
            if (crt.product.id == notifProduct.id) {
              crt.isNotifSend = true;
            }
          }
        });


        if (this.orderEmailStatus.filter(x => x.orderStatusId === this.order.statusId).length === 0) {
          const emailStatus = new OrderEmailStatus();
          emailStatus.orderId = this.order.id;
          emailStatus.orderStatusId = this.order.statusId;
          emailStatus.emailAddress = this.order.shippingDetails.email;
          emailStatus.dateTime = this.order.dateOrder;

          this.orderEmailStatus.push(emailStatus);
        }



        // this.navigationService.toAdminOrder();
      }
    }).catch(() => { });

  }

  updatePaymentLayawaySchedule(layaway: LayAwaySchedule) {
    this.paymentService.updatePaymentLayawaySchedule(layaway).then(() => {
      this.toasterService.alert('success', 'save successfuly');
    }).catch((error) => {
      this.toasterService.alert('danger', error.statusText);
    });

  }
  updatePaymentPreOrderSchedule(preOrder: PreOrderSchedule) {


    this.paymentService.updatePaymentPreOrderSchedule(preOrder).then(() => {
      this.toasterService.alert('success', 'save successfuly');
    }).catch((error) => {
      this.toasterService.alert('danger', error.statusText);
    });

  }


  sendNotify(cart: Cart) {
    const dialogQuestion = 'Are you sure to send email?';
    const dialogMessage = 'Will be send Notification to email.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      'ShopByzmo Order #' + this.order.id.toString(), // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        const notify = new PreOrderNotification();
        notify.customerName = this.order.customerName;
        notify.email = this.order.email;
        notify.orderId = this.order.id;
        notify.productId = cart.product.id;
        notify.productName = cart.product.productName;

        this.orderService.sendPreOrderNotification(notify).then((res) => {
          if (res) {
            cart.isNotifSend = true;
            this.toasterService.alert('success', 'Send successfuly');
          } else {
            this.toasterService.alert('danger', 'Error while sending your email please try again later.');
          }
        }).catch(() => {
          this.toasterService.alert('danger', 'Error while sending your email please try again later.');
        });
      }
    });

  }
}
