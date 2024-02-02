import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToasterService } from 'src/app/services/toaster.service';
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-unsubscription-email',
  templateUrl: './unsubscription-email.component.html',
  styleUrls: ['./unsubscription-email.component.scss']
})
export class UnsubscriptionEmailComponent implements OnInit {
  emailSubscribeForm: any;

  constructor(private formBuilder: FormBuilder,
    private validatorService: ValidatorService,
    private userService: UserService,
    private toasterService: ToasterService) {
    this.emailSubscribeForm = this.formBuilder.group({
      email: ['', [Validators.required, this.validatorService.emailValidator]]
    });
  }

  ngOnInit() {
  }


  unsubscribe() {
    if (this.emailSubscribeForm.valid) {
      this.userService.deleteUserSubscription(this.emailSubscribeForm.controls.email.value).then((result: any) => {

        this.toasterService.alert('success', 'Unsubscription successful.');
        this.emailSubscribeForm.reset()
        this.emailSubscribeForm.controls.email.setErrors(null);

      }).catch((ex) => {
        this.toasterService.alert('info', ex.error);
      });

    }
  }
}
