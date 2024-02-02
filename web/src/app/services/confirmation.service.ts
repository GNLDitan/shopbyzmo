import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(private modalService: NgbModal) { }

  confirm(
    title: string,
    message: string,
    highlightedText: string = '',
    dangerText: string = '',
    withTextBox: boolean = false,
    withSelectionBox: boolean = false,
    btnOkText: string = 'Confirm',
    btnCancelText: string = 'Cancel'): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      backdrop: 'static',
      windowClass: 'byz-modal-dialog'
    });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.highlightedText = highlightedText;
    modalRef.componentInstance.dangerText = dangerText;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;
    modalRef.componentInstance.withTextBox = withTextBox;
    modalRef.componentInstance.withSelectionBox = withSelectionBox;

    return modalRef.result;
  }
}
