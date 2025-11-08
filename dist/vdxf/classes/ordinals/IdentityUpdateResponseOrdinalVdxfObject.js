"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityUpdateResponseOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const IdentityUpdateResponseDetails_1 = require("../identity/IdentityUpdateResponseDetails");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
class IdentityUpdateResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(response = {
        data: new IdentityUpdateResponseDetails_1.IdentityUpdateResponseDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE,
            data: response.data
        }, IdentityUpdateResponseDetails_1.IdentityUpdateResponseDetails);
    }
    static fromJson(details) {
        return new IdentityUpdateResponseOrdinalVdxfObject({
            data: IdentityUpdateResponseDetails_1.IdentityUpdateResponseDetails.fromJson(details.data)
        });
    }
}
exports.IdentityUpdateResponseOrdinalVdxfObject = IdentityUpdateResponseOrdinalVdxfObject;
