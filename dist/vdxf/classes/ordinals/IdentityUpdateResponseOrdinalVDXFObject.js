"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityUpdateResponseOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const IdentityUpdateResponseDetails_1 = require("../identity/IdentityUpdateResponseDetails");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
class IdentityUpdateResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(response = {
        data: new IdentityUpdateResponseDetails_1.IdentityUpdateResponseDetails()
    }) {
        super({
            type: ordinals_1.IDENTITY_UPDATE_RESPONSE_VDXF_ORDINAL,
            data: response.data
        }, IdentityUpdateResponseDetails_1.IdentityUpdateResponseDetails);
    }
    static fromJson(details) {
        return new IdentityUpdateResponseOrdinalVDXFObject({
            data: IdentityUpdateResponseDetails_1.IdentityUpdateResponseDetails.fromJson(details.data)
        });
    }
}
exports.IdentityUpdateResponseOrdinalVDXFObject = IdentityUpdateResponseOrdinalVDXFObject;
