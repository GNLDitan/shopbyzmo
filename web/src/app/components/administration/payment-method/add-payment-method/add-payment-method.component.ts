import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PaymentMethod } from 'src/app/classes/payment-method';
import { ValidatorService } from 'src/app/services/validator.service';
import { DataService } from 'src/app/services/data.service';
import { PaymentService } from 'src/app/services/payment.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { PaymentMethodAccount } from 'src/app/classes/payment-method-account';
import { Utils } from 'src/app/app.utils';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { TransactionFee } from 'src/app/classes/transaction-fee';

@Component({
  selector: 'app-add-payment-method',
  templateUrl: './add-payment-method.component.html',
  styleUrls: ['./add-payment-method.component.scss']
})
export class AddPaymentMethodComponent implements OnInit {
  @ViewChild('quillEditor', { static: false }) quillEditor: any;
  paymentMethodForm: FormGroup;
  paymentMethod: PaymentMethod
  editor_modules = {};
  editor_description_modules = {};
  paymentMethodAccounts: Array<PaymentMethodAccount>;
  viewAccountInfo = false;
  transactionFees: Array<TransactionFee>;
  selectedTransactionFee: TransactionFee;
  isAddFee: boolean;
  isEditFee: boolean;
  editIndex: number;
  constructor(private formBuilder: FormBuilder,
    private validatorService: ValidatorService,
    private dataService: DataService,
    private paymentService: PaymentService,
    private navigationService: NavigationService,
    private confirmationService: ConfirmationService,
    private toasterService: ToasterService) {

    this.paymentMethod = new PaymentMethod();
    this.paymentMethodAccounts = new Array<PaymentMethodAccount>();
    this.transactionFees = new Array<TransactionFee>();
    this.selectedTransactionFee = new TransactionFee();
    this.paymentMethodForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      withAccount: [true],
      withTransactionFee: [false],
      emailInstruction: ['', Validators.required],
      isActive: [true],
      isEnable: [true]
    });

    this.editor_modules = {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ color: [] }, { background: [] }],
          ['clean']
        ]
      }
    };

    this.editor_description_modules = {
      toolbar: {
        container: [
          [{ align: [] }]
        ]
      }
    };


  }

  ngOnInit() {
    this.viewAccountInfo = false;
  }

  ngAfterViewInit() {
    this.quillEditor.elementRef.nativeElement
      .querySelector('.ql-editor').classList
      .add('form-control');
  }

  onEditorCreated(event: any) {
    if (event != null) {
      event.root.innerHTML = this.paymentMethodForm.controls.description.value;
    }
  }

  accountInfo(account: PaymentMethodAccount = null) {
    const info = account != null ? account : new PaymentMethodAccount();
    this.dataService.setSelectedAccount(info);
    this.viewAccountInfo = true;
  }

  editAccountInfo(account: PaymentMethodAccount) {
    this.dataService.setSelectedAccount(account);
    this.viewAccountInfo = true;
  }

  cancelViewAccountInfo($event: any) {
    if ($event != null) {
      this.viewAccountInfo = $event;
    }
  }

  contentHandler($event: any) {
    if ($event != null) {
      this.paymentMethodAccounts = (Utils.ArrayObjectUpdater(this.paymentMethodAccounts, $event));
      this.paymentMethodAccounts = this.paymentMethodAccounts.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    }
  }

  deleteAccount(account: PaymentMethodAccount) {
    this.paymentMethodAccounts.map((act) => {
      act.isDeleted = act.id == account.id ? true : act.isDeleted;
    });

  }

  undoRemove(account: PaymentMethodAccount) {
    this.paymentMethodAccounts.map((act) => {
      act.isDeleted = act.id == account.id ? false : act.isDeleted;
    });
  }

  save() {


    if ((this.viewAccountInfo || (this.paymentMethodAccounts.filter(x => !x.isDeleted).length === 0 && this.paymentMethodForm.controls['withAccount'].value)) && this.paymentMethodForm.valid) {
      this.toasterService.alert('danger', 'please save account details first.');
      return;
    } else if (!this.paymentMethodForm.valid) {
      this.toasterService.alert('danger', 'please fill up required fields.');
      return;
    } else if (this.paymentMethodForm.controls['withTransactionFee'].value) {
      if (this.transactionFees.length === 0) {
        this.toasterService.alert('danger', 'please input atleast one transaction fee.');
        return;
      }
    }


    if (this.paymentMethodForm.valid) {
      this.paymentMethod = this.paymentMethodForm.getRawValue();
      this.paymentMethod.paymentMethodAccounts = this.paymentMethodAccounts;
      this.paymentService.createPaymentMethod(this.paymentMethod).then((paymentMethod: any) => {
        if (!Utils.isNullOrUndefined(paymentMethod)) {
          this.toasterService.alert('success', 'saving payment method');

          this.transactionFees.map(fees => fees.paymentMethodId = paymentMethod.id);
          this.paymentService.createTransactionFeesBulk(this.transactionFees);

          this.navigationService.toAdminPaymentMethod();
        } else {
          this.toasterService.alert('danger', 'saving payment method');
        }
      });
    }
  }

  addTransactionFee() {
    this.selectedTransactionFee = new TransactionFee();
    this.selectedTransactionFee.paymentMethodId = this.paymentMethod.id;
    this.isAddFee = true;
    this.editIndex = -1;
  }

  saveTransactionFee(transactionFee: TransactionFee) {
    if (this.isAddFee) {
      if (this.editIndex >= 0) {
        this.transactionFees[this.editIndex] = transactionFee;
      } else
        this.transactionFees.push(transactionFee);
    }

    this.isAddFee = false;
    this.editIndex = -1;
  }

  editTransactionFee(transactionFee: TransactionFee, i) {
    this.selectedTransactionFee = transactionFee;
    this.isAddFee = true;
    this.editIndex = i;
  }


  deleteTransactionFee(i) {
    const dialogQuestion = 'Are you sure to discard this Fee';
    const dialogMessage = 'Transaction Fee will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      null, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.transactionFees.splice(i, 1)
      }
    }).catch(() => { });
  }

  getRateDescription(code: number) {
    if (Utils.isArrayNullOrUndefinedOrEmpty(code))
      return '';

    return Utils.AMOUNT_TYPE.filter(x => x.code == code)[0].description;
  }

  cancelTransactionFee(isCancel) {
    this.isAddFee = !isCancel;
  }


}
