import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileDashboardComponent } from 'src/app/components/profile/profile-dashboard/profile-dashboard.component';
import { InformationComponent } from 'src/app/components/profile/information/information.component';
import { AddressesComponent } from 'src/app/components/profile/addresses/addresses.component';


const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Profile'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: ProfileDashboardComponent,
      },
      {
        path: 'information',
        data: {
          breadcrumb: 'Information'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: InformationComponent,
          },
          {
            path: 'addresses',
            data: {
              breadcrumb: 'Addresses'
            },
            component: AddressesComponent
          }
        ]
      },
      {
        path: 'addresses',
        data: {
          breadcrumb: 'Addresses'
        },
        component: AddressesComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileDashboardRoutingModule { }
