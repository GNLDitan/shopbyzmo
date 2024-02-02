import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';

import { User } from 'src/app/classes/user';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  errorMessage: string;
  user: User;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private validatorService: ValidatorService,
    private navigationService: NavigationService) { }

  ngOnInit() {
    this.user = new User();
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, this.validatorService.emailValidator]]
    });
    this.errorMessage = null;
  }

  sendResetLink() {
    if (!this.forgotPasswordForm.valid) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    this.user = this.forgotPasswordForm.getRawValue();

    this.userService.sendResetLink(this.user.email).then(() => {
      this.navigationService.forgotEmail();
    }, (error) => {
      this.errorMessage = error.error.message;
      console.log(error);
    });
  }
}
