import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResetToken } from '../classes/reset-token';

@Injectable({
  providedIn: 'root'
})
export class ResetTokenService {

  private readonly api: string;

  constructor(private http: HttpClient) {
    this.api = '/resettoken';
  }

  isTokenValid(resetToken: ResetToken) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/istokenvalid`, resetToken)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }
}
