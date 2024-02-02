import { Component, OnInit, OnDestroy, Sanitizer, Inject, PLATFORM_ID } from '@angular/core';

import { LandingService } from 'src/app/services/landing.service';
import { environment } from 'src/environments/environment';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { FileMapper } from 'src/app/classes/file-mapper';
import { trigger, transition, animate, style } from '@angular/animations';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Utils } from 'src/app/app.utils';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import * as e from 'express';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  animations: [
    trigger('animateSplash', [
      transition('void => *', [
        style({ opacity: 0 }), animate('1s', style({ opacity: 1 }))
      ]), transition('* => void', [
        animate('1s', style({ opacity: 0 }))
      ])
    ]), trigger('blockInitAnimation', [
      transition(':enter', [])
    ])
  ]
})
export class LandingComponent implements OnInit, OnDestroy {

  imageBlobs: ImageViewer[];
  tempImages: string[];
  environment: any;
  public splashIndex: number;
  public landings: Array<FileMapper>;
  landingImageFolderPath: string;
  private resetObservable: Subject<any>;

  constructor(private landingService: LandingService,
    public sanitization: DomSanitizer,
    @Inject(DOCUMENT) private document,
    @Inject(PLATFORM_ID) private platformId: Object,) {

    this.imageBlobs = [];
    this.environment = environment;
    this.landingImageFolderPath = environment.landingFolderPath;
    this.landings = new Array<FileMapper>();
    this.splashIndex = 1;
    this.resetObservable = new Subject();

  }


  ngOnInit() {
    this.tempImages = [''];
    if (isPlatformBrowser(this.platformId)) {
      this.landingService.getlandingimages().then((success: Array<FileMapper>) => {
        this.imageBlobs = [];
        if (success.length > 0) {
          this.landings = success;
          this.tempImages = [];
          this.splashInterval();
          this.landings.map((images) => {
            //const image = new ImageViewer();

            images.fullPath = this.landingImageFolderPath + images.fileName;
            this.tempImages.push(images.fullPath);
          });
        }
      }, (error) => {
        console.log(error.error);
      });
    }
  }

  ngOnDestroy() {
    this.resetObservable.complete();
  }

  splashInterval() {
    interval(8000)
      .pipe(takeUntil(this.resetObservable))
      .subscribe(() => {
        this.splashIndex = this.splashIndex >= this.landings.length ? 1 : (++this.splashIndex);
      });
  }

  slideshow(type: string) {
    switch (type) {
      case 'back':
        this.splashIndex = this.splashIndex > 1 ? this.splashIndex - 1 : this.landings.length;
        break;
      case 'next':
        this.splashIndex = this.splashIndex < this.landings.length ? this.splashIndex + 1 : 1;
        console.log(this.tempImages);
        break;
    }
    this.resetInterval();
  }

  resetInterval() {
    this.resetObservable.next();
    this.splashInterval();
  }

  openUrl(url: string, isnewtab: boolean) {
    if(isnewtab)
       Utils.openUrl(url);
    else
      this.document.location.href = url;
  }


}
