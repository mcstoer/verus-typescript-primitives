"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityUpdateRequestOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const OrdinalVdxfObject_1 = require("../OrdinalVdxfObject");
const IdentityUpdateRequestDetails_1 = require("./IdentityUpdateRequestDetails");
class IdentityUpdateRequestOrdinalVdxfObject extends OrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new IdentityUpdateRequestDetails_1.IdentityUpdateRequestDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST,
            data: request.data
        }, IdentityUpdateRequestDetails_1.IdentityUpdateRequestDetails);
    }
    static fromJson(details) {
        return new IdentityUpdateRequestOrdinalVdxfObject({
            data: IdentityUpdateRequestDetails_1.IdentityUpdateRequestDetails.fromJson(details.data)
        });
    }
}
exports.IdentityUpdateRequestOrdinalVdxfObject = IdentityUpdateRequestOrdinalVdxfObject;
