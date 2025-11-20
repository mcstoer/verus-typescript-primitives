"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEncryptionRequestDetailsOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const AppEncryptionRequestDetails_1 = require("../requestobjects/AppEncryptionRequestDetails");
class AppEncryptionRequestDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new AppEncryptionRequestDetails_1.AppEncryptionRequestDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_APP_ENCRYPTION_REQUEST,
            data: request.data
        }, AppEncryptionRequestDetails_1.AppEncryptionRequestDetails);
    }
    static fromJson(details) {
        return new AppEncryptionRequestDetailsOrdinalVdxfObject({
            data: AppEncryptionRequestDetails_1.AppEncryptionRequestDetails.fromJson(details.data)
        });
    }
}
exports.AppEncryptionRequestDetailsOrdinalVdxfObject = AppEncryptionRequestDetailsOrdinalVdxfObject;
