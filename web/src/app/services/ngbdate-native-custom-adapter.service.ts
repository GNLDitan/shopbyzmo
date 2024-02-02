import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateFormat } from '../classes/date-format';
import * as moment from 'moment';

@Injectable()
export class NgbdateNativeCustomAdapterService extends NgbDateAdapter<string> {
  fromModel(date: string): DateFormat {
    date = date != null ? date.replace('T', ' ') : date;
    let newDate = new Date(date);
    return (date) ?
      {
        month: newDate.getMonth() + 1,
        day: newDate.getDate(),
        year: newDate.getFullYear(),
        formattedDate: null,
        time: date.substring(11, 25)
      } : null;

    // return (date && Number(date.substring(0, 2) + 1) && Number(date.substring(3, 5)) && Number(date.substring(6, 10))) ?
    //   {
    //     month: Number(date.substring(0, 2)),
    //     day: Number(date.substring(3, 5)),
    //     year: Number(date.substring(6, 10)),
    //     formattedDate: null,
    //     time: null
    //   } : null;
  }

  toModel(date: DateFormat): string {
    return date ? String('00' + date.month).slice(-2)
      + '-' + String('00' + date.day).slice(-2) + '-' + date.year.toString() + ' ' + moment().format("HH:mm:ss ZZ").replace(' ', '') : null;
  }

  constructor() {
    super();
  }
}

