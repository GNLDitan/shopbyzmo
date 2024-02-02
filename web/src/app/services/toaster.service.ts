import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  constructor(private toastrService: ToastrService) { }

  alert(type: string, message: string) {
    let borderClass = null;
    let title = null;
    const _message = message;

    switch (type) {
      case 'info': // For no issue alert
        borderClass = 'toastr-info';
        title = 'Information';
        break;
      case 'success': // For a success of create and update alert
        borderClass = 'toastr-success';
        title = 'Success';
        break;
      case 'warning': // For user warning alert
        borderClass = 'toastr-warning';
        title = 'Warning';
        break;
      case 'danger': // For error alert
        borderClass = 'toastr-danger';
        title = 'Error';
        break;
      default:
        borderClass = 'toastr-info';
        title = 'Information';
        break;
    }

    this.toastrService.show(_message, title, {
      timeOut: 2000,
      tapToDismiss: false,
      closeButton: true,
      toastClass: 'toastr ' + borderClass,
      positionClass: 'toast-top-right'
    });
  }
}
