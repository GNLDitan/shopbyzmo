import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmbedVideoService {

  videoType: string;

  constructor() {
    this.videoType = '';
  }

  embedVideo(url: string) {

    if (url != '') {
      let embeddedUrl = '';

      if (url.indexOf('/www.youtube.com') > -1) {
        let results = url.match("v=([a-zA-Z0-9_]+)&?")
        let videoId = results[1];

        return embeddedUrl = 'https://www.youtube.com/embed/' + videoId;
      } else if (url.indexOf('/vimeo.com') > -1) {
        var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;

        var match = url.match(regExp);

        if (match) {
          let videoId = match[5];
          return embeddedUrl = '//player.vimeo.com/video/' + videoId;
        }
      }

      else if (url.indexOf('/www.facebook.com') > -1) {

        return embeddedUrl = 'https://www.facebook.com/plugins/video.php?href=' + url;

      }
      else if (url.indexOf('/www.dailymotion.com') > -1) {
        var daily = url.match(/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/);
        var videoId;
        if (daily !== null) {
          if (daily[4] !== undefined) {
            videoId = daily[4];
          }
          videoId = daily[2];
        }
        return embeddedUrl = 'https://www.dailymotion.com/embed/video/' + videoId;
      }



    } else {
      return '';
    }

  }
}
