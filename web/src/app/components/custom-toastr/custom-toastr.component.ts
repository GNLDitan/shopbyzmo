import { Component } from '@angular/core';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Toast, ToastrService, ToastPackage } from 'ngx-toastr';

@Component({
  selector: '[custom-toast.component]',
  templateUrl: './custom-toastr.component.html',
  styleUrls: ['./custom-toastr.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('inactive', style({
        display: 'none',
        opacity: 0
      })),
      transition('inactive => active', animate('400ms ease-out', keyframes([
        style({
          opacity: 0,
        }),
        style({
          opacity: 1,
        })
      ]))),
      transition('active => removed', animate('400ms ease-out', keyframes([
        style({
          opacity: 1,
        }),
        style({
          transform: 'translate3d(10%, 0, 0) skewX(10deg)',
          opacity: 0,
        }),
      ]))),
    ]),
  ],
  preserveWhitespaces: false,
})
export class CustomToastrComponent extends Toast {

  dateTime = '';
  undoString = 'undo';
  constructor(protected toastrService: ToastrService,
    public toastPackage: ToastPackage,
  ) {
    super(toastrService, toastPackage);

    const date = new Date();
    // tslint:disable-next-line: max-line-length
    this.dateTime = date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  }
  action(event: Event) {
    event.stopPropagation();
    this.toastPackage.triggerAction();
    return false;
  }
}
