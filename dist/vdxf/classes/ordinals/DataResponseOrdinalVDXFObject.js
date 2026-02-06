"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataResponseOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const DataResponseDetails_1 = require("../datapacket/DataResponseDetails");
class DataResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new DataResponseDetails_1.DataResponseDetails()
    }) {
        super({
            type: ordinals_1.DATA_RESPONSE_VDXF_ORDINAL,
            data: request.data
        }, DataResponseDetails_1.DataResponseDetails);
    }
    static fromJson(details) {
        return new DataResponseOrdinalVDXFObject({
            data: DataResponseDetails_1.DataResponseDetails.fromJson(details.data)
        });
    }
}
exports.DataResponseOrdinalVDXFObject = DataResponseOrdinalVDXFObject;
