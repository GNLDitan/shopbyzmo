export class FileViewer {
    file: File = null;
    fileName: string = null;
    fileUrl: string = null;
    key: number;
    //for layaway
    isForLayaway: boolean = false;
    isForPreOrder: boolean = false;
    layawayId: number;
    preOrderId: number;
    orderId: number;

    constructor() {
        this.fileName = '';
    }
}
