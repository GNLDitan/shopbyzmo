import { Component, OnInit } from '@angular/core';
import { Utils } from 'src/app/app.utils';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(private navigationService: NavigationService) { }

  ngOnInit() {
    if (Utils.isStringNullOrEmpty(localStorage.getItem(Utils.LS_TOKEN))) {
      this.navigationService.toHome();
    }
  }
}
