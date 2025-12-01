"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerusPayInvoiceOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const VerusPayInvoiceDetails_1 = require("../payment/VerusPayInvoiceDetails");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
class VerusPayInvoiceOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new VerusPayInvoiceDetails_1.VerusPayInvoiceDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_VERUSPAY_INVOICE,
            data: request.data
        }, VerusPayInvoiceDetails_1.VerusPayInvoiceDetails);
    }
    static fromJson(details) {
        return new VerusPayInvoiceOrdinalVDXFObject({
            data: VerusPayInvoiceDetails_1.VerusPayInvoiceDetails.fromJson(details.data)
        });
    }
}
exports.VerusPayInvoiceOrdinalVDXFObject = VerusPayInvoiceOrdinalVDXFObject;
