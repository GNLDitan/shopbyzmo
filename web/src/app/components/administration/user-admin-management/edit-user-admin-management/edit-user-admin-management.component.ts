import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorService } from 'src/app/services/validator.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Utils } from 'src/app/app.utils';
import { User } from 'src/app/classes/user';
import { ToasterService } from 'src/app/services/toaster.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { map, debounceTime, distinctUntilChanged, mergeMap, delay } from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';
import { Validity } from 'src/app/classes/validity';
import { ConfirmationService } from 'src/app/services/confirmation.service';

@Component({
  selector: 'app-edit-user-admin-management',
  templateUrl: './edit-user-admin-management.component.html',
  styleUrls: ['./edit-user-admin-management.component.scss']
})
export class EditUserAdminManagementComponent implements OnInit {
  newUserForm: FormGroup;
  passwordKeyUp = new Subject<KeyboardEvent>();
  private passwordSubscription: Subscription;
  emailKeyUp = new Subject<KeyboardEvent>();
  emailSubscription: Subscription;
  public emailPaste = new Subject<ClipboardEvent>();

  constructor(public formBuilder: FormBuilder,
    public validatorService: ValidatorService,
    public route: ActivatedRoute,
    public userService: UserService,
    public toasterService: ToasterService,
    public navigationService: NavigationService,
    public confirmationService: ConfirmationService) {
    this.emailSubscription = new Subscription();
    this.newUserForm = this.formBuilder.group({
      id: [0],
      name: ['', Validators.required],
      email: ['', [Validators.required, this.validatorService.emailValidator]],
      password: ['', []],
      confirmPassword: ['', [this.validatorService.confirmPasswordValidator]]
    });

  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMaps: any) => {
      let id = paramMaps.params.id;
      this.userService.getUserById(id).then((result: any) => {
        this.newUserForm.patchValue(result);
      });
    });
  }

  checkValue(value: any) {
    return Utils.isStringNullOrEmpty(value);
  }



  saveProfile() {
    const dialogQuestion = 'Do you want to save changes?';
    const dialogMessage = 'Selected user will be update.';
    const dialogDanger = 'This operation can not be undone.';
    const user = this.newUserForm.getRawValue();

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      user.name, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        if (this.newUserForm.valid) {
          this.userService.updateUser(user).then((success: User) => {
            //this.dataService.setUser(success);
            if (success) {
              this.navigationService.toAdminUserAdminManagement();
            }

          }).catch((error) => {
            this.toasterService.alert('danger', error.statusText);
          });
        }
      }
    }).catch(() => { });


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
      if (this.newUserForm.controls.password.value !== '') {
        this.newUserForm.controls.password.setValidators([Validators.required, this.validatorService.passwordValidator]);
        this.newUserForm.controls.password.updateValueAndValidity();
      }
    });


    this.emailSubscription = this.emailKeyUp.pipe(
      map((event: any) => event.target.value),
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(300),
      )),
    ).subscribe(x => {
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

          this.newUserForm.controls.email.setValidators(validity.validEmail ?
            [Validators.required, this.validatorService.emailValidator] :
            [this.validatorService.userEmailValidator]);

          this.newUserForm.controls.email.updateValueAndValidity();
        }
      });
    } else {
      this.newUserForm.controls.email.setValidators([Validators.required, this.validatorService.emailValidator]);
      this.newUserForm.controls.email.updateValueAndValidity();
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
      this.checkEmailValidity();
    });
  }


}
