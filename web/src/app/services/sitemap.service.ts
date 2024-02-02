import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import xml2js from 'xml2js';
import { Sitemap } from '../classes/sitemap';
import { SitemapProc } from '../enums/sitemap-proc.enum';

@Injectable({
  providedIn: 'root'
})
export class SitemapService {
  api: string;

  constructor(private http: HttpClient) {
    this.api = '/sitemap';
  }

  sitemapHandler(newUrl: Sitemap, process: SitemapProc) {
    this.http.get('/sitemap.xml',
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'text/xml')
          .append('skip', "true")
          .append('Access-Control-Allow-Methods', 'GET')
          .append('Access-Control-Allow-Origin', '*')
          .append('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method"),
        responseType: 'text'
      })
      .subscribe((data) => {
        this.parseXML(data, newUrl, process)
          .then((data: string) => {
            if (data) {
              this.modifySitemap(data);
            }
          });
      });
  }

  parseXML(data, newUrl: Sitemap, process: SitemapProc) {
    return new Promise(resolve => {
      const arr = [];
      const parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });

      parser.parseString(data, function (err, result) {
        if (result) {
          if (process === SitemapProc.add) {
            result.urlset.url.push(newUrl);
          } else if (process === SitemapProc.remove) {
            result.urlset.url.forEach((elem, idx) => {
              if(elem.loc[0].toLowerCase() === newUrl.loc[0].toLowerCase()) {
                result.urlset.url.splice(idx, 1);
              }
            });
          } else {
            resolve(null);
          }

          var builder = new xml2js.Builder();
          var xml = builder.buildObject(result);

          resolve(xml);
        } else {
          resolve(null);
        }
      });
    });
  }  

  modifySitemap(pXml: string) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/modifysitemap`, { xml: pXml })
        .subscribe(next => resolve(next), error => reject(error));
    });
  }
}
