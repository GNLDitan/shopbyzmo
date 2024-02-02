import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { environment } from 'src/environments/environment';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
@Component({
  selector: 'app-slick-product-image',
  templateUrl: './slick-product-image.component.html',
  styleUrls: ['./slick-product-image.component.scss']
})
export class SlickProductImageComponent implements OnInit {
  @Output() setFeatureImg: EventEmitter<string>;
  @Input() imageBlobs: ImageViewer[];

  @ViewChild('slickModal', { static: false }) slickModal: SlickCarouselComponent;

  productFolder: string;
  slideConfig = {
    "slidesToShow": 5,
    "slidesToScroll": 1,
    "nextArrow": "<div class='product-nav-btn next-slide'></div>",
    "prevArrow": "<div class='product-nav-btn prev-slide'></div>",
    "dots": false,
    "infinite": false,
    "vertical": true,
    "verticalSwiping": true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.3,
          slidesToScroll: 2,
          infinite: true,
          dots: false,
          vertical: true,
          verticalSwiping: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2.3,
          slidesToScroll: 2,
          vertical: false,
          verticalSwiping: false,
          variableWidth: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2.3,
          slidesToScroll: 2,
          vertical: false,
          verticalSwiping: false,
          variableWidth: false
        }
      }
    ]
  };

  constructor() {
    this.setFeatureImg = new EventEmitter();
    this.productFolder = environment.productFolderPath;
  }

  ngOnInit() {
  }


  removeSlide() {
    this.imageBlobs.length = this.imageBlobs.length - 1;
  }

  setDefaultImage(index: number) {
    this.setFeatureImg.emit(this.imageBlobs[index].imageUrl)
  }

  next() {
    this.slickModal.slickNext();
  }

  prev() {
    this.slickModal.slickPrev();
  }

}
