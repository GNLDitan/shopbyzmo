import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utils } from 'src/app/app.utils';
import { TransactionFee } from 'src/app/classes/transaction-fee';
import { ConfirmationService } from 'src/app/services/confirmation.service';

@Component({
  selector: 'app-transaction-fee',
  templateUrl: './transaction-fee.component.html',
  styleUrls: ['./transaction-fee.component.scss']
})
export class TransactionFeeComponent implements OnInit {
  @Input() selectedTransactionFees: TransactionFee;
  @Output() outputTransactionFees = new EventEmitter<TransactionFee>();
  @Output() outputIsCancel = new EventEmitter<boolean>();
  trasactionFeeForm: FormGroup;
  amountType: any;
  constructor(public formBuilder: FormBuilder,
    private confirmationService: ConfirmationService) {
    this.trasactionFeeForm = this.formBuilder.group({
      id: [0],
      description: ['', Validators.required],
      amountTypeId: [0],
      amount: [0],
      paymentMethodId: [0]
    });
    this.amountType = Utils.AMOUNT_TYPE;
  }

  ngOnInit() {
    this.trasactionFeeForm.patchValue(this.selectedTransactionFees);
  }

  saveData() {
    var trasactionFeeForm = this.trasactionFeeForm.getRawValue()
    this.outputTransactionFees.emit(trasactionFeeForm);
  }

  cancel() {
    const dialogQuestion = 'Are you sure to discard this account';
    const dialogMessage = 'Account will not be saved.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      null, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.outputIsCancel.emit(true);
      }
    }).catch(() => { });


  }

}
