"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataDescriptorOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const pbaas_1 = require("../../../pbaas");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
class DataDescriptorOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new pbaas_1.DataDescriptor()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_DATA_DESCRIPTOR,
            data: request.data
        }, pbaas_1.DataDescriptor);
    }
    static fromJson(details) {
        return new DataDescriptorOrdinalVdxfObject({
            data: pbaas_1.DataDescriptor.fromJson(details.data)
        });
    }
}
exports.DataDescriptorOrdinalVdxfObject = DataDescriptorOrdinalVdxfObject;
