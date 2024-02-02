import { Injectable } from '@angular/core';
import { Utils } from '../app.utils';
import { DataService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { ProductCategory } from '../classes/product-category';
import { HomeFeatures } from '../classes/home-features';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    mappingList: any;
    api: any;

    categoryHierarchy: any = {
        category: 'category',
        subcategory: 'subcategory',
        brand: 'brand',
        subbrand: 'subbrand'
    }

    constructor(private http: HttpClient,
        public dataService: DataService) {
        this.mappingList = [];
        this.api = '/product';
    }

    getAllCategory() {
        new Promise((resolve, reject) => {
            this.http.get(`${this.api}/getallcategory`)
                .subscribe((next: any) => {
                    this.dataService.setCategory(next);
                    resolve(next)
                }, error => reject(error));
        });
    }

    getChildCategory(code: string): any {
        return this.dataService.allCategory.filter(x => x.parentCategory === code);
    }

    getNextIdHierarchy(key: any): string {
        var index = this.getHierarchyCurrentIndex(key);
        if (index < Object.keys(this.categoryHierarchy).length)
            return this.generateCategoryId(Object.entries(this.categoryHierarchy)[index + 1][1]);
        else return '';
    }

    generateCategoryId(category: any): string {
        return category + 'id';
    }

    categoryMapping(code: string, mappingList: any = new Array()): any {
        let category = this.dataService.allCategory.filter(x => x.code === code)[0];
        if (!Utils.isNullOrUndefined(category)) {
            mappingList.push(category)
            if (category != null && category.parentCategory) {
                this.categoryMapping(category.parentCategory, mappingList);
            }
        }
        return mappingList;
    }


    getAllSubCategories(code: string, mappingList: any = new Array(),
        cnt: number = 0): any {

        let mapping = this.dataService.allCategory.filter(x => x.parentCategory === code);

        while (cnt < mapping.length) {
            var subCode = mapping[cnt].code;
            var subCatMap = this.dataService.allCategory.filter(x => x.parentCategory === subCode);
            mappingList.push(mapping[cnt]);

            if (subCatMap.length > 0) {
                this.getAllSubCategories(subCode, mappingList, 0)
            }
            cnt++;
        }
        return mappingList;
    }

    getHierarchyCurrentIndex(category) {
        var key = category.substr(0, category.length - 2);

        return Object.keys(this.categoryHierarchy)
            .indexOf(key)
    }


    getAllCategoryByHierarchy(param: any) {
        return this.dataService.allCategory.filter(x => x.categoryHierarchy === param);
    }

    createProductCategory(category: ProductCategory) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/createproductcategory`, category)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        });
    }

    updateProductCategory(category: ProductCategory) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/updateproductcategory`, category)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        });
    }

    deleteProductCategory(id: number) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/deleteproductcategory`, id)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        });
    }
    createHomeFeature(homeFeatures: HomeFeatures) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/createhomefeature`, homeFeatures)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        });
    }

    getHomeFeature() {
        return new Promise((resolve, reject) => {
            this.http.get(`${this.api}/gethomefeature`)
                .subscribe((data: any) => {
                    this.dataService.setSelectedHomeFeature(data);
                    resolve(data)
                }, (error) => reject(error));
        });
    }

    generateCategoryCode(name: string): string {
        let code = Utils.GenerateAcronym(name);
        let cnt = 0;
        let found = this.dataService.allCategory.filter(x => x.code === code).length > 0;

        while (found) {
            let lastword = code.split(" ").splice(-1).toString();
            let res = lastword.charAt(cnt);
            code = code + res;
            found = this.dataService.allCategory.filter(x => x.code === code).length > 0;
            cnt++;
        }
        return code;
    }

    deleteProductCategoryList(code: Array<string>) {
        return new Promise((resolve, reject) => {
            this.http.post(`${this.api}/deleteproductcategorylist`, code)
                .subscribe((data: any) => resolve(data), (error) => reject(error));
        });
    }




}
