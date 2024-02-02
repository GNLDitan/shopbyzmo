import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { BreadcrumbComponent } from 'src/app/components/breadcrumb/breadcrumb.component';

export function breadcrumbServiceFactory(router: Router) {
  return new BreadcrumbService(router);
}

@NgModule({
  imports: [CommonModule, RouterModule],
  providers: [
    { provide: BreadcrumbService, useFactory: breadcrumbServiceFactory, deps: [Router] }
  ]
})
export class BreadcrumbModule { }
