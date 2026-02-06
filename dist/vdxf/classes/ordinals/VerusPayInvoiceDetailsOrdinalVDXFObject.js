"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerusPayInvoiceDetailsOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const VerusPayInvoiceDetails_1 = require("../payment/VerusPayInvoiceDetails");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
class VerusPayInvoiceDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new VerusPayInvoiceDetails_1.VerusPayInvoiceDetails()
    }) {
        super({
            type: ordinals_1.VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL,
            data: request.data
        }, VerusPayInvoiceDetails_1.VerusPayInvoiceDetails);
    }
    static fromJson(details) {
        return new VerusPayInvoiceDetailsOrdinalVDXFObject({
            data: VerusPayInvoiceDetails_1.VerusPayInvoiceDetails.fromJson(details.data)
        });
    }
}
exports.VerusPayInvoiceDetailsOrdinalVDXFObject = VerusPayInvoiceDetailsOrdinalVDXFObject;
