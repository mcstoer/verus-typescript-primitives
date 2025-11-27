"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEncryptionResponseOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const AppEncryptionResponseDetails_1 = require("../response/AppEncryptionResponseDetails");
class AppEncryptionResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new AppEncryptionResponseDetails_1.AppEncryptionResponseDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_APP_ENCRYPTION_RESPONSE,
            data: request.data
        }, AppEncryptionResponseDetails_1.AppEncryptionResponseDetails);
    }
    static fromJson(details) {
        return new AppEncryptionResponseOrdinalVdxfObject({
            data: AppEncryptionResponseDetails_1.AppEncryptionResponseDetails.fromJson(details.data)
        });
    }
}
exports.AppEncryptionResponseOrdinalVdxfObject = AppEncryptionResponseOrdinalVdxfObject;
