import { AfterViewInit, Input, Component, Inject } from '@angular/core';
import { env } from 'process';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'fb-like',
  template: `<div class="fb-like" [attr.data-href]="url" data-layout="button_count" data-action="like" data-show-faces="true" data-share="true"></div>`
})


export class FacebooklikeComponent implements AfterViewInit {
  @Input() url = location.href;

  constructor(@Inject(DOCUMENT) private document) {
    // initialise facebook sdk after it loads if required
    if (!window['fbAsyncInit']) {
      window['fbAsyncInit'] = function () {
        window['FB'].init({
          appId: env.facebookLoginProvider,
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v3.0'
        });
      };
    }

    // load facebook sdk if required
    const url = 'https://connect.facebook.net/en_US/sdk.js';
    if (!this.document.querySelector(`script[src='${url}']`)) {
      let script = this.document.createElement('script');
      script.src = url;
      this.document.body.appendChild(script);
    }
  }

  ngAfterViewInit(): void {
    // render facebook button
    window['FB'] && window['FB'].XFBML.parse();
  }
}