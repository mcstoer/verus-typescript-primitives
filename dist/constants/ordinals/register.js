"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrdinals = void 0;
const vdxf_1 = require("../../vdxf");
const DataDescriptorOrdinalVdxfObject_1 = require("../../vdxf/classes/ordinals/DataDescriptorOrdinalVdxfObject");
const IdentityUpdateRequestOrdinalVdxfObject_1 = require("../../vdxf/classes/ordinals/IdentityUpdateRequestOrdinalVdxfObject");
const IdentityUpdateResponseOrdinalVdxfObject_1 = require("../../vdxf/classes/ordinals/IdentityUpdateResponseOrdinalVdxfObject");
const OrdinalVdxfObjectOrdinalMap_1 = require("../../vdxf/classes/ordinals/OrdinalVdxfObjectOrdinalMap");
const VerusPayInvoiceOrdinalVdxfObject_1 = require("../../vdxf/classes/ordinals/VerusPayInvoiceOrdinalVdxfObject");
const ordinals_1 = require("./ordinals");
const registerOrdinals = () => {
    OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.registerOrdinal(ordinals_1.VDXF_ORDINAL_DATA_DESCRIPTOR.toNumber(), vdxf_1.DATA_TYPE_OBJECT_DATADESCRIPTOR.vdxfid, DataDescriptorOrdinalVdxfObject_1.DataDescriptorOrdinalVdxfObject, false);
    OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.registerOrdinal(ordinals_1.VDXF_ORDINAL_VERUSPAY_INVOICE.toNumber(), vdxf_1.VERUSPAY_INVOICE_DETAILS_VDXF_KEY.vdxfid, VerusPayInvoiceOrdinalVdxfObject_1.VerusPayInvoiceOrdinalVdxfObject, false);
    OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.registerOrdinal(ordinals_1.VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST.toNumber(), vdxf_1.IDENTITY_UPDATE_REQUEST_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateRequestOrdinalVdxfObject_1.IdentityUpdateRequestOrdinalVdxfObject, false);
    OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.registerOrdinal(ordinals_1.VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE.toNumber(), vdxf_1.IDENTITY_UPDATE_RESPONSE_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateResponseOrdinalVdxfObject_1.IdentityUpdateResponseOrdinalVdxfObject, false);
};
exports.registerOrdinals = registerOrdinals;
