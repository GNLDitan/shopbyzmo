import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

import { Breadcrumb } from 'src/app/classes/breadcrumb';

@Component({
  selector: 'app-profile-dashboard',
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.scss']
})
export class ProfileDashboardComponent implements OnInit {

  constructor(private titleService: Title,
    private breadcrumbService: BreadcrumbService
  ) { }

  ngOnInit() {
    this.breadcrumbService.breadcrumbChanged.subscribe((crumbs) => {
      //this.titleService.setTitle(this.createTitle(crumbs));
    });
  }


  // private createTitle(routesCollection: Breadcrumb[]) {
  //   const title = 'Profile';
  //   const titles = routesCollection.filter((route) => route.displayName);

  //   if (!titles.length) { return title; }

  //   const routeTitle = this.titlesToString(titles);
  //   return `${routeTitle}`;

  // }

  // private titlesToString(titles) {
  //   return titles.reduce((prev, curr) => {
  //     return `${curr.displayName}`;
  //   }, '');
  // }
}
