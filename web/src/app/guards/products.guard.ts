import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Utils } from '../app.utils';
import { MetaTagService } from '../services/meta-tag.service';
import { DomService } from '../services/dom-service';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class ProductsGuard implements CanActivate {

    constructor(private metaService: MetaTagService,
        private domService: DomService,
        private activatedRoute: ActivatedRoute,
        private router: Router) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        this.activatedRoute.queryParams.subscribe(params => {
            let catList = [];
            let des = '';
            if (!Utils.isNullOrUndefined(params.category))
                catList = params.category.replace(/-/g, ' ').split(':');

            if (catList.length > 0) {
                des = catList.map((a, i) => ((i == 0 ? '' : ' - ') + a)).join('');
            }

            this.domService.setH1Body('Shop Byzmo Products');
            this.domService.setCanonicalURL(`${environment.webUrl}/${this.router.url}`);
            
            this.metaService.setTitle(`${des} - Byzmo Online Shop`)
            this.metaService.setSocialMediaTags(`${environment.webUrl}/${this.router.url}`,
                `${des} - Byzmo Online Shop`,
                `Find your ${des} at shopbyzmo.com`,
                null);
        });
        return true;
    }

}
