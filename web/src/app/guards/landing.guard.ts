import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';
import { LandingService } from '../services/landing.service';
import { FileMapper } from '../classes/file-mapper';

@Injectable({
  providedIn: 'root'
})
export class LandingGuard implements CanActivate {

  constructor(private dataService: DataService,
    private landingService: LandingService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const param: any = next.params.id;
    this.landingService.getLandingImageById(param).then((landing: FileMapper) => {
      if (landing != null) {
        this.dataService.setLandingImage(landing);
      } else return false;
    });
    return true;
  }

}
