"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEncryptionResponseOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const AppEncryptionResponseDetails_1 = require("../appencryption/AppEncryptionResponseDetails");
class AppEncryptionResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new AppEncryptionResponseDetails_1.AppEncryptionResponseDetails()
    }) {
        super({
            type: ordinals_1.APP_ENCRYPTION_RESPONSE_VDXF_ORDINAL,
            data: request.data
        }, AppEncryptionResponseDetails_1.AppEncryptionResponseDetails);
    }
    static fromJson(details) {
        return new AppEncryptionResponseOrdinalVDXFObject({
            data: AppEncryptionResponseDetails_1.AppEncryptionResponseDetails.fromJson(details.data)
        });
    }
}
exports.AppEncryptionResponseOrdinalVDXFObject = AppEncryptionResponseOrdinalVDXFObject;
