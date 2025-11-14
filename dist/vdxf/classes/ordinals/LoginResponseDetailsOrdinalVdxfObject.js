"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponseOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const LoginResponseDetails_1 = require("../login/LoginResponseDetails");
class LoginResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(response = {
        data: new LoginResponseDetails_1.LoginResponseDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_LOGIN_RESPONSE,
            data: response.data
        }, LoginResponseDetails_1.LoginResponseDetails);
    }
    static fromJson(details) {
        return new LoginResponseOrdinalVdxfObject({
            data: LoginResponseDetails_1.LoginResponseDetails.fromJson(details.data)
        });
    }
}
exports.LoginResponseOrdinalVdxfObject = LoginResponseOrdinalVdxfObject;
