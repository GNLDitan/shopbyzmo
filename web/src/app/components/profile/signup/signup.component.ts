import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, mergeMap, delay } from 'rxjs/operators';

import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';
import { NavigationService } from 'src/app/services/navigation.service';

import { User } from 'src/app/classes/user';
import { Validity } from 'src/app/classes/validity';
import { Utils } from 'src/app/app.utils';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  // email keyup event
  public emailKeyUp = new Subject<KeyboardEvent>();
  public emailPaste = new Subject<ClipboardEvent>();
  private emailSubscription: Subscription;

  newUser: User;
  currentUser: User;
  checkEmail = false;
  newUserForm: FormGroup;
  isFormSubmit: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private validatorService: ValidatorService,
    private navigationService: NavigationService,
    private toasterService: ToasterService) {

    this.newUser = new User();
    this.loadKeyUp();
    this.isFormSubmit = false;

    this.newUserForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, this.validatorService.emailValidator]],
      mobileNumber: ['', [Validators.required]],
      password: ['', [Validators.required, this.validatorService.passwordValidator]],
      confirmPassword: ['', [Validators.required, this.validatorService.confirmPasswordValidator]]
    });

  }

  ngOnInit() {
    this.checkUser();
    this.populateForms();

  }

  ngOnDestory() {
    this.emailSubscription.unsubscribe();
  }

  checkUser() {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      this.navigationService.toHome();
    }
  }
  onPaste(event: ClipboardEvent) {
    this.emailSubscription = this.emailPaste.pipe(
      map((pasteEvent: any) => pasteEvent.target.value),
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
  loadKeyUp() {
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

  populateForms() {
    this.newUserForm.patchValue(this.newUser);
  }

  checkEmailValidity() {
    if (this.newUserForm.controls.email.value !== '') {
      const userForm = this.newUserForm.getRawValue();
      const newUser = new User();
      newUser.email = userForm.email;
      this.userService.checkEmailValidity(newUser).then((validity: Validity) => {
        if (validity != null) {
          this.checkEmail = false;

          this.newUserForm.controls.email.setValidators(validity.validEmail ?
            [Validators.required, this.validatorService.emailValidator] :
            [this.validatorService.userEmailValidator]);

          this.newUserForm.controls.email.updateValueAndValidity();
        }
      });
    } else {
      this.checkEmail = false;
      this.newUserForm.controls.email.setValidators([Validators.required, this.validatorService.emailValidator]);
      this.newUserForm.controls.email.updateValueAndValidity();
    }
  }

  createUser() {
    const newUserForm = this.newUserForm.getRawValue();
    this.newUser = newUserForm;

    if (this.newUserForm.valid) {
      this.isFormSubmit = true;
      this.userService.createUser(this.newUser).then((success) => {
        if (success) {
          this.userService.logout();
          this.userService.login(this.newUser).then(() => {
            this.toasterService.alert('success', 'signing up');
            this.navigationService.toHome();
            location.reload();
          });
        }
        this.isFormSubmit = false;
      }, (error) => {
        this.toasterService.alert('danger', 'signing up');
      });
    }
  }

}
