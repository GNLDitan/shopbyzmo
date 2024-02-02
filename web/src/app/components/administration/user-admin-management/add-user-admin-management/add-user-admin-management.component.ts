import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/services/validator.service';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Subscription, Subject, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, mergeMap, delay } from 'rxjs/operators';
import { Validity } from 'src/app/classes/validity';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-add-user-admin-management',
  templateUrl: './add-user-admin-management.component.html',
  styleUrls: ['./add-user-admin-management.component.scss']
})
export class AddUserAdminManagementComponent implements OnInit, OnDestroy {
  newUserForm: any;
  newUser: User;
  isFormSubmit: boolean;
  emailSubscription: Subscription;
  checkEmail: boolean;
  public emailKeyUp = new Subject<KeyboardEvent>();
  public emailPaste = new Subject<ClipboardEvent>();


  constructor(public formBuilder: FormBuilder,
    public validatorService: ValidatorService,
    public userService: UserService,
    public toasterService: ToasterService,
    public navigationService: NavigationService) {
    this.emailSubscription = new Subscription();
    this.newUserForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, this.validatorService.emailValidator]],
      password: ['', [Validators.required, this.validatorService.passwordValidator]],
      confirmPassword: ['', [Validators.required, this.validatorService.confirmPasswordValidator]]
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.emailSubscription.unsubscribe();
  }

  createUser() {
    this.newUser = this.newUserForm.getRawValue();
    this.newUser.isAdmin = true;
    if (this.newUserForm.valid) {
      this.isFormSubmit = true;
      this.userService.createUser(this.newUser).then((success) => {
        if (success) {
          this.navigationService.toAdminUserAdminManagement();
        }
        this.isFormSubmit = false;
      }, (error) => {
        this.toasterService.alert('danger', 'signing up');
      });
    }
  }

  onPaste(event: ClipboardEvent) {
    this.emailSubscription = this.emailPaste.pipe(
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

}
