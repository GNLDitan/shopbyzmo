import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../classes/product';
import { ImageViewer } from '../classes/image-viewer';
import { FileMapper } from '../classes/file-mapper';
import { FileService } from './file.service';
import { Utils } from '../app.utils';
import { Tag } from '../classes/tag';
import { ProductInventory } from '../classes/product-inventory';
import { FilterSetting } from '../classes/filter-settings';
import { LayAway } from '../classes/layaway';
import { LayAwayDates } from '../classes/layaway-date';
import { DataService } from './data.service';
import { Discount } from '../classes/discount';
import { PreOrderSchedule } from '../classes/pre-order-schedule';
import { UserProductNotification } from '../classes/user-product-notification';
import { ProductCategory } from '../classes/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  api: string;
  fileLanding: string;

  constructor(private http: HttpClient,
    private fileService: FileService,
    private dataService: DataService) {
    this.api = '/product';
    this.fileLanding = Utils.FILE_LANDING.product;
  }

  getProducts() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getproducts`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getProductsListRange(filter: FilterSetting) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getproductslistrange`, filter)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getProductById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getproductbyid/${id}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  getProductByLinkName(linkname: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getproductbylinkname/${linkname}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  addProduct(product: Product, blobRecords: ImageViewer[]) {
    const productImages = new Array<FileMapper>();
    return new Promise((resolve, reject) => {
      let index = 0;
      for (const record of blobRecords) {
        this.fileService.upload(record.file, this.fileLanding).then((file: FileMapper) => {
          file.isDefaultImage = record.isDefaultImage;
          productImages.push(file);

          if (index === blobRecords.length - 1) {
            this.http.post(`${this.api}/createproduct`, product)
              .subscribe((next: any) => {
                productImages.map((pimg: any) => {
                  pimg.key = next.id;
                  if (pimg.isDefaultImage) {
                    product.currentImageUrl = pimg.fileName;
                  }
                });

                this.createProductImages(productImages).then(() => {
                  this.updateDefaultImage(product);
                });;
                resolve(next);
              }, error => reject(error));
          }
          index++;
        });
      }
    });
  }


  updateProduct(product: Product, blobRecords: ImageViewer[], removedTags: Tag[]) {
    const productImages = new Array<FileMapper>();
    removedTags = removedTags.filter(x => x.id > 0);
    const imageBlobs = blobRecords.filter(x => x.file != null);
    const defaultImg = blobRecords.filter(x => x.isDefaultImage)[0];
    return new Promise((resolve, reject) => {
      if (imageBlobs.length > 0) {
        let index = 0;
        for (const record of imageBlobs) {
          this.fileService.upload(record.file, this.fileLanding).then((file: FileMapper) => {
            if (!Utils.isNullOrUndefined(file)) {
              file.isDefaultImage = record.isDefaultImage;
              productImages.push(file);
            }
            if (index === imageBlobs.length - 1) {
              this.http.patch(`${this.api}/updateproduct`, product)
                .subscribe((next: any) => {
                  productImages.map((pimg: any) => {
                    pimg.key = next.id;
                  });

                  productImages.filter(x => x.isDefaultImage)
                    .map((img) => {
                      defaultImg.imageUrl = img.fileName;
                      product.currentImageUrl = img.fileName;
                    });

                  product.currentImageUrl = Utils.isNullOrUndefined(product.currentImageUrl) ? defaultImg.imageUrl : product.currentImageUrl;

                  if (!Utils.isNullOrUndefined(productImages)) {
                    this.createProductImages(productImages).then(() => {
                      this.updateDefaultImage(product);
                    });
                  }

                  if (removedTags.length > 0) {
                    this.deleteProductTags(removedTags);
                  }

                  resolve(next);
                }, error => reject(error));
            }
            index++;
          });
        }
      } else {
        product.currentImageUrl = defaultImg == null ? '' : defaultImg.imageUrl;
        if (!Utils.isNullOrUndefined(product.currentImageUrl)) {
          this.updateDefaultImage(product);
        }
        this.http.patch(`${this.api}/updateproduct`, product)
          .subscribe((data: any) => {
            if (removedTags.length > 0) {
              this.deleteProductTags(removedTags);
            }
            resolve(data);
          }, (error) => reject(error));
      }
    });
  }

  createProductImages(fileImages: Array<FileMapper>) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createproductimages`, fileImages)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  updateDefaultImage(product: Product) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/updatedefaultimg`, product)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  removeProductImages(imgUrls: any) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/removeproductimages`, imgUrls)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteProductTags(tags: Tag[]) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteproducttags`, tags)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createProductTags(tags: Tag[]) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createproducttags`, tags)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getTopTags(tag) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/gettoptags/${tag}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createInventory(inventory: ProductInventory) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createinventory`, inventory)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  getInventoryByProductId(productid: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getinventorybyproductid/${productid}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteProductById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteproductbyid`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  checkItemNumberValidity(product: Product) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/checkitemnumbervalidity`, product)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  getLayAway() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getlayaway`)
        .subscribe((data: any) => {
          this.dataService.setLayAwayAndDates(data, this.dataService.allLayAwayDates);
          resolve(data);
        }, (error) => reject(error));
    });
  }

  getLayById(id: any) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getlayawaybyid`, { id })
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  createProductlayaway(layaway: LayAway) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createproductlayaway`, layaway)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updateProductLayAway(layaway: LayAway) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updateproductlayaway`, layaway)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteProductLayAway(layaway: LayAway) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteproductlayaway`, layaway)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  getProductsListByCatCode(code: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getproductslistbycatcode/${code}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  getActivelayaway() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getActiveLayAway/`)
        .subscribe((data: any) => {
          this.dataService.setLayAwayAndDates(data, this.dataService.allLayAwayDates);
          resolve(data);
        }, (error) => reject(error));
    });

  }

  createLayAwayDates(layaway: LayAwayDates) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createlayawaydates`, layaway)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }
  deleteLayAwayDates(layaway: LayAwayDates) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deletelayawaydates`, layaway)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getLayAwayDates() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getlayawaydates/`)
        .subscribe((data: any) => {
          this.dataService.setLayAwayAndDates(this.dataService.allLayAway, data);
          resolve(data);
        }, (error) => reject(error));
    });

  }

  createDiscount(discount: Discount) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/creatediscount`, discount)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getDiscountListRange(filter: FilterSetting) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getdiscountlistrange`, filter)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  deleteDiscountById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deletediscountbyid`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  getDiscountById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getdiscountbyid/${id}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getDiscountByCode(code: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getdiscountbycode/${code}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  getAllDiscountByCode(code: string) {
    let discount = new Discount()
    discount.code = code;
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getalldiscountbycode`, discount)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  updateDiscount(discount: Discount) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updatediscount`, discount)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getProductRelated(filter: FilterSetting) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getproductrelated`, filter)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  updateSendProductNotification(notif: UserProductNotification) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/updatesendproductnotification`, notif)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }


  sendProductNotification(notif: UserProductNotification) {
    return new Promise((resolve, reject) => {
      this.http.post(`/email/sendproductnotification`, notif)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }




  generatePreOrderSchedule(price: number, downpayment: number, shippingAmoung: number, productId: number, quantity: number) {
    const pterm = Utils.PREORDER_TERM;
    const rBal = (price * quantity) - (downpayment * quantity);
    const amountList: number[] = [(downpayment * quantity), rBal, shippingAmoung];
    const schedList = new Array<PreOrderSchedule>();

    for (let a = 0; a < pterm.length - 1; a++) {
      const sched = new PreOrderSchedule();
      sched.paymentTerm = pterm[a].code;
      // sched.paymentTermDesc = pterm[a].description;
      sched.amount = amountList[a];
      sched.isCleared = false;
      sched.productId = productId;
      if (sched.amount > 0) {
        schedList.push(sched);
      }
    }
    return schedList;
  }

  moveCategoryOrderId(productCategory: ProductCategory) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/movecategoryorderid`, productCategory)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }
}
