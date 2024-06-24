import { Component, OnInit, Input, Inject, PLATFORM_ID, OnDestroy, SimpleChange } from '@angular/core';
import { ProductReviewService } from 'src/app/services/product-review.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss']
})
export class ProductReviewsComponent implements OnInit, OnDestroy {
  orderProductRates: Array<any>;

  constructor(private productReviewService: ProductReviewService,
    public route: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMaps: any) => {
      const id = paramMaps.params.id;
      const productId = id.split('-')[1];
      this.productReviewService.getProjectReviewById(productId).then((result: any) => {
        this.orderProductRates = result
        console.log(result)
      })
    })
  }

  ngOnDestroy() {
   
  }


  calcDate(date1) {
    var date2 = new Date() as any;
    date1 = new Date(date1);
    var diff = Math.floor(date1.getTime() - date2.getTime());
    var day = 1000 * 60 * 60 * 24;

    var minutes = Math.floor((diff / 1000) / 60);
    var hrs = Math.abs(date1 - date2) / 36e5;
    var days = Math.floor(diff / day);
    var months = Math.floor(days / 31);
    var years = Math.floor(months / 12);
    var message = date2.toDateString();

    if (Math.abs(years) > 1) {
      message = Math.abs(years) + " years ago."
    } else if (Math.abs(months) > 1) {
      message = Math.abs(months) + " months ago."
    } else if (Math.abs(days) > 1) {
      message = Math.abs(days) + " days ago."
    } else if (hrs > 1) {
      message = Math.round(hrs) + " hours ago."
    } else {
      message = Math.abs(minutes) + " minutes ago."
    }

    return message
  }

}
