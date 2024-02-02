import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/classes/user';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { Utils } from 'src/app/app.utils';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-user-admin-management',
  templateUrl: './user-admin-management.component.html',
  styleUrls: ['./user-admin-management.component.scss']
})
export class UserAdminManagementComponent implements OnInit {
  adminUsers: Array<User>;
  config: any;
  activeUser: User;

  constructor(private userService: UserService,
    private confirmationService: ConfirmationService,
    private toasterService: ToasterService,
    private dataService: DataService) {
    this.adminUsers = new Array();
    this.activeUser = new User();
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.adminUsers.length
    };
  }

  ngOnInit() {
    this.getAllUserAdmin();
    this.dataService.user$.subscribe((next) => {
      this.activeUser = next;
    });
  }

  getAllUserAdmin() {
    this.userService.getAllUserAdmin().then((result: any) => {
      this.adminUsers = result;
    });
  }




  delete(user: User) {
    const dialogQuestion = 'Are you sure to delete this user?';
    const dialogMessage = 'Selected user will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      user.name, // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.userService.deleteUserById(user.id).then((success: any) => {
          if (success) {
            const index = this.adminUsers.findIndex(x => x.id === user.id);
            this.adminUsers.splice(index, 1);
            this.config = {
              itemsPerPage: 10,
              currentPage: 1,
              totalItems: this.adminUsers.length
            };
            this.toasterService.alert('success', 'deleting user');
          }
        }).catch((error) => {
          this.toasterService.alert('danger', error.statusText);
        });
      }
    }).catch(() => { });
  }


}
