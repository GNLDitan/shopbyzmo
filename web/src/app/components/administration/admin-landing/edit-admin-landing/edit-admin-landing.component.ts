import { Component, OnInit, OnDestroy } from '@angular/core';
import { FileMapper } from 'src/app/classes/file-mapper';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { DataService } from 'src/app/services/data.service';
import { LandingService } from 'src/app/services/landing.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { environment } from 'src/environments/environment';
import { Utils } from 'src/app/app.utils';
import { ConfirmationService } from 'src/app/services/confirmation.service';

@Component({
  selector: 'app-edit-admin-landing',
  templateUrl: './edit-admin-landing.component.html',
  styleUrls: ['./edit-admin-landing.component.scss']
})
export class EditAdminLandingComponent implements OnInit, OnDestroy {
  landing: FileMapper;
  landingForm: FormGroup;
  landingImageUrl: string;
  landingImageBlob: ImageViewer;
  landingFolderPath: string;
  landingSubscription: any;

  constructor(private formBuilder: FormBuilder,
    private dataService: DataService,
    private landingService: LandingService,
    private navigationService: NavigationService,
    private toasterService: ToasterService,
    private confirmationService: ConfirmationService) {

    this.landingImageUrl = null;
    this.landingImageBlob = new ImageViewer();
    this.landing = new FileMapper();

    this.landingForm = this.formBuilder.group({
      id: [0],
      url: [''],
      key: [0],
      fileName: [''],
      isNewTab: [false]
    });
  }

  ngOnInit() {
    this.landingFolderPath = environment.landingFolderPath;
    this.subscribeLanding();
    console.log(this.landing);
  }

  ngOnDestroy() {
    this.dataService.selectedLanding$.subscribe();
  }
  subscribeLanding() {
    this.landingSubscription = this.dataService.selectedLanding$.subscribe((landing: any) => {
      if (landing.hasOwnProperty('id')) {
        this.landing = landing
        this.landingImageBlob.imageUrl = this.landingFolderPath + this.landing.fileName;
        this.landingImageUrl = this.landingImageBlob.imageUrl;
        this.landingForm.patchValue(this.landing);
      }
    });

  }

  uploadLandingImage(fileEvent: any) {

    this.landingImageBlob.file = fileEvent.target.files.item(0);

    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.landingImageBlob.imageUrl = event.target.result;
      this.landingImageUrl = event.target.result;
      fileEvent.target.value = '';
    };
    reader.readAsDataURL(this.landingImageBlob.file);

  }

  save() {

    if (this.landingImageUrl === null || this.landingImageUrl === '') {
      this.toasterService.alert('danger', 'please add image first.');
      return;
    } else if (!this.landingForm.valid) {
      this.toasterService.alert('danger', 'please fill up required fields.');
      return;
    }

    if (this.landingForm.valid) {
      this.landing = this.landingForm.getRawValue();
      this.landingService.editLanding(this.landingImageBlob, this.landing).then((landing: any) => {
        if (!Utils.isNullOrUndefined(landing)) {
          this.toasterService.alert('success', 'updating landing');
          this.navigationService.toAdminLanding();
        } else {
          this.toasterService.alert('danger', 'updating landing');
        }
      });
    }
  }

  deleteLanding() {
    const dialogQuestion = 'Are you sure to delete this landing image';
    const dialogMessage = 'Selected landing image will be deleted.';
    const dialogDanger = 'This operation can not be undone.';

    this.confirmationService.confirm(
      dialogQuestion, // Title
      dialogMessage, // Message
      "", // Highlighted text after title = nullable
      dialogDanger // Danger text after message = nullable
    ).then((confirmed: any) => {
      if (confirmed) {
        this.landingService.deleteLandingImageById(this.landing.id).then((success: any) => {
          if (success) {
            this.toasterService.alert('success', 'deleting landing image');
            this.navigationService.toAdminLanding();
          }
        });
      }
    }).catch(() => { });
  }

}
