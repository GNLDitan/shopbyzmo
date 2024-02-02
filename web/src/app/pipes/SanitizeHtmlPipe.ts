import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Utils } from '../app.utils';

@Pipe({
    name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }
    transform(value: any): any {
        if (!Utils.isNullOrUndefined(value))
            value = Utils.modifyDomClass(value, 'byz-custom-p');

        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
}
