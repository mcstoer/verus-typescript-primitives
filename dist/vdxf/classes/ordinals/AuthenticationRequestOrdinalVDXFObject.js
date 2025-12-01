"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationRequestOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const AuthenticationRequestDetails_1 = require("../login/AuthenticationRequestDetails");
class AuthenticationRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new AuthenticationRequestDetails_1.AuthenticationRequestDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_AUTHENTICATION_REQUEST,
            data: request.data
        }, AuthenticationRequestDetails_1.AuthenticationRequestDetails);
    }
    static fromJson(details) {
        return new AuthenticationRequestOrdinalVDXFObject({
            data: AuthenticationRequestDetails_1.AuthenticationRequestDetails.fromJson(details.data)
        });
    }
}
exports.AuthenticationRequestOrdinalVDXFObject = AuthenticationRequestOrdinalVDXFObject;
