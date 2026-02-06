"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEncryptionRequestOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const AppEncryptionRequestDetails_1 = require("../appencryption/AppEncryptionRequestDetails");
class AppEncryptionRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new AppEncryptionRequestDetails_1.AppEncryptionRequestDetails()
    }) {
        super({
            type: ordinals_1.APP_ENCRYPTION_REQUEST_VDXF_ORDINAL,
            data: request.data
        }, AppEncryptionRequestDetails_1.AppEncryptionRequestDetails);
    }
    static fromJson(details) {
        return new AppEncryptionRequestOrdinalVDXFObject({
            data: AppEncryptionRequestDetails_1.AppEncryptionRequestDetails.fromJson(details.data)
        });
    }
}
exports.AppEncryptionRequestOrdinalVDXFObject = AppEncryptionRequestOrdinalVDXFObject;
