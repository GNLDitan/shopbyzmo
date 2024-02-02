import { Utils } from '../app.utils';
import { FileViewer } from './file-viewer';
import { PaymentMethod } from './payment-method';

export class PreOrderSchedule {
    id: number;
    orderId: number;
    productId: number;
    paymentTerm: string;
    amount: number;
    isCleared: boolean;
    attachment: FileViewer;
    isSendEmail: boolean;
    isPrSend: boolean;
    paymentMethod: PaymentMethod;
    dpWithRushFee: number;
    paymongoStatus: number;

    constructor() {
        this.attachment = new FileViewer();
    }
    get paymentTermDesc() {
        let desc = '';
        if (!Utils.isNullOrUndefined(this.paymentTerm)) {
            desc = Utils.PREORDER_TERM.filter(x => x.code === this.paymentTerm)[0].description;
        }
        return desc;
    }
    set paymentTermDesc(a) { }
}
