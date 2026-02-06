"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvisionIdentityDetailsOrdinalVDXFObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVDXFObject_1 = require("./SerializableEntityOrdinalVDXFObject");
const ProvisionIdentityDetails_1 = require("../provisioning/ProvisionIdentityDetails");
class ProvisionIdentityDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject_1.SerializableEntityOrdinalVDXFObject {
    constructor(request = {
        data: new ProvisionIdentityDetails_1.ProvisionIdentityDetails()
    }) {
        super({
            type: ordinals_1.PROVISION_IDENTITY_DETAILS_VDXF_ORDINAL,
            data: request.data
        }, ProvisionIdentityDetails_1.ProvisionIdentityDetails);
    }
    static fromJson(details) {
        return new ProvisionIdentityDetailsOrdinalVDXFObject({
            data: ProvisionIdentityDetails_1.ProvisionIdentityDetails.fromJson(details.data)
        });
    }
}
exports.ProvisionIdentityDetailsOrdinalVDXFObject = ProvisionIdentityDetailsOrdinalVDXFObject;
