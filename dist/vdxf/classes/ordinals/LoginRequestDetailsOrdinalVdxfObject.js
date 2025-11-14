"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRequestOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const LoginRequestDetails_1 = require("../login/LoginRequestDetails");
class LoginRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new LoginRequestDetails_1.LoginRequestDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_LOGIN_REQUEST,
            data: request.data
        }, LoginRequestDetails_1.LoginRequestDetails);
    }
    static fromJson(details) {
        return new LoginRequestOrdinalVdxfObject({
            data: LoginRequestDetails_1.LoginRequestDetails.fromJson(details.data)
        });
    }
}
exports.LoginRequestOrdinalVdxfObject = LoginRequestOrdinalVdxfObject;
