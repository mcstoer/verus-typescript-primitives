"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataDescriptorOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const pbaas_1 = require("../../../pbaas");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
class DataDescriptorOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new pbaas_1.DataDescriptor()
    }) {
        super({
            type: ordinals_1.DATA_DESCRIPTOR_VDXF_ORDINAL,
            data: request.data
        }, pbaas_1.DataDescriptor);
    }
    static fromJson(details) {
        return new DataDescriptorOrdinalVDXFObject({
            data: pbaas_1.DataDescriptor.fromJson(details.data)
        });
    }
}
exports.DataDescriptorOrdinalVDXFObject = DataDescriptorOrdinalVDXFObject;
