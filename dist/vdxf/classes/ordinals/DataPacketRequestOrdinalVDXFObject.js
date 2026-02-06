"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataPacketRequestOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const DataPacketRequestDetails_1 = require("../data/DataPacketRequestDetails");
class DataPacketRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new DataPacketRequestDetails_1.DataPacketRequestDetails()
    }) {
        super({
            type: ordinals_1.DATA_PACKET_REQUEST_VDXF_ORDINAL,
            data: request.data
        }, DataPacketRequestDetails_1.DataPacketRequestDetails);
    }
    static fromJson(details) {
        return new DataPacketRequestOrdinalVDXFObject({
            data: DataPacketRequestDetails_1.DataPacketRequestDetails.fromJson(details.data)
        });
    }
}
exports.DataPacketRequestOrdinalVDXFObject = DataPacketRequestOrdinalVDXFObject;
