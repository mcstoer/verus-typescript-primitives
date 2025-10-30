"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdinalVdxfObjectClassForType = exports.registerOrdinals = void 0;
const OrdinalVdxfObjectOrdinalMap_1 = require("../../vdxf/classes/OrdinalVdxfObjectOrdinalMap");
const vdxf_1 = require("../../vdxf");
const OrdinalVdxfObject_1 = require("../../vdxf/classes/OrdinalVdxfObject");
const ordinals_1 = require("./ordinals");
const IdentityUpdateRequestOrdinalVdxfObject_1 = require("../../vdxf/classes/identity/IdentityUpdateRequestOrdinalVdxfObject");
const registerOrdinals = () => {
    OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.registerOrdinal(ordinals_1.VDXF_ORDINAL_DATA_DESCRIPTOR.toNumber(), vdxf_1.DATA_TYPE_OBJECT_DATADESCRIPTOR.vdxfid, OrdinalVdxfObject_1.DataDescriptorOrdinalVdxfObject, false);
    OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.registerOrdinal(ordinals_1.VDXF_ORDINAL_VERUSPAY_INVOICE.toNumber(), vdxf_1.VERUSPAY_INVOICE_DETAILS_VDXF_KEY.vdxfid, OrdinalVdxfObject_1.VerusPayInvoiceOrdinalVdxfObject, false);
    OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.registerOrdinal(ordinals_1.VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST.toNumber(), vdxf_1.IDENTITY_UPDATE_REQUEST_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateRequestOrdinalVdxfObject_1.IdentityUpdateRequestOrdinalVdxfObject, false);
};
exports.registerOrdinals = registerOrdinals;
// OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE.toNumber(), IDENTITY_UPDATE_RESPONSE_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateResponseOrdinalVdxfObject);
const getOrdinalVdxfObjectClassForType = (type) => {
    if (OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.isRecognizedOrdinal(type.toNumber())) {
        const key = OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.getVdxfKeyForOrdinal(type.toNumber());
        if (OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.hasClassForVdxfKey(key)) {
            return OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.getClassForVdxfKey(OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.getVdxfKeyForOrdinal(type.toNumber()));
        }
        else {
            throw new Error("No class found for " + key);
        }
    }
    else if (type.eq(OrdinalVdxfObject_1.OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR) ||
        type.eq(OrdinalVdxfObject_1.OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_VDXF_ID_STRING) ||
        type.eq(OrdinalVdxfObject_1.OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_ID_OR_CURRENCY))
        return OrdinalVdxfObject_1.GeneralTypeOrdinalVdxfObject;
    else
        throw new Error("Unrecognized vdxf ordinal object type");
};
exports.getOrdinalVdxfObjectClassForType = getOrdinalVdxfObjectClassForType;
