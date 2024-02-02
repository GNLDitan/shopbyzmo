import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ImageViewer } from 'src/app/classes/image-viewer';
import { LandingService } from 'src/app/services/landing.service';
import { FileMapper } from 'src/app/classes/file-mapper';
import { Utils } from 'src/app/app.utils';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-add-admin-landing',
  templateUrl: './add-admin-landing.component.html',
  styleUrls: ['./add-admin-landing.component.scss']
})
export class AddAdminLandingComponent implements OnInit {
  landingForm: FormGroup;
  landingImageUrl: string;
  landingImageBlob: ImageViewer;
  landing: FileMapper;

  constructor(private formBuilder: FormBuilder,
    private landingService: LandingService,
    private navigationService: NavigationService,
    private toasterService: ToasterService) {
    this.landingImageUrl = null;
    this.landingImageBlob = new ImageViewer();

    this.landingForm = this.formBuilder.group({
      url: [''],
      isNewTab: [false]
    });
  }

  ngOnInit() {
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
      this.landingService.createLanding(this.landingImageBlob, this.landing).then((landing: any) => {
        if (!Utils.isNullOrUndefined(landing)) {
          this.toasterService.alert('success', 'saving landing');
          this.navigationService.toAdminLanding();
        } else {
          this.toasterService.alert('danger', 'saving landing');
        }
      });
    }
  }

  deleteLanding() {

  }
}
