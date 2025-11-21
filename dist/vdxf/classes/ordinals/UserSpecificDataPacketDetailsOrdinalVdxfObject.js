"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSpecificDataPacketDetailsOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const UserSpecificDataPacketDetails_1 = require("../requestobjects/UserSpecificDataPacketDetails");
class UserSpecificDataPacketDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new UserSpecificDataPacketDetails_1.UserSpecificDataPacketDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET,
            data: request.data
        }, UserSpecificDataPacketDetails_1.UserSpecificDataPacketDetails);
    }
    static fromJson(details) {
        return new UserSpecificDataPacketDetailsOrdinalVdxfObject({
            data: UserSpecificDataPacketDetails_1.UserSpecificDataPacketDetails.fromJson(details.data)
        });
    }
}
exports.UserSpecificDataPacketDetailsOrdinalVdxfObject = UserSpecificDataPacketDetailsOrdinalVdxfObject;
