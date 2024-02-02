import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ValidatorService } from 'src/app/services/validator.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';

import { Utils } from 'src/app/app.utils';
import { User } from 'src/app/classes/user';
import { ToasterService } from 'src/app/services/toaster.service';
import { Subject, Subscription, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, mergeMap, delay } from 'rxjs/operators';
import { Validity } from 'src/app/classes/validity';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  // email keyup event
  public emailKeyUp = new Subject<KeyboardEvent>();
  public emailPaste = new Subject<ClipboardEvent>();
  private emailSubscription: Subscription;

  public passwordKeyUp = new Subject<KeyboardEvent>();
  public passwordPaste = new Subject<ClipboardEvent>();
  private passwordSubscription: Subscription;

  accountForm: FormGroup;
  user: User;
  isUserAdmin: boolean;
  preventClickout: boolean;
  isFormSubmit: boolean;
  isSuccess: boolean;
  isProfileSaved: boolean;
  checkEmail = false;

  constructor(
    private formBuilder: FormBuilder,
    private validatorService: ValidatorService,
    private navigationService: NavigationService,
    private dataService: DataService,
    private userService: UserService,
    private toasterService: ToasterService) {

    this.user = new User();
    this.isSuccess = false;
    this.isProfileSaved = false;
    this.loadEmailKeyUp();
    this.accountForm = this.formBuilder.group({
      id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, validatorService.emailValidator]],
      mobileNumber: ['', [Validators.required, validatorService.mobileNumberValidator]],
      password: [''],
      confirmPassword: ['', [validatorService.confirmPasswordValidator]]
    });

    this.isFormSubmit = false;

  }

  ngOnInit() {
    this.checkUser();
    this.subscribeUser();

  }

  ngOnDestory() {
    this.passwordSubscription.unsubscribe();
  }

  onEmailPaste() {
    this.emailSubscription = this.emailPaste.pipe(
      map((emailEvent: any) => emailEvent.target.value),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(300),
      )),
    ).subscribe(x => {
      this.checkEmail = true;
      this.checkEmailValidity();
    });
  }

  loadEmailKeyUp() {
    this.emailSubscription = this.emailKeyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(300),
      )),
    ).subscribe(x => {
      this.checkEmail = true;
      this.checkEmailValidity();
    });
  }

  checkEmailValidity() {
    if (this.accountForm.controls.email.value !== '') {
      const userForm = this.accountForm.getRawValue();
      const newUser = new User();
      newUser.email = userForm.email;
      this.userService.checkEmailValidity(newUser).then((validity: Validity) => {
        if (validity != null) {
          this.checkEmail = false;

          this.accountForm.controls.email.setValidators(validity.validEmail ?
            [Validators.required, this.validatorService.emailValidator] :
            [this.validatorService.userEmailValidator]);

          this.accountForm.controls.email.updateValueAndValidity();
        }
      });
    } else {
      this.checkEmail = false;
      this.accountForm.controls.email.setValidators([Validators.required, this.validatorService.emailValidator]);
      this.accountForm.controls.email.updateValueAndValidity();
    }
  }

  onPaste() {
    this.passwordSubscription = this.passwordPaste.pipe(
      map((pasteEvent: any) => pasteEvent.target.value),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(300),
      )),
    ).subscribe(x => {
      if (this.accountForm.controls.password.value !== '') {
        this.accountForm.controls.password.setValidators([Validators.required, this.validatorService.passwordValidator]);
        this.accountForm.controls.password.updateValueAndValidity();
      }
    });
  }

  loadKeyUp() {
    this.passwordSubscription = this.passwordKeyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(300),
      )),
    ).subscribe(x => {
      if (this.accountForm.controls.password.value !== '') {
        this.accountForm.controls.password.setValidators([Validators.required, this.validatorService.passwordValidator]);
        this.accountForm.controls.password.updateValueAndValidity();
      }
    });
  }

  checkUser() {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        this.dataService.setUser(success);
      }, (error) => {
        this.navigationService.toHome();
        console.log(error.error);
      });
    }
  }

  subscribeUser() {
    this.dataService.user$.subscribe(next => {
      this.user = next;

      if (next != null && next.hasOwnProperty('id')) {
        this.isUserAdmin = this.user.isAdmin;
        this.accountForm.patchValue(this.user);
      } else {
        this.preventClickout = true;
        setTimeout(() => {
          this.preventClickout = false;
        }, 500);
      }
    });
  }

  checkValue(value: any) {
    return Utils.isStringNullOrEmpty(value);
  }

  saveProfile() {
    this.isProfileSaved = true;
    this.isSuccess = false;
    const user = this.accountForm.getRawValue();

    if (this.accountForm.valid) {
      this.isFormSubmit = true;
      this.userService.updateUser(user).then((success: User) => {
        // this.dataService.setUser(success);
        if (success) {
          if (success.email !== this.user.email) {
            this.userService.logout();
            this.navigationService.toHome();
            location.reload();
            this.toasterService.alert('success', 'updating email. Please login again.');
          } else {
            this.toasterService.alert('success', 'updating information');
            this.dataService.setUser(success);
            this.isSuccess = true;
            this.isProfileSaved = false;
            this.isFormSubmit = false;
          }
        }

      }, (error) => {
        this.toasterService.alert('danger', 'updating information');
        console.log(error);
      });
    }

  }

}
