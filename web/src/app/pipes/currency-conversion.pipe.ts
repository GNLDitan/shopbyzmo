import { getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CurrenyService } from '../services/currency.service';

/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({ name: 'conversion' })
export class CurrencyConversionPipe implements PipeTransform {
  constructor(private currencyService: CurrenyService) { }

  transform(value: number): string {
    let curr = this.currencyService.getCurrency();
    let cnvt = this.currencyService.priceConvert(value).toFixed(2);
    let symble = this.currencyService.getCurrencySymbol(curr);
    return symble.concat(cnvt.toString());
  }
}