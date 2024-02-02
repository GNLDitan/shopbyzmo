import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../classes/user';
import { Address } from '../classes/address';
import { Utils } from '../app.utils';
import { UserWishlist } from '../classes/user-wishlist';
import { DataService } from './data.service';
import { UserProductNotification } from '../classes/user-product-notification';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly api: string;
  private token: string;
  constructor(private http: HttpClient,
    private dataService: DataService) {
    this.api = '/user';
  }

  validateUser() {
    this.token = localStorage.getItem(Utils.LS_TOKEN);
    return this.token != null;
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
      this.http.post(`${this.api}/authenticate`, user)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  createUser(user: User) {
    return new Promise((resolve, reject) => {
      this.registerUser(user).then((result: any) => {
        return resolve(true);
      }, (error) => reject(error));
    });
  }

  checkEmailValidity(newUser: User) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/checkemailvalidity`, newUser)
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  getUserByEmail(pEmail: string) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getuserbyemail`, { email: pEmail })
        .subscribe(next => {
          resolve(next)
        }, error => reject(error));
    });
  }

  registerUser(user: User) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createuser`, user)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  updateUser(user: User) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updateuser`, user)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  updateUserPassword(user: User) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updateuserpassword`, user)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  sendResetLink(email: string) {
    return new Promise((resolve, reject) => {
      this.http.post('/email/sendresetpasswordlink', { email: email })
        .subscribe((data) => resolve(data), (error) => reject(error));
    });
  }

  createUserAddress(address: Address) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createuseraddress`, address)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  deleteUserAddress(address: Address) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteuseraddress`, address)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  updateUserAddress(address: Address) {
    return new Promise((resolve, reject) => {
      this.http.patch(`${this.api}/updateuseraddress`, address)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getAllUserAdmin() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getalluseradmin`)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getUserById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getuserbyid/${id}`)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  deleteUserById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.api}/deleteuserbyid/${id}`)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getUserAddressById(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getuseraddressbyid/${id}`)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }
  getUserAddressByUserId(id: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getuseraddressbyuserid/${id}`)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getUserWishlishByEmail(email: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getuserwishlishbyemail/${email}`)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  getUserWishlishByEmailAndProductId(userWishlist: UserWishlist) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getuserwishlishbyemailandproductid`, userWishlist)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  createUserWishlish(userWishlist: UserWishlist) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createwishlist`, userWishlist)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  deleteUserWishlishByEmailAndProductId(userWishlist: UserWishlist) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteWishlishbyemailandproductid`, userWishlist)
        .subscribe(next => resolve(next), error => reject(error));
    });
  }

  userProductNotificationByEmail(email: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getuserproductnotificationbyemail/${email}`)
        .subscribe((data: any) => {
          this.dataService.setUserProductNotification(data);
          resolve(data)
        }, (error) => reject(error));
    });
  }

  userProductNotificationByEmailByProduct(notif: UserProductNotification) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/getuserproductnotificationbyemailandproduct`, notif)
        .subscribe((data: any) => {
          this.dataService.setUserProductNotification(data);
          resolve(data)
        }, (error) => reject(error));
    });
  }

  getUserProductNotificationByProduct(productId: number) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getuserproductnotificationbyproduct/${productId}`)
        .subscribe((data: any) => {
          this.dataService.setUserProductNotification(data);
          resolve(data)
        }, (error) => reject(error));
    });
  }

  createUserProductNotification(notif: UserProductNotification) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createuserproductnotification`, notif)
        .subscribe((data: any) => {
          this.dataService.setUserProductNotification(data);
          resolve(data)
        }, (error) => reject(error));
    });
  }

  deleteUserProductNotification(notif: UserProductNotification) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/deleteuserproductnotificationbyemailandproduct`, notif)
        .subscribe((data: any) => {
          this.dataService.setUserProductNotification(data);
          resolve(data)
        }, (error) => reject(error));
    });
  }


  sendProductNotification(notif: UserProductNotification) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/sendproductnotification`, notif)
        .subscribe((data: any) => {
          resolve(data)
        }, (error) => reject(error));
    });
  }

  createUserSubscription(email: string) {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.api}/createusersubscription`, { email: email })
        .subscribe((data: any) => {
          resolve(data)
        }, (error) => reject(error));
    });
  }

  deleteUserSubscription(email: string) {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.api}/deleteusersubscription/${email}`)
        .subscribe((data: any) => {
          resolve(data)
        }, (error) => reject(error));
    });
  }


  getUserSubscriptionByEmail(email: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.api}/getusersubscriptionbyemail/${email}`)
        .subscribe((data: any) => {
          resolve(data)
        }, (error) => reject(error));
    });
  }

}
