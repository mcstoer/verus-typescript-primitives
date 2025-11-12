"use strict";
/**
 * ProvisioningIdentity - Class for handling identity provisioning requests
 *
 * This class is used when an application is requesting the provisioning or creation of a new identity
 * within the Verus blockchain ecosystem. The request includes:
 * - System ID (e.g., VRSC@) defining the blockchain system
 * - Parent ID (e.g., Token@) defining the parent namespace
 * - Identity ID (e.g., john.VRSC@) defining the full identity to be provisioned
 * - Flags indicating which components are present and required
 *
 * The user's wallet can use these parameters to understand the complete identity hierarchy
 * and present a clear provisioning request to the user, showing the system context,
 * parent namespace, and the specific identity being created. This enables secure,
 * user-controlled identity provisioning with proper namespace management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvisionIdentityDetails = void 0;
const bufferutils_1 = require("../../../utils/bufferutils");
const bn_js_1 = require("bn.js");
const CompactIdAddressObject_1 = require("../CompactIdAddressObject");
const varuint_1 = require("../../../utils/varuint");
class ProvisionIdentityDetails {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || ProvisionIdentityDetails.DEFAULT_VERSION;
        this.flags = (data === null || data === void 0 ? void 0 : data.flags) || new bn_js_1.BN(0, 10);
        this.systemId = data === null || data === void 0 ? void 0 : data.systemId;
        this.parentId = data === null || data === void 0 ? void 0 : data.parentId;
        this.identityId = data === null || data === void 0 ? void 0 : data.identityId;
        this.setFlags();
    }
    hasSystemId() {
        return this.flags.and(ProvisionIdentityDetails.FLAG_HAS_SYSTEMID).eq(ProvisionIdentityDetails.FLAG_HAS_SYSTEMID);
    }
    hasParentId() {
        return this.flags.and(ProvisionIdentityDetails.FLAG_HAS_PARENTID).eq(ProvisionIdentityDetails.FLAG_HAS_PARENTID);
    }
    hasIdentityId() {
        return this.flags.and(ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION).eq(ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION);
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.flags.toNumber());
        if (this.hasSystemId()) {
            length += this.systemId.getByteLength();
        }
        if (this.hasParentId()) {
            length += this.parentId.getByteLength();
        }
        if (this.hasIdentityId()) {
            length += this.identityId.getByteLength();
        }
        return length;
    }
    toBuffer() {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeCompactSize(this.flags.toNumber());
        if (this.hasSystemId()) {
            writer.writeSlice(this.systemId.toBuffer());
        }
        if (this.hasParentId()) {
            writer.writeSlice(this.parentId.toBuffer());
        }
        if (this.hasIdentityId()) {
            writer.writeSlice(this.identityId.toBuffer());
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        if (buffer.length == 0)
            throw new Error("Cannot create provision identity from empty buffer");
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        if (this.hasSystemId()) {
            const systemId = new CompactIdAddressObject_1.CompactIdAddressObject();
            reader.offset = systemId.fromBuffer(reader.buffer, reader.offset);
            this.systemId = systemId;
        }
        if (this.hasParentId()) {
            const parentId = new CompactIdAddressObject_1.CompactIdAddressObject();
            reader.offset = parentId.fromBuffer(reader.buffer, reader.offset);
            this.parentId = parentId;
        }
        if (this.hasIdentityId()) {
            const identityId = new CompactIdAddressObject_1.CompactIdAddressObject();
            reader.offset = identityId.fromBuffer(reader.buffer, reader.offset);
            this.identityId = identityId;
        }
        return reader.offset;
    }
    toJson() {
        const flags = this.calcFlags();
        return {
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            systemid: this.systemId ? this.systemId.toJson() : null,
            parentid: this.parentId ? this.parentId.toJson() : null,
            identityid: this.identityId ? this.identityId.toJson() : null,
        };
    }
    static fromJson(data) {
        const provision = new ProvisionIdentityDetails();
        provision.version = new bn_js_1.BN((data === null || data === void 0 ? void 0 : data.version) || 0);
        provision.flags = new bn_js_1.BN((data === null || data === void 0 ? void 0 : data.flags) || 0);
        if (provision.hasSystemId()) {
            provision.systemId = CompactIdAddressObject_1.CompactIdAddressObject.fromJson(data.systemid);
        }
        if (provision.hasParentId()) {
            provision.parentId = CompactIdAddressObject_1.CompactIdAddressObject.fromJson(data.parentid);
        }
        if (provision.hasIdentityId()) {
            provision.identityId = CompactIdAddressObject_1.CompactIdAddressObject.fromJson(data.identityid);
        }
        return provision;
    }
    calcFlags() {
        let flags = new bn_js_1.BN(0, 10);
        if (this.systemId) {
            flags = flags.or(ProvisionIdentityDetails.FLAG_HAS_SYSTEMID);
        }
        if (this.parentId) {
            flags = flags.or(ProvisionIdentityDetails.FLAG_HAS_PARENTID);
        }
        if (this.identityId) {
            flags = flags.or(ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION);
        }
        return flags;
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    isValid() {
        let valid = this.flags != null && this.flags.gte(new bn_js_1.BN(0));
        valid && (valid = this.version != null);
        return valid;
    }
}
exports.ProvisionIdentityDetails = ProvisionIdentityDetails;
// Version
ProvisionIdentityDetails.DEFAULT_VERSION = new bn_js_1.BN(1, 10);
ProvisionIdentityDetails.VERSION_FIRSTVALID = new bn_js_1.BN(1, 10);
ProvisionIdentityDetails.VERSION_LASTVALID = new bn_js_1.BN(1, 10);
// flags include params // parent same as signer
ProvisionIdentityDetails.FLAG_HAS_SYSTEMID = new bn_js_1.BN(1, 10);
ProvisionIdentityDetails.FLAG_HAS_PARENTID = new bn_js_1.BN(2, 10);
ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION = new bn_js_1.BN(4, 10);
