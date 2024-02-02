import { Component, OnInit } from '@angular/core';
import { FileMapper } from 'src/app/classes/file-mapper';
import { LandingService } from 'src/app/services/landing.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-admin-landing',
  templateUrl: './admin-landing.component.html',
  styleUrls: ['./admin-landing.component.scss']
})
export class AdminLandingComponent implements OnInit {

  public landings: Array<FileMapper>;
  landingImageFolderPath: any;
  config: any;

  constructor(private landingService: LandingService,
    private navigationService: NavigationService,
    private confirmationService: ConfirmationService,
    private SpinnerService: NgxSpinnerService,
    private toasterService: ToasterService) {
    this.landings = new Array();

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.landings.length
    };
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  ngOnInit() {
    this.landingImageFolderPath = environment.landingFolderPath;
    this.getLandings();
  }

  getLandings() {
    this.SpinnerService.show();
    this.landingService.getlandingimages().then((landings: any) => {
      this.landings = landings;
      this.SpinnerService.hide();
    });
  }

  getFullPath(filename: any): string {
    return this.landingImageFolderPath + filename;
  }

  moveOrderId(landing: any, moveTypeId: number) {
    landing.moveTypeId = moveTypeId;
    this.landingService.moveOrderId(landing).then((success: any) => {
      if (success) {
        this.getLandings();
      }
    }, (error) => { console.log(error.error); });
  }

  deleteLanding(landing: FileMapper) {
    const dialogQuestion = 'Are you sure to delete this landing image';
    const dialogMessage = 'Selected landing image will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      '', // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.landingService.deleteLandingImageById(landing.id).then((success: any) => {
          if (success) {
            const index = this.landings.findIndex(x => x.id === landing.id);
            this.landings.splice(index, 1);
            this.config = {
              itemsPerPage: 10,
              currentPage: 1,
              totalItems: this.landings.length
            };
            this.toasterService.alert('success', 'deleting landing image');
            this.getLandings();
          }
        });
      }
    }).catch(() => { });

  }

}
