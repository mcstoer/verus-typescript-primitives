"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvisionIdentityDetailsOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const ProvisionIdentityDetails_1 = require("../requestobjects/ProvisionIdentityDetails");
class ProvisionIdentityDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new ProvisionIdentityDetails_1.ProvisionIdentityDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS,
            data: request.data
        }, ProvisionIdentityDetails_1.ProvisionIdentityDetails);
    }
    static fromJson(details) {
        return new ProvisionIdentityDetailsOrdinalVdxfObject({
            data: ProvisionIdentityDetails_1.ProvisionIdentityDetails.fromJson(details.data)
        });
    }
}
exports.ProvisionIdentityDetailsOrdinalVdxfObject = ProvisionIdentityDetailsOrdinalVdxfObject;
