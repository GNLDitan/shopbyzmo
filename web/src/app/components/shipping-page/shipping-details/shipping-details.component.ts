import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ValidatorService } from 'src/app/services/validator.service';
import { DataService } from 'src/app/services/data.service';
import { ShippingDetails } from 'src/app/classes/shipping-details';
import { NavigationService } from 'src/app/services/navigation.service';
import { User } from 'src/app/classes/user';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { Utils } from 'src/app/app.utils';
import { AuthService, FacebookLoginProvider } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';
import { CartService } from 'src/app/services/cart.service';
import * as i18nIsoCountries from 'i18n-iso-countries';
import { TranslateService } from '@ngx-translate/core';
import { Countries } from 'src/app/classes/countries';
import { CANADA_PROVINCE, CHINA_STATES, JPN_PREFECTURE, Province, PROVINCE_CODES, US_STATES } from 'src/app/classes/province';
import { Address } from 'src/app/classes/address';
import { IpService } from 'src/app/services/ip.service';
import { Subscription } from 'rxjs';
import { ShippingAddress } from 'src/app/classes/shipping-address';
import { COUNTRY_NUM_CODES, PhoneCode } from 'src/app/classes/phone-code';
import { DOCUMENT } from '@angular/common';
import { CurrenyService } from 'src/app/services/currency.service';
@Component({
  selector: 'app-shipping-details',
  templateUrl: './shipping-details.component.html',
  styleUrls: ['./shipping-details.component.scss']
})
export class ShippingDetailsComponent implements OnInit {

  public shippingAccountForm: FormGroup;
  shippingDetails: ShippingDetails;
  user: User;
  loginForm: FormGroup;
  indexedArray: any;
  selectedAddress: Address;
  public provinces: Array<Province>;
  public countries: Array<Countries>;
  public errorMessage: string;
  public addresses: Array<Address>;
  ipAddress: string;
  selectedIP: Subscription;
  public isLogin: boolean;
  isEmailDisabled: boolean;
  shippingAddress: ShippingAddress;
  selectedCurrency: string;
  rates: any;

  public specialInstruction: string;
  public hasStates: boolean;
  public states: Array<Province>;
  public prefecture: Array<Province>;
  public countryPhoneCodes: Array<PhoneCode>;
  public isShowSubs: boolean;


  constructor(
    private formBuilder: FormBuilder,
    private validatorService: ValidatorService,
    private navigationService: NavigationService,
    private router: Router,
    private dataService: DataService,
    private userService: UserService,
    private authService: AuthService,
    private cartService: CartService,
    private translateService: TranslateService,
    private ipService: IpService,
    private currencyService: CurrenyService,
    @Inject(DOCUMENT) private document) {
    this.shippingDetails = new ShippingDetails();
    this.countries = new Array<Countries>();
    this.selectedAddress = new Address();
    this.user = new User();
    this.provinces = new Array();
    this.addresses = new Array();
    this.countryPhoneCodes = new Array();
    this.translateService.use('en');
    this.shippingAccountForm = this.formBuilder.group({
      id: [0],
      completeName: ['', Validators.required],
      email: ['', [Validators.required, this.validatorService.emailValidator]],
      mobileNumber: ['', [Validators.required, validatorService.mobileNumberValidator]],
      address: ['', Validators.required],
      barangay: [''],
      city: ['', [Validators.required]],
      countryCode: ['PH', [Validators.required]],
      province: ['MET'],
      zipCode: [''],
      shippingMethod: ['0'],
      shippingMethodDescription: [''],
      paymentMethod: ['0'],
      specialInstruction: [''],
      shippingAddressId: [0],
      userId: [0],
      billingAddress: [''],
      states: [''],
      prefecture: [''],
      postalCode: [''],
      isSelectedDefault: [true],
      numCode: ['+63', Validators.required],
      baseCurrency: [''],
      currencyRate: [0],
      isEmailSubscribe: [true],
      hasMinimumAmount: [false],
      facebookName: ['', Validators.required]
    });

    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      issocialmedialogin: [false]
    });
    this.shippingAddress = new ShippingAddress();
    this.selectedIP = new Subscription();
    this.states = new Array();
    this.isShowSubs = true;
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.selectedIP = this.dataService.selectedIpAddress$.subscribe((ipAddress: any) => {
      if (!Utils.isNullOrUndefined(ipAddress)) {
        if (ipAddress !== '') {
          this.ipAddress = ipAddress;
          this.shippingDetails = this.dataService.activeShippingDetails;
          i18nIsoCountries.registerLocale(require('i18n-iso-countries/langs/en.json'));
          this.indexedArray = i18nIsoCountries.getNames(this.translateService.currentLang);
          Object.entries(this.indexedArray).map((val: any) => {
            this.countries.push({
              code: val[0],
              name: val[1]
            });
          });

          this.provinces = PROVINCE_CODES;
          this.prefecture = JPN_PREFECTURE;
          this.countryPhoneCodes = COUNTRY_NUM_CODES;
          this.checkUser();
          this.billingChangesControis();
          this.shippingAccountForm.controls.billingAddress.disable();
        }
      }

    });
  }

  // onCountryChange(event: any) {
  //   const country = this.countries.filter(x => x.code === event.target.value)[0];
  //   const name = country.name;
  //   this.shippingAccountForm.controls.numCode.setValue(this.countryPhoneCodes.filter(x => x.code === name)[0].numCode);
  // }
  checkUser() {
    if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      const email = localStorage.getItem(Utils.LS_EMAIL);
      this.userService.getUserByEmail(email).then((success: User) => {
        this.user = success;
        this.isEmailDisabled = this.user.id !== 0 ? true : false;
        const contry = this.shippingDetails.countryCode;
        this.contryProviceStates(contry);
        if (contry == 'PH') {
          this.shippingAccountForm.controls.barangay.setValidators([Validators.required]);
        }
        if (!this.shippingDetails.hasOwnProperty('address')) {
          if (success.hasOwnProperty('email')) {
            this.addresses = success.addresses;
            success.addresses.map((addr: Address) => {
              addr.completeAddress = addr.address.concat(' ')
                .concat(addr.barangay).concat(' ')
                .concat(addr.city).concat(' ')
                .concat(addr.province).concat(' ')
                .concat(addr.zipCode.toString()).concat(', ')
                .concat(addr.countryCode);

              addr.isSelected = addr.isDefault;
            });

            const defaultAddr = this.addresses.filter(x => x.isDefault === true)[0];
            this.updateSelectedAddress(defaultAddr);
            if (this.selectedAddress.id === 0) {
              this.updateSelectedAddress(success.addresses[0]);
            }
            this.shippingAccountForm.patchValue(success);
            this.shippingAccountForm.controls.id.setValue(0);
            this.shippingAccountForm.controls.completeName.setValue(success.name);
            this.shippingAccountForm.controls.shippingAddressId.setValue(this.selectedAddress.id);
          }
        } else {
          const parent = this;
          this.shippingDetails.id = 0;
          this.shippingAccountForm.patchValue(this.shippingDetails);
          const contry = this.shippingDetails.countryCode;
          if (contry == 'PH') {
            this.shippingAccountForm.controls.barangay.setValidators([Validators.required]);
          }
          if (this.shippingDetails.userId > 0) {
            this.userService.getUserAddressByUserId(this.shippingDetails.userId).then((addresses: Array<Address>) => {
              addresses.forEach((adr) => {
                adr.completeAddress = adr.address.concat(' ')
                  .concat(adr.barangay).concat(' ')
                  .concat(adr.city).concat(' ')
                  .concat(adr.province).concat(' ')
                  .concat(adr.zipCode.toString()).concat(', ')
                  .concat(adr.countryCode);

                if (parent.shippingAccountForm.controls.shippingAddressId.value === adr.id) {
                  adr.isSelected = true;
                }
              });
              this.addresses = addresses;
              this.selectedAddress = this.addresses.filter(x => x.id === this.shippingAccountForm.controls.shippingAddressId.value)[0];
            });
          }
        }
      }, (error) => {
        console.log(error.error);
      });


      this.userService.getUserSubscriptionByEmail(email).then((result: any) => {
        this.isShowSubs = result != null ? !(result.id > 0) : true;
      });
    }
  }

  subscribeUser() {

  }

  continuePayment() {
    if (this.shippingAccountForm.valid) {
      this.shippingAccountForm.controls.baseCurrency.setValue(this.currencyService.getCurrency());
      this.shippingAccountForm.controls.currencyRate.setValue(this.dataService.selectedRate);
      this.shippingAddress = this.shippingAccountForm.getRawValue();
      this.dataService.setShippingAddress(this.shippingAddress);
      this.navigationService.gotoShippingMethod();
    }
  }

  login() {
    const user = this.loginForm.getRawValue();
    this.userService.login(user).then((isAdmin: boolean) => {
      if (isAdmin) {
        this.router.navigate(['/administration']).then();
      } else {
        if (!Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
          const email = localStorage.getItem(Utils.LS_EMAIL);
          this.userService.getUserByEmail(email).then((usr: User) => {
            this.cartService.updateUserCart(usr, this.ipAddress).then(() => {
              location.reload();
            });
          });
        }
      }
    }, (error) => {
      this.errorMessage = error.error.message || error.name;
      console.log(error);
    });
  }

  updateSelectedAddress(addr: Address) {
    this.selectedAddress = addr;
    if (addr !== undefined) {
      this.selectedAddress.isSelected = true;
      this.shippingAccountForm.patchValue(this.selectedAddress);
      this.shippingAccountForm.controls.id.setValue(0);
      this.shippingAccountForm.controls.shippingAddressId.setValue(this.selectedAddress.id);
    } else {
      this.selectedAddress = new Address();
    }

  }
  changeSelectedAddress() {
    const selected = this.addresses.filter(x => x.isSelected)[0];
    this.updateSelectedAddress(selected);
  }

  selectedAddressChange(addr: Address) {
    this.addresses.map((slAddr: Address) => {
      slAddr.isSelected = slAddr.id === addr.id;
    });
  }


  signInWithSocialMedia(socialMedia: string): void {

    if (socialMedia === 'google') {
      this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
        if (user) {
          this.loginForm.controls.email.setValue(user.email);
          this.loginForm.controls.issocialmedialogin.setValue(true);
          this.login();
        }
      }, (error) => {
        console.log(error);
      });
    } else if (socialMedia === 'facebook') {
      this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(user => {
        if (user) {
          this.loginForm.controls.email.setValue(user.email);
          this.loginForm.controls.issocialmedialogin.setValue(true);
          this.login();
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  selectDefault() {
    if (this.shippingAccountForm.controls.isSelectedDefault.value) {
      this.billingAddress();
      this.shippingAccountForm.controls.billingAddress.disable();
    } else {
      this.shippingAccountForm.controls.billingAddress.enable();
    }
  }

  billingChangesControis() {

    this.shippingAccountForm.get('address').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
    this.shippingAccountForm.get('barangay').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
    this.shippingAccountForm.get('city').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
    this.shippingAccountForm.get('province').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
    this.shippingAccountForm.get('zipCode').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
    this.shippingAccountForm.get('countryCode').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
    this.shippingAccountForm.get('postalCode').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
    this.shippingAccountForm.get('states').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
    this.shippingAccountForm.get('prefecture').valueChanges.subscribe(() => {
      if (this.shippingAccountForm.controls.isSelectedDefault.value) {
        this.billingAddress();
      }
    });
  }


  billingAddress() {
    let address = this.shippingAccountForm.controls.address.value.concat(' ')
      .concat(this.shippingAccountForm.controls.barangay.value).concat(' ')
      .concat(this.shippingAccountForm.controls.city.value).concat(' ')
      .concat(this.shippingAccountForm.controls.province.value).concat(' ')
      .concat(this.shippingAccountForm.controls.zipCode.value.toString()).concat(', ');

    if (!Utils.isArrayNullOrUndefinedOrEmpty(this.shippingAccountForm.controls.postalCode.value)) {
      address = address.concat(this.shippingAccountForm.controls.postalCode.value.toString()).concat(', ');
    }
    if (!Utils.isArrayNullOrUndefinedOrEmpty(this.shippingAccountForm.controls.states.value)) {
      address = address.concat(this.shippingAccountForm.controls.states.value.toString()).concat(', ');
    }
    if (!Utils.isArrayNullOrUndefinedOrEmpty(this.shippingAccountForm.controls.prefecture.value)) {
      address = address.concat(this.shippingAccountForm.controls.prefecture.value.toString()).concat(', ');
    }
    address = address.concat(this.shippingAccountForm.controls.countryCode.value.toString()).concat();
    this.shippingAccountForm.controls.billingAddress.setValue(address);
  }

  countryChange() {
    const country = this.shippingAccountForm.controls.countryCode.value;
    this.shippingAccountForm.controls.barangay.clearValidators();
    this.shippingAccountForm.controls.province.clearValidators();
    this.shippingAccountForm.controls.prefecture.clearValidators();
    this.shippingAccountForm.controls.states.clearValidators();
    this.shippingAccountForm.controls.mobileNumber.clearValidators();
    if (country === 'PH') {
      this.shippingAccountForm.controls.barangay.setValidators([Validators.required]);
      this.shippingAccountForm.controls.mobileNumber.setValidators([this.validatorService.mobileNumberValidator]);
    } else {
      this.shippingAccountForm.controls.mobileNumber.setValidators([this.validatorService.mobileNonPHNumberValidator]);
    }
    this.contryProviceStates(country);
    this.shippingAccountForm.controls.mobileNumber.setValue('');
    this.shippingAccountForm.controls.province.setValue('');
    this.shippingAccountForm.controls.zipCode.setValue('');
    this.shippingAccountForm.controls.postalCode.setValue('');
    this.shippingAccountForm.controls.states.setValue('');
    this.shippingAccountForm.controls.prefecture.setValue('');
    this.shippingAccountForm.updateValueAndValidity();
  }

  contryProviceStates(country) {
    if (Utils.isArrayNullOrUndefinedOrEmpty(country)) {
      return;
    }

    const countries = this.countries.filter(x => x.code === country)[0];
    const code = countries.code;
    this.shippingAccountForm.controls.numCode.setValue(this.countryPhoneCodes.filter(x => x.code === code)[0].numCode);
    switch (country) {
      case 'PH':
        this.provinces = PROVINCE_CODES;
        this.shippingAccountForm.controls.province.setValidators([Validators.required]);
        break;
      case 'US':
        this.hasStates = true;
        this.states = US_STATES;
        this.shippingAccountForm.controls.states.setValidators([Validators.required]);
        break;
      case 'CN':
        this.hasStates = true;
        this.provinces = CHINA_STATES;
        this.shippingAccountForm.controls.province.setValidators([Validators.required]);
        break;
      case 'JP':
        this.shippingAccountForm.controls.prefecture.setValidators([Validators.required]);
        break;
      case 'CA':
        this.provinces = CANADA_PROVINCE;
        this.shippingAccountForm.controls.province.setValidators([Validators.required]);
        break;
      default:
        this.shippingAccountForm.controls.states.clearValidators();
        break;
    }
  }

  loginUser() {
    this.document.getElementById('userLoginId').click();
  }


}
