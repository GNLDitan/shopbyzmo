import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { FileMapper } from '../classes/file-mapper';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  api: string;
  constructor(private http: HttpClient) {
    this.api = '/file';
  }

  upload(file: File, fileLanding: string) {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('fileLanding', fileLanding);

    let httpHeaders: HttpHeaders = new HttpHeaders();
    httpHeaders = httpHeaders.set('Content-Type', 'multipart/form-data');

    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/upload`, formData, { headers: httpHeaders })
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  download(file: FileMapper) {
    return this.http.post(`${this.api}/download`, file, { responseType: 'blob' });
  }

}
