import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';
import { AuthorisedsidenavService } from 'src/app/services/authorisedsidenav.service';
import { User } from 'src/app/classes/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {
  activeUser: User;

  constructor(private navigation: NavigationService,
    private userService: UserService,
    public sideNavService: AuthorisedsidenavService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataService: DataService) { this.activeUser = new User(); }



  ngOnInit() {
    this.getUser();
  }

  logout() {
    this.userService.logout();
    this.navigation.toHome();
  }

  getUser() {
    const email = localStorage.getItem('email');

    this.userService.getUserByEmail(email).then((user: User) => {
      this.activeUser = user;
      this.dataService.setUser(user);
    });
  }

}
