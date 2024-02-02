import { Component, OnInit, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { EventEmitter } from 'protractor';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToasterService } from 'src/app/services/toaster.service';
import { Utils } from 'src/app/app.utils';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {
  confirmForm: FormGroup;
  @Input() title: string;
  @Input() message: string;
  @Input() highlightedText: string;
  @Input() dangerText: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() withTextBox: boolean;
  @Input() withSelectionBox: boolean;
  reasonText: string;
  reasonCancellation: any;
  constructor(private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private toasterService: ToasterService) {
    this.confirmForm = this.formBuilder.group({
      output: ['', Validators.required]
    });
    this.reasonCancellation = [];
  }

  ngOnInit() {
    this.reasonCancellation = Utils.REASON_FOR_CANCEL;
  }

  public decline() {
    this.activeModal.close(false);
  }

  public accept() {
    if (this.withTextBox || this.withSelectionBox) {
      if (!this.confirmForm.valid) {
        this.toasterService.alert('danger', 'please input reason for cancellation.');
        return;
      }

      if (this.confirmForm.valid) {
        let confirmForm = this.confirmForm.getRawValue();
        this.reasonText = confirmForm.output;
        this.activeModal.close(this.reasonText);
      }
    }
    else {
      this.activeModal.close(true);
    }
  }

  public dismiss() {
    this.activeModal.dismiss(false);
  }

}
