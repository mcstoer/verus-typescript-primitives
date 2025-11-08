"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerusPayInvoiceOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const VerusPayInvoiceDetails_1 = require("../payment/VerusPayInvoiceDetails");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
class VerusPayInvoiceOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new VerusPayInvoiceDetails_1.VerusPayInvoiceDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_VERUSPAY_INVOICE,
            data: request.data
        }, VerusPayInvoiceDetails_1.VerusPayInvoiceDetails);
    }
    static fromJson(details) {
        return new VerusPayInvoiceOrdinalVdxfObject({
            data: VerusPayInvoiceDetails_1.VerusPayInvoiceDetails.fromJson(details.data)
        });
    }
}
exports.VerusPayInvoiceOrdinalVdxfObject = VerusPayInvoiceOrdinalVdxfObject;
