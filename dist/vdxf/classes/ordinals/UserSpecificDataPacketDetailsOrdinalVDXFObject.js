"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSpecificDataPacketDetailsOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const UserSpecificDataPacketDetails_1 = require("../requestobjects/UserSpecificDataPacketDetails");
class UserSpecificDataPacketDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new UserSpecificDataPacketDetails_1.UserSpecificDataPacketDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET,
            data: request.data
        }, UserSpecificDataPacketDetails_1.UserSpecificDataPacketDetails);
    }
    static fromJson(details) {
        return new UserSpecificDataPacketDetailsOrdinalVDXFObject({
            data: UserSpecificDataPacketDetails_1.UserSpecificDataPacketDetails.fromJson(details.data)
        });
    }
}
exports.UserSpecificDataPacketDetailsOrdinalVDXFObject = UserSpecificDataPacketDetailsOrdinalVDXFObject;
