import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';

import { User } from 'src/app/classes/user';
import { ResetToken } from 'src/app/classes/reset-token';
@Component({
  selector: 'app-forgot-password-verify',
  templateUrl: './forgot-password-verify.component.html',
  styleUrls: ['./forgot-password-verify.component.scss']
})
export class ForgotPasswordVerifyComponent implements OnInit {

  resetToken: ResetToken;
  errorMessage: string;
  isSuccess: boolean;
  changePasswordForm: FormGroup;
  user: User;

  constructor(private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private navigationService: NavigationService,
    private userService: UserService) {

    this.resetToken = new ResetToken();
    this.errorMessage = null;
    this.isSuccess = false;

    this.changePasswordForm = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.resetToken.recipientEmail = params.get('email');
      this.resetToken.token = params.get('token');
    });
  }

  changePassword() {
    if (!this.changePasswordForm.valid) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    if (this.changePasswordForm.controls.password.value !== this.changePasswordForm.controls.confirmPassword.value) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.user = this.changePasswordForm.getRawValue();
    this.user.email = this.resetToken.recipientEmail;
    this.user.resetToken = this.resetToken.token;

    this.userService.updateUserPassword(this.user).then((user: any) => {
      this.userService.login(user).then((isadmin: boolean) => {
        if (!isadmin) {
          this.navigationService.toHome();
          location.reload();
        }
      }, (error) => {
        this.errorMessage = error.error.message || error.statusText;
        console.log(error);
      });
    }, (error) => {
      console.log(error.error);
    });
  }

}
