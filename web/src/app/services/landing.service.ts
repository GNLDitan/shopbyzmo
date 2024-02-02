import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileService } from './file.service';
import { FileMapper } from '../classes/file-mapper';
import { ImageViewer } from '../classes/image-viewer';
import { Utils } from '../app.utils';

@Injectable({
  providedIn: 'root'
})
export class LandingService {

  private readonly api: string;
  private readonly imageType: string;
  fileLanding: string;

  constructor(private fileService: FileService, private http: HttpClient) {

    this.api = '/landing';
    this.imageType = 'landing';
    this.fileLanding = Utils.FILE_LANDING.landing;
  }

  getlandingimages() {
    return new Promise((resolve, reject) => {
      this.http.get(this.api)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  moveOrderId(landing: FileMapper) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/moveorderid`, landing)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  createLanding(landingImageFile: ImageViewer, landing: FileMapper) {
    return new Promise((resolve, reject) => {
      this.fileService.upload(landingImageFile.file, this.fileLanding).then((landingimg: FileMapper) => {
        landing.fileName = landingimg.fileName;
        landing.key = landingimg.id;

        this.http.post(`${this.api}/createlanding`, landing)
          .subscribe(next => resolve(next), error => reject(error));
      }, error => reject(error));
    });
  }

  getLandingImageById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getlandingimagebyid/${id}`)
        .subscribe((data: any) => resolve(data), (error) => reject(error));
    });
  }

  editLanding(landingImageFile: ImageViewer, landing: FileMapper) {
    return new Promise((resolve, reject) => {
      if (!Utils.isNullOrUndefined(landingImageFile.file)) {
        this.fileService.upload(landingImageFile.file, this.fileLanding).then((landingimg: FileMapper) => {
          landing.fileName = landingimg.fileName;
          landing.key = landingimg.id;

          this.updateLanding(landing).then(landing => resolve(landing), error => reject(error));
        }, error => reject(error));
      } else {
        this.updateLanding(landing).then(landing => resolve(landing), error => reject(error));
      }

    });
  }

  updateLanding(landing: FileMapper) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updatelanding`, landing)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  deleteLandingImageById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deletelandingimagebyid`, id)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

}
