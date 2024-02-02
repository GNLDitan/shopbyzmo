import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ValidatorService } from 'src/app/services/validator.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';

import { CANADA_PROVINCE, CHINA_STATES, JPN_PREFECTURE, Province, PROVINCE_CODES, US_STATES } from 'src/app/classes/province';
import { Address } from 'src/app/classes/address';
import { User } from 'src/app/classes/user';
import { Countries } from 'src/app/classes/countries';

import { Utils } from 'src/app/app.utils';
import * as i18nIsoCountries from 'i18n-iso-countries';
import { ToasterService } from 'src/app/services/toaster.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {

  addressForm: FormGroup;
  isNewAddress: boolean;
  isEdit: boolean;
  provinces: Province[];
  addresses: Array<Address>;
  isAddressSaved: boolean;
  isEditAddress: boolean;
  user: User;
  preventClickout: boolean;
  countries: Array<Countries>;
  indexedArray: any;
  isLocal: boolean;
  defaultAddressCount: number;

  public hasStates: boolean;
  public states: Array<Province>;
  public prefecture: Array<Province>;

  constructor(private formBuilder: FormBuilder,
    private validatorService: ValidatorService,
    private navigationService: NavigationService,
    private dataService: DataService,
    private userService: UserService,
    private translateService: TranslateService,
    private toasterService: ToasterService) {

    this.isNewAddress = false;
    this.provinces = PROVINCE_CODES;
    this.isEdit = false;
    this.isAddressSaved = false;
    this.isEditAddress = false;
    this.user = new User();
    this.user.addresses = new Array<Address>();
    this.countries = new Array<Countries>();
    this.translateService.use('en');
    this.isLocal = false;
    this.defaultAddressCount = 0;

  }

  ngOnInit() {
    this.checkUser();
    this.subscribeUser();
    this.resetAddressForm();

    i18nIsoCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));
    this.indexedArray = i18nIsoCountries.getNames(this.translateService.currentLang);
    Object.entries(this.indexedArray).map((val: any) => {
      this.countries.push({
        code: val[0],
        name: val[1]
      });
    });

    this.provinces = PROVINCE_CODES;
    this.prefecture = JPN_PREFECTURE;
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
      this.addresses = this.user.addresses;
      this.defaultAddressCount = this.addresses.filter(x => x.isDefault).length;

      this.addresses.map(val => {
        this.isLocal = val.countryCode == 'PH';
      });

    })
  }

  resetAddressForm() {
    this.addressForm = this.formBuilder.group({
      id: [0],
      userid: [''],
      address: ['', Validators.required],
      barangay: ['', Validators.required],
      city: ['', Validators.required],
      province: ['MET'],
      countrycode: ['PH'],
      zipCode: [''],
      isdefault: [false],
      postalCode: [''],
      prefecture: [''],
      states: [''],
    });

  }

  countryChange() {
    const address = this.addressForm.getRawValue();
    this.isLocal = address.countrycode === 'PH';
    this.contryProviceStates(address.countrycode)
  }

  getProvinceName(code: string) {
    return this.provinces.find(x => x.code === code).name;
  }

  getCountryName(code: string) {
    return this.countries.find(x => x.code === code).name;
  }

  editAddress(address: Address) {
    this.addressForm.patchValue(address as any);
    this.isEdit = true;
    this.isEditAddress = true;
    this.isLocal = address.countryCode === 'PH';
  }

  setDefault(address: Address) {
    address.isDefault = true;
    this.addressForm.patchValue(address as any);

    if (address.id != 0) {
      this.userService.updateUserAddress(address).then((success: User) => {
        this.addresses = success.addresses;
        this.isEdit = false;
        this.isEditAddress = false;
      }, (error) => {
        console.log(error.error);
      });
    }
  }


  addAddress() {
    this.isEdit = true;
    this.resetAddressForm();
  }

  cancelEdit() {
    this.isEdit = false;
    this.isAddressSaved = false;
    this.resetAddressForm();
  }

  saveAddress() {
    this.isAddressSaved = true;
    const address = this.addressForm.getRawValue();
    address.isdefault = this.defaultAddressCount === 0;
    address.userid = this.user.id;
    address.province = !this.isLocal ? this.provinces.find(x => x.code === 'N/A').code : address.province;

    if (Utils.isInvalidNumber(address.id) || address.id === 0) {
      this.userService.createUserAddress(address).then((success: User) => {
        this.addresses = success.addresses;
        this.isEdit = false;
        this.toasterService.alert('success', 'saving address');
      }, (error) => {
        this.toasterService.alert('danger', 'saving address');
        console.log(error.error);
      });
    } else {
      // update
      this.userService.updateUserAddress(address).then((success: User) => {
        this.addresses = success.addresses;
        this.isEdit = false;
        this.isEditAddress = false;
        this.toasterService.alert('success', 'updating address');
      }, (error) => {
        this.toasterService.alert('danger', 'updating address');
        console.log(error.error);
      });
    }
  }

  deleteAddress(address: Address) {
    this.addressForm.patchValue(address as any);
    address.userId = this.user.id;

    if (!Utils.isInvalidNumber(address.id) && address.id !== 0) {
      this.userService.deleteUserAddress(address).then((success: User) => {
        this.addresses = success.addresses;
      }, (error) => {
        console.log(error.error);
      });
    }

    this.isEdit = false;
  }


  
  contryProviceStates(country) {
    if (Utils.isArrayNullOrUndefinedOrEmpty(country)) {
      return;
    }

    const countries = this.countries.filter(x => x.code === country)[0];
    const code = countries.code;
    switch (country) {
      case 'PH':
        this.provinces = PROVINCE_CODES;
        this.addressForm.controls.province.setValidators([Validators.required]);
        break;
      case 'US':
        this.hasStates = true;
        this.states = US_STATES;
        this.addressForm.controls.states.setValidators([Validators.required]);
        break;
      case 'CN':
        this.hasStates = true;
        this.provinces = CHINA_STATES;
        this.addressForm.controls.province.setValidators([Validators.required]);
        break;
      case 'JP':
        this.addressForm.controls.prefecture.setValidators([Validators.required]);
        break;
      case 'CA':
        this.provinces = CANADA_PROVINCE;
        this.addressForm.controls.province.setValidators([Validators.required]);
        break;
      default:
        this.addressForm.controls.states.clearValidators();
        break;
    }
    this.addressForm.updateValueAndValidity();
  }

}
