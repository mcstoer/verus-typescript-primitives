"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationRequestOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const AuthenticationRequestDetails_1 = require("../login/AuthenticationRequestDetails");
class AuthenticationRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new AuthenticationRequestDetails_1.AuthenticationRequestDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_AUTHENTICATION_REQUEST,
            data: request.data
        }, AuthenticationRequestDetails_1.AuthenticationRequestDetails);
    }
    static fromJson(details) {
        return new AuthenticationRequestOrdinalVdxfObject({
            data: AuthenticationRequestDetails_1.AuthenticationRequestDetails.fromJson(details.data)
        });
    }
}
exports.AuthenticationRequestOrdinalVdxfObject = AuthenticationRequestOrdinalVdxfObject;
