"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataRequestOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const UserDataRequestDetails_1 = require("../requestobjects/UserDataRequestDetails");
class UserDataRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new UserDataRequestDetails_1.UserDataRequestDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_USER_DATA_REQUEST,
            data: request.data
        }, UserDataRequestDetails_1.UserDataRequestDetails);
    }
    static fromJson(details) {
        return new UserDataRequestOrdinalVDXFObject({
            data: UserDataRequestDetails_1.UserDataRequestDetails.fromJson(details.data)
        });
    }
}
exports.UserDataRequestOrdinalVDXFObject = UserDataRequestOrdinalVDXFObject;
