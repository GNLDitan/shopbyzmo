import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { EmbedVideoService } from '../services/embed-video.service';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer,
    private embedVideoService: EmbedVideoService) { }
  transform(url) {

    var value = this.embedVideoService.embedVideo(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

}
