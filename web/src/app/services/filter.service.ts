import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileService } from './file.service';
import { DataService } from './data.service';
import { FilterSetting } from '../classes/filter-settings';

@Injectable({
    providedIn: 'root'
})
export class FilterService {

    private readonly api: string;

    constructor(public dataService: DataService) {
    }

    setFilter(filter: FilterSetting) {
        this.dataService.setFilter(filter);
    }

    setGlobalFilter(filter: FilterSetting) {
        this.dataService.setGlobalFilter(filter);
    }

}
