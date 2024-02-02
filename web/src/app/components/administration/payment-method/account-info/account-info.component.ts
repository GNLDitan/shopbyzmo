import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PaymentMethodAccount } from 'src/app/classes/payment-method-account';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/app.utils';
import { ValidatorService } from 'src/app/services/validator.service';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit {

  @Input() accountCount: number;
  @Output() accountInfo = new EventEmitter<PaymentMethodAccount>();
  @Output() viewAccountInfo = new EventEmitter<boolean>();
  accountForm: FormGroup;
  selectedAccountSubscription: Subscription;
  private selectedAccount: PaymentMethodAccount;
  constructor(private formBuilder: FormBuilder,
    private dataService: DataService,
    private toasterService: ToasterService,
    private confirmationService: ConfirmationService,
    private validatorService: ValidatorService) {

    this.accountForm = this.formBuilder.group({
      bankName: ['', Validators.required],
      accountNumber: [, [validatorService.numericalValidator, Validators.required]],
      accountName: ['', Validators.required]
    });

    this.selectedAccount = new PaymentMethodAccount();
  }

  ngOnInit() {
    this.loadAccountInfo();
  }

  loadAccountInfo() {

    this.selectedAccountSubscription = this.dataService.selectedAccount$.subscribe((dataComponent: PaymentMethodAccount) => {
      if (!Utils.isNullOrUndefined(dataComponent)) {
        this.selectedAccount = dataComponent;
        this.accountForm.patchValue(this.selectedAccount);
      }

    });
  }

  ngOnDestroy() {
    this.viewAccountInfo.unsubscribe();
    this.dataService.setSelectedAccount(new PaymentMethodAccount());
  }

  infoCancel() {
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
        this.viewAccountInfo.emit(false);
      }
    }).catch(() => { });

  }

  createUpdateHandler() {
    if (this.accountForm.valid) {
      if ((this.selectedAccount.id === undefined || this.selectedAccount.id === 0)) {
        this.createContent();
      } else {
        this.updateContent();
      }
    }



  }

  createContent() {
    let newAccount = new PaymentMethodAccount();
    const accountForm = this.accountForm.getRawValue();

    newAccount = accountForm;
    newAccount.isNew = true;
    newAccount.id = this.selectedAccount.id == 0 ? this.accountCount + 1 : this.selectedAccount.id;
    newAccount.key = 0;
    this.accountInfo.emit(newAccount);
    this.viewAccountInfo.emit(false);
  }

  updateContent() {
    let updateAccount = new PaymentMethodAccount();

    const accountForm = this.accountForm.getRawValue();

    updateAccount = accountForm;
    updateAccount.id = this.selectedAccount.id == 0 ? this.accountCount + 1 : this.selectedAccount.id;
    updateAccount.isNew = this.selectedAccount.key == 0 ? true : false;
    this.accountInfo.emit(updateAccount);
    this.viewAccountInfo.emit(false);
  }


}
