import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { Utils } from '../app.utils';
import * as e from 'express';
import { concat } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class IpService {

  constructor(
    private http: HttpClient,
    private dataService: DataService) { }

  public getIPAddress() {
    var browserid = localStorage.getItem(Utils.LS_BROWSERTOKEN);
    if (browserid == null) {
      return this.http.get('https://jsonip.com').subscribe((res: any) => {
        if (res != null && res.ip !== '') {
          const ipVar = res.ip.replace(/[^a-z0-9]/gi, '');
          this.dataService.setIP(ipVar);
          localStorage.setItem(Utils.LS_BROWSERTOKEN, ipVar);
        } else {
          let unq = new Date().getUTCMilliseconds().toString();
          let id = Utils.getUniqueNo().toString();
          this.dataService.setIP(unq + id);
          localStorage.setItem(Utils.LS_BROWSERTOKEN, unq + id);
        }
      }, (error) => {

        let unq = new Date().getUTCMilliseconds().toString();
        let id = Utils.getUniqueNo().toString();
        this.dataService.setIP(unq + id);
        localStorage.setItem(Utils.LS_BROWSERTOKEN, unq + id);
      });
    } else {
      this.dataService.setIP(browserid);
    }

  }

}
