import { Injectable } from '@angular/core';
import { DataService } from './data.service';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Utils } from '../app.utils';
import { PdfSettings } from '../classes/pdf-settings';
import { Order } from '../classes/order';
import { Cart } from '../classes/cart';
import { Report } from '../classes/report';
import * as moment from 'moment';
import { Column } from 'primeng/primeng';
import { FilterSetting } from '../classes/filter-settings';
import { ReportProducts } from '../classes/report-products';
@Injectable({
    providedIn: 'root'
})
export class PrintService {

    private readonly api: string;
    private pdfSettings: PdfSettings;
    statusFilter: any;
    currentDate: string;
    paymentStatusFilter: any;
    constructor() {
        this.pdfSettings = new PdfSettings();
        this.statusFilter = Utils.ORDER_STATUS;
        this.paymentStatusFilter = Utils.PAYMENT_STATUS;
        this.currentDate = moment(new Date()).format('MM/DD/YYYY');
    }

    printInvoice(order: Order) {
        const doc = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let x_axis = setup.tabX, y_axis = setup.tabY, x_scale = 70, y_scale = 70, strH = 0, strL = 0;
        const imageSources: any = {};
        const totalWidth = (setup.headerWidth - (setup.marginLeft * 2));
        const columnSize = {
            col1: setup.marginLeft + x_axis * 2,
            col2: setup.marginLeft + x_axis * 18,
            col3: setup.marginLeft + x_axis * 21
        };
        const completeAddress = order.shippingDetails.address.concat(' ')
            .concat(order.shippingDetails.barangay).concat(' ')
            .concat(order.shippingDetails.city).concat(' ')
            .concat(order.shippingDetails.province).concat(' ')
            .concat(order.shippingDetails.zipCode.toString()).concat(', ')
            .concat(order.shippingDetails.country);

        imageSources.header = location.origin + '/assets/img/byzmo_header.png';
        const columnHeader = () => {

            doc.text('Product', columnSize.col1, y_axis);
            doc.text('Qty', columnSize.col2, y_axis);
            doc.text('Total', columnSize.col3, y_axis);
            doc.line(setup.marginLeft + x_axis, y_axis + 5, setup.headerWidth + setup.tabX, y_axis + 5);
            y_axis += 20;

        };
        const footer = () => {
            y_axis += 40;
            doc.text('Shipping via', setup.marginLeft + x_axis, y_axis);
            doc.text(order.shippingDetails.shippingMethodDetails.shippingName, setup.marginLeft + x_axis * 7, y_axis);
            y_axis += setup.tabY;
            doc.text('Cost Breakdown', setup.marginLeft + x_axis, y_axis);
            // doc.text('100', setup.marginLeft + x_axis * 7, y_axis);
            y_axis += setup.tabY;
            doc.text('Subtotal', setup.marginLeft + x_axis, y_axis);
            doc.text(order.shippingDetails.subTotal.toLocaleString('en-US', {
                style: 'currency',
                currency: 'PHP',
            }), setup.marginLeft + x_axis * 7, y_axis);
            y_axis += setup.tabY;
            doc.text('Discount', setup.marginLeft + x_axis, y_axis);
            doc.text(order.discountAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'PHP',
            }), setup.marginLeft + x_axis * 7, y_axis);
            y_axis += setup.tabY;
            doc.text('Shipping', setup.marginLeft + x_axis, y_axis);
            doc.text(order.shippingAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'PHP',
            }), setup.marginLeft + x_axis * 7, y_axis);

            if (order.insuranceFee > 0) {
                y_axis += setup.tabY;
                doc.text('Shipping Insurance Fee', setup.marginLeft + x_axis, y_axis);
                doc.text(order.insuranceFee.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                }), setup.marginLeft + x_axis * 7, y_axis);
            }

            y_axis += setup.tabY;
            doc.text('Total', setup.marginLeft + x_axis, y_axis);
            doc.text(order.totalPrice.toLocaleString('en-US', {
                style: 'currency',
                currency: 'PHP',
            }), setup.marginLeft + x_axis * 7, y_axis);
            y_axis += setup.tabY;
        };


        Utils.loadImages(imageSources, (images) => {
            const textContainer = (totalWidth - (setup.marginLeft + x_axis));
            const wrapAddres = doc.splitTextToSize(completeAddress, textContainer);

            doc.setFontSize(10);
            doc.addImage(images.header, 'jpg', setup.marginLeft + x_axis, y_axis, x_scale, y_scale);
            y_axis += y_scale + setup.tabY;
            doc.text('Order No.', setup.marginLeft + x_axis, y_axis);
            doc.text(order.id.toString(), setup.marginLeft + x_axis * 7, y_axis);
            y_axis += setup.tabY;
            doc.text('Sales Invoice No.', setup.marginLeft + x_axis, y_axis);
            if (!Utils.isNullOrUndefined(order.invoiceNumber)) {
                doc.text(order.invoiceNumber.toString(), setup.marginLeft + x_axis * 7, y_axis);
            }
            y_axis += 30;
            doc.text('Deliver to:', setup.marginLeft + x_axis, y_axis);
            doc.text(order.shippingDetails.completeName, setup.marginLeft + x_axis * 7, y_axis);
            doc.text(wrapAddres, setup.marginLeft + x_axis * 7, y_axis + setup.tabY);
            y_axis += (wrapAddres.length * setup.tabY) + setup.tabY;


            doc.setFontSize(12);
            doc.text('Orders Items', setup.marginLeft + x_axis, y_axis);
            strH = y_axis + 5;
            strL = (setup.tabY * 2);
            y_axis += 20;
            columnHeader();
            doc.setFontSize(10);
            for (const cart of order.orderCart) {
                const productName = doc.splitTextToSize(cart.product.productName, (columnSize.col2 / 2) - x_axis);
                doc.text(productName, columnSize.col1, y_axis);
                doc.text(cart.quantity.toString(), columnSize.col2, y_axis);
                doc.text(cart.totalAmount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'PHP',
                }), columnSize.col3, y_axis);
                y_axis += productName.length * 15;
                strL += productName.length * 15; // compute width border by split text
            }

            doc.rect(setup.marginLeft + x_axis, strH, (setup.headerWidth - setup.marginLeft), strL);
            footer();
            doc.save(`invoce-order#${order.id}.pdf`);
        });
    }


    printOrderStatusReport(reports: Array<Report>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const totalOrder = reports.reduce(function(a, b) {
            return a + b.total;
        }, 0);
        const columns = [
            {
                name: 'Order Date',
                width: 70
            }, {
                name: 'Order No.',
                width: 40
            }, {
                name: 'Customer Name',
                width: 60
            }, {
                name: 'Email',
                width: 70
            }, {
                name: 'Items in Order',
                width: 120
            }, {
                name: 'Email Status',
                width: 45
            }, {
                name: 'Order Amount',
                width: 45
            }, {
                name: 'Order Status',
                width: 50
            }, {
                name: 'Payment Status',
                width: 60
            }
        ];

        const reportTitle = () => {
            doc.setFontSize(12);
            let desc = 'ALL';
            const dateFilter = moment(filter.startDate).format('MM/DD/YYYY') + ' to ' + moment(filter.endDate).format('MM/DD/YYYY');
            if (filter.statusId > 0) {
                desc = this.descriptionStatus(filter.statusId);
            }

            doc.text('Order Status Report', setup.offsetCenter - 40, y_axis);
            y_axis += 20;
            doc.text(desc, setup.offsetCenter - (desc == 'ALL' ? 0 : 20), y_axis);
            y_axis += 20;
            doc.text(dateFilter, setup.offsetCenter - 50, y_axis);
            y_axis += 20;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {
                const produts = report.products.map(x => x.productName).join('//');
                const orderDate = moment(report.orderDate).format('MM/DD/YYYY');
                const sentStatus = report.isSendEmail ? 'Sent' : 'Not Yet';
                const orderStatus = this.descriptionStatus(report.statusId);
                items = [];

                items.push(orderDate);
                items.push(report.orderId);
                items.push(report.completeName);
                items.push(report.email);
                items.push(produts);
                items.push(sentStatus);
                items.push(this.numberWithCommas(report.total));
                items.push(orderStatus);
                items.push(report.paymentStatus);
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            },
            didParseCell: (data) => {
                if (columns[data.column.index].name === 'Items in Order' && columns.filter(x => x.name == data.cell.text).length == 0) {
                    const item = data.cell.text.join().split('//');
                    data.cell.text = item;
                }

            }
        });

        const finalY = doc.autoTable.previous.finalY;
        doc.text(setup.marginLeft, finalY + 20, 'Total:');
        doc.setFontSize(10);
        doc.text(setup.marginLeft + 40, finalY + 20, Utils.numberWithCommasAndCurrency(totalOrder, 'P'));

        doc.save(`Order Status Report#${this.currentDate}.pdf`);
    }



    printSalesReport(reports: Array<Report>, filter: FilterSetting, paymentMethod: string) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const totalOrder = reports.reduce(function(a, b) {
            return a + b.total;
        }, 0);
        const columns = [
            {
                name: 'Order Date'
            }, {
                name: 'Order No.'
            }, {
                name: 'Customer Name'
            }, {
                name: 'Email'
            }, {
                name: 'Items in Order'
            }, {
                name: 'Order Amount'
            }, {
                name: 'Balance'
            }, {
                name: 'Order Status'
            }
        ];

        const reportTitle = () => {
            doc.setFontSize(12);
            let desc = 'ALL';
            let paymentDesc = 'ALL';
            paymentMethod = paymentMethod.toUpperCase();
            const dateFilter = moment(filter.startDate).format('MM/DD/YYYY') + ' to ' + moment(filter.endDate).format('MM/DD/YYYY');
            if (filter.statusId > 0) {
                desc = this.descriptionStatus(filter.statusId);
            }
            if (filter.paymentStatusId > 0) {
                paymentDesc = this.paymentDescription(filter.paymentStatusId);
            }


            doc.text('Sales Report', setup.offsetCenter - 25, y_axis);
            y_axis += 20;
            doc.text(desc, setup.offsetCenter - (desc == 'ALL' ? 0 : 20), y_axis);
            y_axis += 20;
            doc.text(paymentDesc, setup.offsetCenter - (paymentDesc == 'ALL' ? 0 : 10), y_axis);
            y_axis += 20;
            doc.text(paymentMethod, setup.offsetCenter - (paymentMethod == 'ALL' ? 0 : (paymentMethod.length > 7 ? 30 : 10)), y_axis);
            y_axis += 20;
            doc.text(dateFilter, setup.offsetCenter - 50, y_axis);
            y_axis += 20;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {
                const produts = report.products.map(x => x.productName).join('//');
                const orderDate = moment(report.orderDate).format('MM/DD/YYYY');
                const orderStatus = this.descriptionStatus(report.statusId);
                items = [];

                items.push(orderDate);
                items.push(report.orderId);
                items.push(report.completeName);
                items.push(report.email);
                items.push(produts);
                items.push(this.numberWithCommas(report.total));
                items.push(this.numberWithCommas(report.balance));
                items.push(orderStatus);
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: {
                europe: { halign: 'center' }
            },
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });

        const finalY = doc.autoTable.previous.finalY;
        doc.text(setup.marginLeft, finalY + 20, 'Total:');
        doc.setFontSize(10);
        doc.text(setup.marginLeft + 40, finalY + 20, Utils.numberWithCommasAndCurrency(totalOrder, 'P'));

        doc.save(`Sales Report#${this.currentDate}.pdf`);
    }


    printShippingReport(reports: Array<Report>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const totalOrder = reports.reduce(function(a, b) {
            return a + b.total;
        }, 0);
        const columns = [
            {
                name: 'Order Date',
                width: 60
            }, {
                name: 'Order No.',
                width: 40
            }, {
                name: 'Shipping Date',
                width: 60
            }, {
                name: 'Customer Name',
                width: 50
            }, {
                name: 'Email',
                width: 60
            }, {
                name: 'Tracking No.',
                width: 50
            }, {
                name: 'Invoice No.',
                width: 50
            }, {
                name: 'Order Amount',
                width: 50
            }, {
                name: 'Balance Amount',
                width: 50
            }, {
                name: 'Order Status',
                width: 70
            }
        ];

        const reportTitle = () => {
            doc.setFontSize(12);
            const dateFilter = moment(filter.startDate).format('MM/DD/YYYY') + ' to ' + moment(filter.endDate).format('MM/DD/YYYY');
            doc.text('Shipping Order Report', setup.offsetCenter - 50, y_axis);

            y_axis += 20;
            doc.text(dateFilter, setup.offsetCenter - 50, y_axis);
            y_axis += 20;
        };
        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {
                const orderDate = moment(report.orderDate).format('MM/DD/YYYY');
                const shippingDate = moment(report.shippingDate).format('MM/DD/YYYY');
                const orderStatus = this.descriptionStatus(report.statusId);
                items = [];

                items.push(orderDate);
                items.push(report.orderId);
                items.push(shippingDate);
                items.push(report.completeName);
                items.push(report.email);
                items.push(report.trackingNumber);
                items.push(report.invoiceNumber);
                items.push(this.numberWithCommas(report.total));
                items.push(this.numberWithCommas(report.balance));
                items.push(orderStatus);
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });

        const finalY = doc.autoTable.previous.finalY;
        doc.text(setup.marginLeft, finalY + 20, 'Total:');
        doc.setFontSize(10);
        doc.text(setup.marginLeft + 40, finalY + 20, Utils.numberWithCommasAndCurrency(totalOrder, 'P'));

        doc.save(`Shipping Order Report#${this.currentDate}.pdf`);
    }


    printOrdersWithDiscountReport(reports: Array<Report>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const totalOrder = reports.reduce(function(a, b) {
            return a + b.total;
        }, 0);
        const columns = [
            {
                name: 'Order Date',
                width: 60
            }, {
                name: 'Order No.',
                width: 60
            }, {
                name: 'Customer Name',
                width: 80
            }, {
                name: 'Email',
                width: 80
            }, {
                name: 'Order Amount',
                width: 60
            }, {
                name: 'Discount Code',
                width: 60
            }, {
                name: 'Discount Amount',
                width: 60
            }, {
                name: 'Order Status',
                width: 60
            }
        ];

        const reportTitle = () => {
            doc.setFontSize(12);
            const dateFilter = moment(filter.startDate).format('MM/DD/YYYY') + ' to ' + moment(filter.endDate).format('MM/DD/YYYY');
            doc.text('Order with Discount Report', setup.offsetCenter - 50, y_axis);
            y_axis += 20;
            doc.text(dateFilter, setup.offsetCenter - 50, y_axis);
            y_axis += 20;
        };
        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {
                const orderDate = moment(report.orderDate).format('MM/DD/YYYY');
                const orderStatus = this.descriptionStatus(report.statusId);
                items = [];

                items.push(orderDate);
                items.push(report.orderId);
                items.push(report.completeName);
                items.push(report.email);
                items.push(this.numberWithCommas(report.total));
                items.push(report.discountCode);
                items.push(this.numberWithCommas(report.discountAmount));
                items.push(orderStatus);
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });
        const finalY = doc.autoTable.previous.finalY;
        doc.text(setup.marginLeft, finalY + 20, 'Total:');
        doc.setFontSize(10);
        doc.text(setup.marginLeft + 40, finalY + 20, Utils.numberWithCommasAndCurrency(totalOrder, 'P'));
        doc.save(`Order with Discount Report#${this.currentDate}.pdf`);
    }


    printOrdersWithLayawayReport(reports: Array<Report>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const totalOrder = reports.reduce(function(a, b) {
            return a + b.total;
        }, 0);
        const columns = [
            {
                name: 'Order Date',
                width: 60
            }, {
                name: 'Order No.',
                width: 60
            }, {
                name: 'Customer Name',
                width: 90
            }, {
                name: 'Email',
                width: 70
            }, {
                name: 'Order Amount',
                width: 60
            }, {
                name: 'Balance Amount',
                width: 60
            }, {
                name: 'Order Status',
                width: 60
            }, {
                name: 'Due Date',
                width: 60
            }
        ];

        const reportTitle = () => {
            doc.setFontSize(12);
            const dateFilter = moment(filter.startDate).format('MM/DD/YYYY') + ' to ' + moment(filter.endDate).format('MM/DD/YYYY');
            doc.text('Orders with Layaway Payment', setup.offsetCenter - 60, y_axis);
            y_axis += 20;
            doc.text(dateFilter, setup.offsetCenter - 50, y_axis);
            y_axis += 20;
        };
        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {
                const orderDate = moment(report.orderDate).format('MM/DD/YYYY');
                const dueDate = moment(report.dueDate).format('MM/DD/YYYY');
                const orderStatus = this.descriptionStatus(report.statusId);
                items = [];

                items.push(orderDate);
                items.push(report.orderId);
                items.push(report.completeName);
                items.push(report.email);
                items.push(this.numberWithCommas(report.total));
                items.push(this.numberWithCommas(report.balance));
                items.push(orderStatus);
                items.push(dueDate);
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });

        const finalY = doc.autoTable.previous.finalY;
        doc.text(setup.marginLeft, finalY + 20, 'Total:');
        doc.setFontSize(10);
        doc.text(setup.marginLeft + 40, finalY + 20, Utils.numberWithCommasAndCurrency(totalOrder, 'P'));

        doc.save(`Orders with Layaway Payment#${this.currentDate}.pdf`);
    }



    printOrdersWithPreOrderReport(reports: Array<Report>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const totalOrder = reports.reduce(function(a, b) {
            return a + b.total;
        }, 0);
        const columns = [
            {
                name: 'Order Date',
                width: 60
            }, {
                name: 'Order No.',
                width: 60
            }, {
                name: 'Customer Name',
                width: 80
            }, {
                name: 'Email',
                width: 100
            }, {
                name: 'Order Amount',
                width: 50
            }, {
                name: 'Balance Amount',
                width: 50
            }, {
                name: 'Rush Fee',
                width: 50
            }, {
                name: 'Order Status',
                width: 50
            }
        ];

        const reportTitle = () => {

            doc.setFontSize(12);
            let desc = 'ALL';
            const dateFilter = moment(filter.startDate).format('MM/DD/YYYY') + ' to ' + moment(filter.endDate).format('MM/DD/YYYY');
            if (filter.statusId > 0) {
                desc = this.descriptionStatus(filter.statusId);
            }

            doc.text('Orders with Pre Order', setup.offsetCenter - 50, y_axis);
            y_axis += 20;
            doc.text(desc, setup.offsetCenter - (desc == 'ALL' ? 0 : 20), y_axis);
            y_axis += 20;
            doc.text(dateFilter, setup.offsetCenter - 50, y_axis);
            y_axis += 20;
        };
        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {
                const orderDate = moment(report.orderDate).format('MM/DD/YYYY');
                const orderStatus = this.descriptionStatus(report.statusId);
                items = [];

                items.push(orderDate);
                items.push(report.orderId);
                items.push(report.completeName);
                items.push(report.email);
                items.push(this.numberWithCommas(report.total));
                items.push(this.numberWithCommas(report.balance));
                items.push(report.hasRushFee);
                items.push(orderStatus);
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });

        const finalY = doc.autoTable.previous.finalY;
        doc.text(setup.marginLeft, finalY + 20, 'Total:');
        doc.setFontSize(10);
        doc.text(setup.marginLeft + 40, finalY + 20, Utils.numberWithCommasAndCurrency(totalOrder, 'P'));

        doc.save(`Orders with Pre Order#${this.currentDate}.pdf`);
    }


    printProductPriceListReport(reports: Array<ReportProducts>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const columns = [
            {
                name: 'Product Name',
                width: 150
            }, {
                name: 'Item Number',
                width: 80
            }, {
                name: 'Selling Price',
                width: 50
            }, {
                name: 'Cost Price',
                width: 50
            }, {
                name: 'Sale Price',
                width: 50
            }, {
                name: 'Pre Order DP',
                width: 50
            }, {
                name: 'Rush Fee',
                width: 50
            }, {
                name: 'Stock Balance',
                width: 50
            }

        ];

        const reportTitle = () => {

            doc.setFontSize(12);
            let desc = 'ALL';
            if (filter.statusId > 0) {
                desc = this.descriptionStatus(filter.statusId);
            }

            doc.text('Product Price List', setup.offsetCenter - 50, y_axis);
            y_axis += 20;
            doc.text(desc, setup.offsetCenter - (desc == 'ALL' ? 0 : 20), y_axis);
            y_axis += 20;
        };
        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {

                items = [];

                items.push(report.productName);
                items.push(report.itemNumber);
                items.push(this.numberWithCommas(report.price));
                items.push(this.numberWithCommas(report.costPrice));
                items.push(this.numberWithCommas(report.salePrice));
                items.push(this.numberWithCommas(report.preOrderDepositAmount));
                items.push(this.numberWithCommas(report.rushFee));
                items.push(this.numberWithCommas(report.remainingQuantity));
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });

        doc.save(`Product Price List#${this.currentDate}.pdf`);
    }


    printStockProductReport(reports: Array<ReportProducts>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const columns = [
            {
                name: 'Product Name',
                width: 200
            }, {
                name: 'Notification',
                width: 100
            }, {
                name: 'Item Number',
                width: 120
            }, {
                name: 'Balance',
                width: 100
            },

        ];

        const reportTitle = () => {

            doc.setFontSize(12);
            let desc = 'ALL';
            if (filter.statusId > 0) {
                desc = this.descriptionStatus(filter.statusId);
            }

            doc.text('Stock Products Report', setup.offsetCenter - 50, y_axis);
            y_axis += 20;
            doc.text(desc, setup.offsetCenter - (desc == 'ALL' ? 0 : 20), y_axis);
            y_axis += 20;
        };
        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {

                items = [];

                items.push(report.productName);
                items.push(report.notif);
                items.push(report.itemNumber);
                items.push(report.remainingQuantity);
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });

        doc.save(`Stock Products Report#${this.currentDate}.pdf`);
    }


    printProductSaleReport(reports: Array<ReportProducts>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const columns = [
            {
                name: 'Product Name',
                width: 150
            }, {
                name: 'Item Number',
                width: 80
            }, {
                name: 'No. Of Sale',
                width: 40
            }, {
                name: 'Selling Price',
                width: 60
            }, {
                name: 'Cost Price',
                width: 60
            }, {
                name: 'Sale Price',
                width: 60
            }, {
                name: 'Pre Order DP',
                width: 60
            }

        ];

        const reportTitle = () => {

            doc.setFontSize(12);
            let desc = 'ALL';
            if (filter.statusId > 0) {
                desc = this.descriptionStatus(filter.statusId);
            }

            doc.text('Product With Highest to Lowest Sale', setup.offsetCenter - 60, y_axis);
            y_axis += 20;
            doc.text(desc, setup.offsetCenter - (desc == 'ALL' ? 0 : 20), y_axis);
            y_axis += 20;
        };
        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {

                items = [];

                items.push(report.productName);
                items.push(report.itemNumber);
                items.push(report.noOfSale);
                items.push(this.numberWithCommas(report.price));
                items.push(this.numberWithCommas(report.costPrice));
                items.push(this.numberWithCommas(report.salePrice));
                items.push(this.numberWithCommas(report.preOrderDepositAmount));
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });

        doc.save(`Product With Highest to Lowest Sale#${this.currentDate}.pdf`);
    }

    printProductTagReport(reports: Array<ReportProducts>, filter: FilterSetting) {
        const doc: any = new jsPDF('p', 'pt', 'a4');
        const setup = this.pdfSettings.pdfSetup;
        let y_axis = setup.tabY + 40;
        const columns = [
            {
                name: 'Product Name',
                width: 200
            }, {
                name: 'Item Number',
                width: 80
            }, {
                name: 'Selling Price',
                width: 60
            }, {
                name: 'Tags',
                width: 60
            }, {
                name: 'Sale Price',
                width: 60
            }, {
                name: 'Pre Order DP',
                width: 60
            }

        ];

        const reportTitle = () => {

            doc.setFontSize(12);
            let desc = 'ALL';
            if (filter.statusId > 0) {
                desc = this.descriptionStatus(filter.statusId);
            }

            doc.text('Product Tags Report', setup.offsetCenter - 60, y_axis);
            y_axis += 20;
            doc.text(desc, setup.offsetCenter - (desc == 'ALL' ? 0 : 20), y_axis);
            y_axis += 20;
        };
        const columnWidth = () => {
            const colStyle = {
                europe: { halign: 'center' }
            };
            // col width
            for (let i = 0; i < columns.length; i++) {
                colStyle[i] = { cellWidth: columns[i].width };
            }

            return colStyle;
        };

        const header = () => {
            return [columns.map(x => x.name)];
        };

        const body = () => {
            let res = [], items = [];
            for (const report of reports) {

                items = [];

                items.push(report.productName);
                items.push(report.itemNumber);
                items.push(this.numberWithCommas(report.price));
                items.push(this.numberWithCommas(report.tags));
                items.push(this.numberWithCommas(report.salePrice));
                items.push(this.numberWithCommas(report.preOrderDepositAmount));
                res.push(items);
            }
            return res;
        };

        reportTitle();
        doc.autoTable({
            head: header(),
            body: body(),
            startY: y_axis,
            columnStyles: columnWidth(),
            headStyles: {
                fillColor: '#fff',
                textColor: '#212529'
            }
        });

        doc.save(`Product Tags Report#${this.currentDate}.pdf`);
    }

    descriptionStatus(code) {
        const status = this.statusFilter.filter(x => x.id == code);
        if (status.length > 0) {
            return status[0].description;
        } else { return ''; }
    }
    paymentDescription(code) {
        const status = this.paymentStatusFilter.filter(x => x.id == code);
        if (status.length > 0) {
            return status[0].description;
        } else { return ''; }
    }
    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }


}
