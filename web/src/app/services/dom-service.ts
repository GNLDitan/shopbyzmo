import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})

export class DomService {

    constructor(@Inject(DOCUMENT) private dom) { }

    setCanonicalURL(url?: string) {
        var element: HTMLLinkElement = this.dom.querySelector(`link[rel='canonical']`) || null

        if (element === null) {
            const canURL = url == undefined ? this.dom.URL : url;
            const link: HTMLLinkElement = this.dom.createElement('link');
            link.setAttribute('rel', 'canonical');
            link.setAttribute('href', canURL);
            this.dom.head.appendChild(link);
        } else {
            element.setAttribute('rel', 'canonical')
            element.setAttribute('href', url)
        }
    }
    
    setDnsPrefetch(url?: string) {
        const dnsUrl = url == undefined ? this.dom.URL : url;
        const link: HTMLLinkElement = this.dom.createElement('link');
        link.setAttribute('rel', 'dns-prefetch');
        link.setAttribute('href', dnsUrl);
        this.dom.head.appendChild(link);
    }

    setH1Body(text: string) {
        var h1: HTMLElement = this.dom.querySelector('.byz-h1hidden') || null
        
        if (h1 === null) {
            const cH1: HTMLElement = this.dom.createElement('h1');
            cH1.classList.add('byz-h1hidden');
            cH1.appendChild(this.dom.createTextNode(text));
            this.dom.body.insertBefore(cH1, this.dom.body.firstChild);
        } else {
            h1.textContent = text;
        }
    }
}