import { Component, OnInit, Input, SimpleChange, OnChanges, AfterViewInit, Inject } from '@angular/core';
import { Utils } from 'src/app/app.utils';
import { DOCUMENT } from '@angular/common';
import { ImageViewer } from 'src/app/classes/image-viewer';

declare const Event: any;
declare const Magnifier: any;


@Component({
  selector: 'app-thumb-image-feature',
  templateUrl: './thumb-image-feature.component.html',
  styleUrls: ['./thumb-image-feature.component.scss']
})
export class ThumbImageFeatureComponent implements OnInit, OnChanges {
  @Input() inputfeatureImg: string;
  @Input() inputImages: any;
  featureImg: string;
  selectedImage: string;
  images: Array<ImageViewer>;

  constructor(@Inject(DOCUMENT) private document) { }

  ngOnInit() {
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    const parent = this;
    if (changes.hasOwnProperty('inputImages')) {
      this.images = changes.inputImages.currentValue.length > 0 ? changes.inputImages.currentValue : changes.inputImages.previousValue;
    }
    if (changes.inputfeatureImg.previousValue !== changes.inputfeatureImg.currentValue) {
      this.featureImg = changes.inputfeatureImg.currentValue;
    }
  }
  magnify(imgID, zoom) {
    var img, glass, w, h, bw;
    img = document.getElementById(imgID);
    /*create magnifier glass:*/
    let magnifierElem = document.getElementsByClassName('img-magnifier-glass');
    if (magnifierElem.length > 0) {
      let parent = document.getElementById('myimageParent');
      parent.removeChild(magnifierElem[0])
    };

    glass = document.createElement("DIV");
    glass.setAttribute("class", "img-magnifier-glass");
    /*insert magnifier glass:*/
    img.parentElement.insertBefore(glass, img);
    /*set background properties for the magnifier glass:*/
    glass.style.backgroundImage = "url('" + img.src + "')";
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize =
      img.width * zoom + "px " + img.height * zoom + "px";
    bw = 3;
    w = glass.offsetWidth / 3;
    h = glass.offsetHeight / 3;
    /*execute a function when someone moves the magnifier glass over the image:*/
    glass.addEventListener("mousemove", moveMagnifier);
    img.addEventListener("mousemove", moveMagnifier);
    /*and also for touch screens:*/
    glass.addEventListener("touchmove", moveMagnifier);
    img.addEventListener("touchmove", moveMagnifier);
    function moveMagnifier(e) {
      var pos, x, y;
      /*prevent any other actions that may occur when moving over the image*/
      e.preventDefault();
      /*get the cursor's x and y positions:*/
      pos = getCursorPos(e);
      x = pos.x;
      y = pos.y;
      /*prevent the magnifier glass from being positioned outside the image:*/
      if (x > img.width - w / zoom) {
        x = img.width - w / zoom;
      }
      if (x < w / zoom) {
        x = w / zoom;
      }
      if (y > img.height - h / zoom) {
        y = img.height - h / zoom;
      }
      if (y < h / zoom) {
        y = h / zoom;
      }
      /*set the position of the magnifier glass:*/
      glass.style.left = x - w + "px";
      glass.style.top = y - h + "px";
      /*display what the magnifier glass "sees":*/
      glass.style.backgroundPosition =
        "-" + (x * zoom - w + bw) + "px -" + (y * zoom - h + bw) + "px";
    }
    function getCursorPos(e) {
      var a,
        x = 0,
        y = 0;
      e = e || window.event;
      /*get the x and y positions of the image:*/
      a = img.getBoundingClientRect();
      /*calculate the cursor's x and y coordinates, relative to the image:*/
      x = e.pageX - a.left;
      y = e.pageY - a.top;
      /*consider any page scrolling:*/
      x = x - window.pageXOffset;
      y = y - window.pageYOffset;
      return { x: x, y: y };
    }
  }

  removeMagnify() {
    let parent = document.getElementById('myimageParent');
    let magnifierElem = document.getElementsByClassName('img-magnifier-glass');
    if (magnifierElem.length > 0)
      parent.removeChild(magnifierElem[0])

  }

  openModal() {
    this.selectedImage = this.featureImg;
    this.document.body.classList.add('goofy');
  }

  closeModal() {
    this.selectedImage = null;
    this.document.body.classList.remove('goofy');
  }

  next() {
    let index = this.getCurrentImageIndex();
    index++;
    if (index < this.images.length)
      this.selectedImage = this.images[index].imageUrl;
  }

  previous() {
    let index = this.getCurrentImageIndex();
    index--;
    if (index >= 0)
      this.selectedImage = this.images[index].imageUrl;
  }

  getCurrentImageIndex() {
    let image = this.images.filter(x => x.imageUrl == this.selectedImage)[0];
    return this.images.indexOf(image);
  }
}
