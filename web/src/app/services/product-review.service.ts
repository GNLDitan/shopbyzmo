import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ProductReviewService {
    api: string;
    fileLanding: string;

    constructor(private http: HttpClient) {
        this.api = '/productreview';
        // this.fileLanding = Utils.FILE_LANDING.product;
    }

    getProjectReviewById(productId: number) {
        return new Promise((resolve, reject) => {
          this.http.get(`${this.api}/getprojectreviewbyid/${productId}`)
            .subscribe((data: any) => resolve(data), (error) => reject(error));
        });
    }

}