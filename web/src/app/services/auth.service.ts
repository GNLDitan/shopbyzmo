import { Injectable } from '@angular/core';
import { User } from '../classes/user';
import { Utils } from '../app.utils';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private token: string;
  private guestToken: string;
  constructor(private http: HttpClient) { }

  validateUser() {
    this.token = localStorage.getItem(Utils.LS_TOKEN);
    this.guestToken = localStorage.getItem(Utils.LS_GUESTTOKEN);

    return (this.token != null || this.guestToken != null);
  }

  login(user: User) {
    return new Promise((resolve, reject) => {
      this.token = localStorage.getItem(Utils.LS_TOKEN);

      if (!Utils.isStringNullOrEmpty(this.token)) {
        resolve(null);
      }

      this.createAuthenticationToken(user).then((data: any) => {
        localStorage.setItem(Utils.LS_TOKEN, data.token);
        localStorage.setItem(Utils.LS_EMAIL, data.email);

        resolve(data.isAdmin);
      }, (error) => {
        reject(error);
      });
    });
  }

  logout() {
    localStorage.removeItem(Utils.LS_TOKEN);
    localStorage.removeItem(Utils.LS_EMAIL);
  }

  createAuthenticationToken(user: User) {
    return new Promise((resolve, reject) => {
      this.http.post('/user/authenticate', user)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }


  loginGuestToken() {
    return new Promise((resolve, reject) => {
      this.http.get('/user/loginguesttoken')
        .subscribe((data: any) => {
          localStorage.setItem(Utils.LS_GUESTTOKEN, data.token);
          resolve(data);
        }, (error) => reject(error));
    });
  }

  logoutGuest() {
    localStorage.removeItem(Utils.LS_GUESTTOKEN);
  }
}
