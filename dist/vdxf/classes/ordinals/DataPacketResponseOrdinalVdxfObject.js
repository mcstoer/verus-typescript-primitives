"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataPacketResponseOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const DataPacketResponse_1 = require("../datapacket/DataPacketResponse");
class DataPacketResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new DataPacketResponse_1.DataPacketResponse()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_DATA_RESPONSE,
            data: request.data
        }, DataPacketResponse_1.DataPacketResponse);
    }
    static fromJson(details) {
        return new DataPacketResponseOrdinalVdxfObject({
            data: DataPacketResponse_1.DataPacketResponse.fromJson(details.data)
        });
    }
}
exports.DataPacketResponseOrdinalVdxfObject = DataPacketResponseOrdinalVdxfObject;
