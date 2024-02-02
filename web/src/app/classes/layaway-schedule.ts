import { Moment } from 'moment';
import { FileViewer } from './file-viewer';
import { PaymentMethod } from './payment-method';

export class LayAwaySchedule {
    id: number;
    orderId: number;
    productId: number;
    date: Date;
    monthly: number;
    isNonRefundDeposit: boolean;
    isCleared: boolean;
    isShipping: boolean;
    attachment: FileViewer;
    isSendEmail: boolean;
    isPrSend: boolean;
    paymentMethod: PaymentMethod;
    isinsurance: boolean;
    paymongoStatus: number;
    constructor() {
        this.attachment = new FileViewer();
        this.paymentMethod = new PaymentMethod();
    }
}



