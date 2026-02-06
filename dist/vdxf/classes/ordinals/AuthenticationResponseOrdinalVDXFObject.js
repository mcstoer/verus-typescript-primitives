"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationResponseOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const AuthenticationResponseDetails_1 = require("../login/AuthenticationResponseDetails");
class AuthenticationResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(response = {
        data: new AuthenticationResponseDetails_1.AuthenticationResponseDetails()
    }) {
        super({
            type: ordinals_1.AUTHENTICATION_RESPONSE_VDXF_ORDINAL,
            data: response.data
        }, AuthenticationResponseDetails_1.AuthenticationResponseDetails);
    }
    static fromJson(details) {
        return new AuthenticationResponseOrdinalVDXFObject({
            data: AuthenticationResponseDetails_1.AuthenticationResponseDetails.fromJson(details.data)
        });
    }
}
exports.AuthenticationResponseOrdinalVDXFObject = AuthenticationResponseOrdinalVDXFObject;
