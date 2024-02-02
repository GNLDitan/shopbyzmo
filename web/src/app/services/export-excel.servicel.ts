import { Injectable } from '@angular/core';

import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
import { Utils } from '../app.utils';
import * as moment from 'moment';
import { FilterSetting } from '../classes/filter-settings';

@Injectable({
    providedIn: 'root'
})
export class ExportToExcelService {

    EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    EXCEL_EXTENSION = '.xlsx';
    statusFilter: any;
    startrow: number;
    header: any;
    columns: any;
    title: string;
    total: number;

    constructor() {
        this.statusFilter = Utils.ORDER_STATUS;
    }

    exportExcelOrderMaster(reports, header, columns, title, startRow, total = 0) {
        this.columns = columns;
        this.header = header;
        this.startrow = startRow;
        this.title = title;
        this.total = total;
        this.bindingRecord(reports);
    }

    bindingRecord(obj) {
        const record = [];
        const header = this.columns.map(x => x.key);
        const origin = 'A' + this.startrow;
        const options: any = { header, origin };

        obj.map((report) => {
            const cols = {};
            this.columns.forEach((col) => {
                if (col.column === 'statusId') {
                    cols[col.key] = this.descriptionStatus(report[col.column]);
                } else if (col.column === 'isSendEmail') {
                    cols[col.key] = report[col.column] ? 'Sent' : 'Not Yet';
                } else if (col.column === 'orderDate') {
                    cols[col.key] = moment(report[col.column]).format('MM/DD/YYYY');
                } else if (col.column === 'products') {
                    cols[col.key] = report[col.column].map(x => x.productName).join(' ');
                } else if (col.column === 'dueDate') {
                    cols[col.key] = moment(report[col.column]).format('MM/DD/YYYY');
                } else if (col.column === 'dateCreated') {
                    cols[col.key] = moment(report[col.column]).format('MM/DD/YYYY');
                } else if (col.key === 'Discount Codes') {
                    let qlfd = '';
                    if (report[col.column].length > 0) {
                        qlfd = report[col.column][0].discountCode;
                    }
                    cols[col.key] = qlfd;
                } else if (col.key === 'Availed') {
                    let qlfd = '';
                    if (report[col.column].length > 0) {
                        qlfd = report[col.column][0].availed;
                    }
                    cols[col.key] = qlfd;
                } else if (col.key === 'Order No.') {
                    let qlfd = '';
                    if (report[col.column].length > 0) {
                        qlfd = report[col.column][0].orderId;
                    }
                    cols[col.key] = qlfd;
                } else {
                    cols[col.key] = report[col.column];
                }
            });
            record.push(cols);
        });


        this.exportAsExcelFile(record, this.title, options);
    }



    setHeader(worksheet) {
        this.header.forEach((hdr) => {
            worksheet[hdr.col] = { t: 's', v: hdr.value };
        });
        return worksheet;
    }

    exportAsExcelFile(json: any[], excelFileName: string, options: any): void {
        let worksheet: xlsx.WorkSheet = xlsx.utils.json_to_sheet(json, options);
        worksheet = this.setHeader(worksheet);
        worksheet = this.cellFormat(worksheet);
        if (this.total > 0) {
            worksheet = this.setTotal(worksheet);
        }
        worksheet = this.autoFitColumn(json, worksheet);
        const workbook: xlsx.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    cellFormat(worksheet) {
        const st = this.startrow;
        const cn = this.columns.filter(x => x.cellFormat == 'numeric');
        let lr = worksheet['!ref'].slice(worksheet['!ref'].lastIndexOf(':') + 1).match(/\d+/)[0];
        lr = Number(lr);
        const rgs: any = [];
        /* new format */
        const fmt = '0.00';

        if (cn.length > 0) {
            for (let rw = 0; rw < cn.length; rw++) {
                const i = this.columns.indexOf(cn[rw]);
                rgs.push({
                    s: { r: st, c: i },
                    e: { r: lr, c: i }
                });
            }
        }
        /* change cell format of range */
        for (let rw = 0; rw < rgs.length; rw++) {
            const range = rgs[rw];
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell = worksheet[xlsx.utils.encode_cell({ r: R, c: C })];
                    if (!cell || cell.t !== 'n') { continue; } // only format numeric cells
                    cell.z = fmt;
                }
            }
        }
        return worksheet;
    }

    autoFitColumn(reports, worksheet) {
        const objectMaxLength = [];
        const wscols: any = [];
        for (let i = 0; i < reports.length; i++) {
            const value =  Object.values(reports[i]) as any;
            for (let j = 0; j < value.length; j++) {
                if (typeof value[j] == 'number') {
                    objectMaxLength[j] = 10;
                } else {
                    const valueLen = Utils.isArrayNullOrUndefinedOrEmpty(value[j]) ? 0 : value[j].length;
                    objectMaxLength[j] =
                        objectMaxLength[j] >= valueLen
                            ? objectMaxLength[j]
                            : value[j].length;
                }
            }
        }
        for (let i = 0; i < objectMaxLength.length; i++) {
            let obj = objectMaxLength[i];
            obj = obj <= 5 ? 5 : obj;
            wscols.push({ width: obj });
        }
        worksheet['!cols'] = wscols;
        return worksheet;
    }

    setTotal(worksheet) {
        const lrw = worksheet['!ref'].slice(worksheet['!ref'].lastIndexOf(':') + 1);
        const lr = Number(lrw.match(/\d+/)[0]) + 3;
        const llr = lrw.replace(/[0-9]/g, '');
        const cll = 'A' + lr;
        const ref = 'A1' + ':' + llr + lr;
        worksheet[cll] = { t: 's', v: 'Total' };
        worksheet['B' + lr] = { t: 'n', v: this.total };
        worksheet['!ref'] = ref;
        const cell = worksheet[xlsx.utils.encode_cell({ r: lr - 1, c: 1 })];
        cell.z = '0.00';

        return worksheet;
    }


    saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: this.EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + this.EXCEL_EXTENSION);
    }

    getCellValue(worksheet, col, row) {
        const cell = worksheet[xlsx.utils.encode_cell({ r: row, c: col })];
        return cell;
    }

    descriptionStatus(code) {
        const status = this.statusFilter.filter(x => x.id === code);
        if (status.length > 0) {
            return status[0].description;
        } else { return ''; }
    }


}
