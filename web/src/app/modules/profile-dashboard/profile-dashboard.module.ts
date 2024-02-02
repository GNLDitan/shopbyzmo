import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileDashboardRoutingModule } from './profile-dashboard-routing.module';
import { ProfileDashboardComponent } from 'src/app/components/profile/profile-dashboard/profile-dashboard.component';
import { InformationComponent } from 'src/app/components/profile/information/information.component';
import { AddressesComponent } from 'src/app/components/profile/addresses/addresses.component';
import { SpinnerComponent } from 'src/app/elements/spinner/spinner.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlErrorsDirective } from 'src/app/directives/control-errors.directive';
import { FormSubmitDirective } from 'src/app/directives/form-submit.directive';
import { ControlErrorComponent } from 'src/app/components/control-error/control-error.component';
import { ControlErrorContainerDirective } from 'src/app/directives/control-error-container.directive';

@NgModule({
  declarations: [ProfileDashboardComponent,
    InformationComponent,
    AddressesComponent,
    SpinnerComponent,
    ControlErrorsDirective,
    FormSubmitDirective,
    ControlErrorComponent,
    ControlErrorContainerDirective
  ],
  imports: [
    CommonModule,
    ProfileDashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [SpinnerComponent,
    ControlErrorsDirective,
    FormSubmitDirective,
    ControlErrorComponent,
    ControlErrorContainerDirective]
})
export class ProfileDashboardModule { }
