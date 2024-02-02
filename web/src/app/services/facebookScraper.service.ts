import { Injectable, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Utils } from '../app.utils';
import { isNullOrUndefined } from 'util';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { WindowRefService } from './windowsRef.service';

declare const FB: any;

@Injectable({
    providedIn: 'root'
})
export class FacebookScraperService {

    public accessToken: string;

    constructor(private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: any,
        @Inject(DOCUMENT) private document,
        public window: WindowRefService) {

        if (isPlatformBrowser(this.platformId)) {

            FB.init({
                appId: environment.facebookLoginProvider,
                status: true,
                xfbml: true,
                version: 'v7.0'
            });

            //** facebook sdk script **//
            // const url = 'https://connect.facebook.net/en_US/sdk.js';
            // if (!this.document.querySelector(`script[src='${url}']`)) {
            //     let script = this.document.createElement('script');
            //     script.src = url;
            //     this.document.body.appendChild(script);
            // }
        }
    }

    authFacebookCredential() {
        let facebookToken = localStorage.getItem(Utils.LS_FACEBOOKACCESSTOKEN)

        if (isNullOrUndefined(facebookToken)) {
            this.createAccessToken().then((token: string) => {
                localStorage.setItem(Utils.LS_FACEBOOKACCESSTOKEN, token)
            })
        }

    }

    getLongLiveToken() {
        return new Promise((success, error) => {
            try {
                FB.api(' https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&', 'GET',
                    {
                        'client_id': environment.facebookLoginProvider,
                        'client_secret': environment.facebookAppkey,
                        'fb_exchange_token': 'client_credentials'
                    },
                    function (response) {
                        success(response.access_token);
                    });
            } catch (ex) {
                error(ex);
            }
        })
    }

    createAccessToken() {
        return new Promise((success, error) => {
            try {
                FB.api('https://graph.facebook.com/oauth/access_token', 'GET',
                    {
                        'client_id': environment.facebookLoginProvider,
                        'client_secret': environment.facebookAppkey,
                        'grant_type': 'client_credentials'
                    },
                    function (response) {
                        success(response.access_token);
                    });
            } catch (ex) {
                error(ex);
            }
        })
    }


    getLoginStatus() {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                var accessToken = response.authResponse.accessToken;
            }
        });
    }

    scraper(url: string) {

        return new Promise((success, error) => {
            try {
                FB.api('/', 'POST',
                    {
                        "scrape": "true",
                        "id": url,
                        'access_token': environment.longLiveAccessToken
                    },
                    function (response) {
                        success(response)
                        console.log(response)
                    });
            } catch (ex) {
                error(ex)
            }
        })
    }
}
