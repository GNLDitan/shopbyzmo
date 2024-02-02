import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable()
export class SEOService {
    constructor(private title: Title, private meta: Meta) { }


    updateTitle(title: string) {
        this.meta.updateTag({ property: 'og:title', content: title })
    }

    updateOgUrl(url: string) {
        this.meta.updateTag({ property: 'og:url', content: url })
    }

    updateDescription(desc: string) {
        this.meta.updateTag({ property: 'og:description', content: desc })
    }
    updateImage(img: string) {
        this.meta.updateTag({ property: 'og:image', content: img })
    }
}