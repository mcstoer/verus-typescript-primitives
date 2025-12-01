"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationResponseOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const AuthenticationResponseDetails_1 = require("../login/AuthenticationResponseDetails");
class AuthenticationResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(response = {
        data: new AuthenticationResponseDetails_1.AuthenticationResponseDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_AUTHENTICATION_RESPONSE,
            data: response.data
        }, AuthenticationResponseDetails_1.AuthenticationResponseDetails);
    }
    static fromJson(details) {
        return new AuthenticationResponseOrdinalVdxfObject({
            data: AuthenticationResponseDetails_1.AuthenticationResponseDetails.fromJson(details.data)
        });
    }
}
exports.AuthenticationResponseOrdinalVdxfObject = AuthenticationResponseOrdinalVdxfObject;
