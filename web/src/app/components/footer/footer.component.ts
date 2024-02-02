import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Utils } from 'src/app/app.utils';
import { CurrenyService } from 'src/app/services/currency.service';
import { DataService } from 'src/app/services/data.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { UserService } from 'src/app/services/user.service';
import { ValidatorService } from 'src/app/services/validator.service';
import *  as data from '../../data/Common-Currency.json';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  selectedCurrency: string;
  currencyList: any;
  rates: any;
  emailSubscribe: string;
  emailSubscribeForm: any;
  constructor(private currencyService: CurrenyService,
              private dataService: DataService,
              private toasterService: ToasterService,
              private validatorService: ValidatorService,
              private formBuilder: FormBuilder,
              private userService: UserService,
              private navigationService: NavigationService) {
    this.currencyList = new Array();

    this.emailSubscribeForm = this.formBuilder.group({
      email: ['', [Validators.required, this.validatorService.emailValidator]]
    });

  }

  ngOnInit() {
    this.getSelectedCurrency();
    this.dataService.currencyRates$.subscribe((rates) => {
      if (!Utils.isArrayNullOrUndefinedOrEmpty(rates)) {
        this.rates = rates;
        this.getCurrencyList();
      }
    });
  }

  getSelectedCurrency() {
    this.selectedCurrency = this.currencyService.getCurrency();
  }

  getCurrencyList() {
    const symblos: any = (data as any).default;
    const list = Object.getOwnPropertyNames(this.rates);
    for (let i = 0; i < list.length; i++) {
      if (!Utils.isNullOrUndefined(symblos[list[i]])) {
        const curr = {
          code: list[i],
          name: symblos[list[i]].name
        };
        this.currencyList.push(curr);
      }
    }
  }

  selectCurrency() {
    this.currencyService.setCurrency(this.selectedCurrency);
    this.toasterService.alert('success', 'Change Currency');
    location.reload();
  }

  subscribe() {
    if (this.emailSubscribeForm.valid) {
      this.userService.createUserSubscription(this.emailSubscribeForm.controls.email.value).then((result: any) => {

        if (result.id > 0) {
          this.toasterService.alert('success', 'Your email is now subscribed.');
          this.emailSubscribeForm.reset()
          this.emailSubscribeForm.controls.email.setErrors(null);
        }

      }).catch((ex) => {
        this.toasterService.alert('info', ex.error);
      });
    }
  }

  goToSubscription() {
    this.navigationService.toSubscription();
  }


}
