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
  selector: 'app-edit-payment-method',
  templateUrl: './edit-payment-method.component.html',
  styleUrls: ['./edit-payment-method.component.scss']
})
export class EditPaymentMethodComponent implements OnInit {
  @ViewChild('quillEditor', { static: false }) quillEditor: any;
  paymentMethodForm: FormGroup;
  paymentMethod: PaymentMethod
  editor_modules = {};
  editor_description_modules = {};
  paymentMethodAccounts: Array<PaymentMethodAccount>;
  viewAccountInfo = false;
  paymentMethodSubscription: any;
  accountCount: number;
  transactionFees: Array<TransactionFee>;
  isAddFee: boolean;
  selectedTransactionFee: TransactionFee;
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
      id: [0],
      name: ['', Validators.required],
      description: ['', Validators.required],
      withAccount: [true],
      emailInstruction: ['', Validators.required],
      isActive: [true],
      withTransactionFee: [true],
      isPaymongo: [false]
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
    this.accountCount = 0;
  }

  ngOnInit() {
    this.viewAccountInfo = false;
    this.subscribePaymentMethod();

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

  onEditorInstructionCreated(event: any) {
    if (event != null) {
      event.root.innerHTML = this.paymentMethodForm.controls.emailInstruction.value;
    }
  }


  ngOnDestroy() {
    this.dataService.selectedPaymentMethod$.subscribe();
  }

  subscribePaymentMethod() {
    this.paymentMethodSubscription = this.dataService.selectedPaymentMethod$.subscribe((paymentMethod: any) => {
      if (paymentMethod.hasOwnProperty('id')) {
        this.paymentMethod = paymentMethod;
        this.paymentMethodAccounts = paymentMethod.paymentMethodAccounts;
        if (this.paymentMethodAccounts.length > 0)
          this.accountCount = this.paymentMethodAccounts[this.paymentMethodAccounts.length - 1].id;
        this.paymentMethodForm.patchValue(this.paymentMethod);
        this.getTransactionFee();
      }
    });

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
      this.paymentService.updatePaymentMethod(this.paymentMethod).then((paymentMethod: any) => {
        if (!Utils.isNullOrUndefined(paymentMethod)) {
          this.toasterService.alert('success', 'updating payment method');
          this.navigationService.toAdminPaymentMethod();
        } else {
          this.toasterService.alert('danger', 'updating payment method');
        }
      });
    }
  }

  addTransactionFee() {
    this.selectedTransactionFee = new TransactionFee();
    this.selectedTransactionFee.paymentMethodId = this.paymentMethod.id;
    this.isAddFee = true;
  }

  editTransactionFee(transactionFee: TransactionFee) {
    this.selectedTransactionFee = transactionFee;
    this.isAddFee = true;
  }

  saveTransactionFee(transactionFee: TransactionFee) {
    if (transactionFee.id == 0) {
      this.paymentService.createTransactionFees(transactionFee).then((result: any) => {
        this.transactionFees = result;
        this.toasterService.alert('success', 'creating transaction fee');
      }).catch(() => {
        this.toasterService.alert('error', 'creating transaction fee');
      })
    } else {
      this.paymentService.updateTransactionFees(transactionFee).then((result: any) => {
        this.transactionFees = result;
        this.toasterService.alert('success', 'updating transaction fee');
      }).catch(() => {
        this.toasterService.alert('error', 'updating transaction fee');
      })
    }
    this.isAddFee = false;
  }

  cancelTransactionFee(isCancel) {
    this.isAddFee = !isCancel;
  }


  getTransactionFee() {
    this.paymentService.getTransactionFeesByPaymentMethodId(this.paymentMethod.id).then((result: any) => {
      this.transactionFees = result;
    })
  }

  getRateDescription(code: number) {
    if (Utils.isArrayNullOrUndefinedOrEmpty(code))
      return '';

    return Utils.AMOUNT_TYPE.filter(x => x.code == code)[0].description;
  }

  deleteTransactionFee(transactionFee: TransactionFee) {
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
        this.paymentService.deleteTransactionFees(transactionFee).then((result: any) => {
          this.transactionFees = result;
          this.toasterService.alert('success', 'deleting transaction fee');
        }).catch(() => {
          this.toasterService.alert('error', 'deleting transaction fee');
        })
      }
    }).catch(() => { });
  }

}
