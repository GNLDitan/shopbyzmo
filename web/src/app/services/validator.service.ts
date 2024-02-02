import { Injectable, InjectionToken } from '@angular/core';
import { Utils } from '../app.utils';

@Injectable()
export class ValidatorService {

  emailValidator(control) {
    if (control.value !== undefined && control.value != null) {
      // tslint:disable-next-line: max-line-length
      if (control.value.match(/[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/)) {
        return null;
      } else {
        return { invalidEmailAddress: true };
      }
    } else {
      return null;
    }
  }

  passwordValidator(control) {
    if (control.value !== undefined && control.value != null) {
      // {6,100}           - Assert password is between 6 and 100 characters
      // (?=.*[0-9])       - Assert a string has at least one number

      if (control.value.match(/^(?=.*\d)(?=.*[A-za-z])[\w`~!@#$%^&*()\-_=+\[{\]}\\|;:'",<.>\/?]{8,}$/)) {
        return null;
      } else {
        return { invalidPassword: true };
      }
    }
  }

  confirmPasswordValidator(control) {
    if (control.parent !== undefined) {
      if (control.value !== undefined || control.value != null) {
        if (control.value === control.parent.value.password) {
          return null;
        } else {
          return { passwordNotMatch: true };
        }
      }
    }
  }

  userEmailValidator(control) {
    if (control.value !== undefined && control.value != null) {
      return { invalidEmail: true };
    } else {
      return null;
    }

  }


  invalidIstallment(control) {
    if (control.value !== undefined && control.value != null) {
      if (parseInt(control.value) >= Utils.MIN_INSTALLMENT) {
        return null;
      } else {
        return { invalidIstallment: true };
      }
    } else {
      return null;
    }

  }


  numericalValidator(control) {
    if (control.value !== undefined && control.value != null) {
      // if (control.value.toString().match(/[a-zA-Z!#$%&'*+/:\\=?^_`{|}~-]/)) {
      //   return { numericOnly: true };
      // } else {
      //   return null;
      // }
      if (!control.value.toString().match(/\d+[eE][+-]\d+|\d+\.?\d*|\.\d+/)) {
        return { numericOnly: true };
      } else {
        return null;
      }

    } else {
      return { numericOnly: true };
    }
  }

  decimalValidator(control) {
    if (control.value !== undefined && control.value != null) {
      if (!control.value.toString().match(/^\s*-?\d+(\.\d{1,2})?\s*$/)) {
        return { twoDecimalOnly: true };
      } else {
        return null;
      }
    }
  }



  mobileNumberValidator(control) {
    if (control.value !== undefined || control.value != null) {
      if (!control.value.toString().match(/^((\\+91-?)|0)?[0-9]{10}$/)) {
        return { invalidMobileNumber: true };
      } else {
        return null;
      }
    }

    if (control.value.length !== 11) {
      return { length: true };
    }
  }

  mobileNonPHNumberValidator(control) {
    if (control.value !== undefined || control.value != null) {
      if (!control.value.toString().match(/^((\\+91-?)|0)?[0-9]/)) {
        return { invalidMobileNumber: true };
      } else {
        return null;
      }
    }

    if (control.value.length !== 11) {
      return { length: true };
    }
  }


  dateRangeValidator(control) {
    if (control.value !== undefined || control.value != null) {
      if (control.value < 1960 || control.value > 9999 || control.value === '') {
        return { dateInvalid: true };
      } else {
        return null;
      }
    } else {
      return { dateInvalid: true };
    }
  }

  numberRequired(control) {

    if (control.value !== undefined || control.value != null) {
      if (parseFloat(control.value) > 0) {
        return null;
      } else {
        return { numberRequired: true };
      }
    }

  }



}

export const config = {
  required: 'This field is required.',
  invalidEmailAddress: 'Invalid email address.',
  invalidPassword: 'Minimum of 8 characters with at least 1 number.',
  passwordNotMatch: 'Password did not match.',
  invalidEmail: 'Email already exist',
  alphabetOnly: 'Letters Only',
  numericOnly: 'Numeric Only',
  invalidmonth: 'Invalid Month',
  alphabetwithSpecialCharOnly: 'Invalid Input',
  dateInvalid: 'Date range is 1960 to 9999',
  negativeAmount: 'Enter a value of zero or higher',
  invalidMobileNumber: 'Invalid mobile number',
  invalidIstallment: 'Installment must be greater than or equal to 2 months',
  twoDecimalOnly: 'Allow 2 decimal places only',
  numberRequired: 'This field is required.',
};

export const FORM_ERRORS = new InjectionToken('FORM_ERRORS', {
  providedIn: 'root',
  factory: () => config
});
