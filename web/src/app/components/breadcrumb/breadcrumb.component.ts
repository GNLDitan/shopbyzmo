import { Component, OnInit } from '@angular/core';

import { Breadcrumb } from 'src/app/classes/breadcrumb';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {
  breadcrumbs: Breadcrumb[];

  constructor(private breadcrumbService: BreadcrumbService) {
    breadcrumbService.breadcrumbChanged.subscribe((crumbs: Breadcrumb[]) => { this.onBreadcrumbChange(crumbs); });
  }

  private onBreadcrumbChange(crumbs: Breadcrumb[]) {
    this.breadcrumbs = crumbs;
  }
}
