"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataPacketResponseOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const DataPacketResponse_1 = require("../datapacket/DataPacketResponse");
class DataPacketResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new DataPacketResponse_1.DataPacketResponse()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_DATA_RESPONSE,
            data: request.data
        }, DataPacketResponse_1.DataPacketResponse);
    }
    static fromJson(details) {
        return new DataPacketResponseOrdinalVDXFObject({
            data: DataPacketResponse_1.DataPacketResponse.fromJson(details.data)
        });
    }
}
exports.DataPacketResponseOrdinalVDXFObject = DataPacketResponseOrdinalVDXFObject;
