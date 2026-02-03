"use strict";
/**
 * AuthenticationRequestDetails - Class for handling application login and authentication requests
 *
 * This class is used when an application is requesting authentication or login from the user,
 * including specific recipientConstraints and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Optional expiry time for the authentication session
 *
 * The user's wallet can use these parameters to present a clear authentication request
 * to the user, showing exactly what recipientConstraints are being requested and where they will
 * be redirected after successful authentication. This enables secure, user-controlled
 * authentication flows with granular permission management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationRequestDetails = void 0;
const bufferutils_1 = require("../../../utils/bufferutils");
const bn_js_1 = require("bn.js");
const varuint_1 = require("../../../utils/varuint");
const CompactAddressObject_1 = require("../CompactAddressObject");
class AuthenticationRequestDetails {
    constructor(request) {
        this.flags = (request === null || request === void 0 ? void 0 : request.flags) || new bn_js_1.BN(0, 10);
        this.requestID = (request === null || request === void 0 ? void 0 : request.requestID) || null;
        this.recipientConstraints = (request === null || request === void 0 ? void 0 : request.recipientConstraints) || null;
        this.expiryTime = (request === null || request === void 0 ? void 0 : request.expiryTime) || null;
        this.setFlags();
    }
    hasRequestID() {
        return this.flags.and(AuthenticationRequestDetails.FLAG_HAS_REQUEST_ID).eq(AuthenticationRequestDetails.FLAG_HAS_REQUEST_ID);
    }
    hasRecipentConstraints() {
        return this.flags.and(AuthenticationRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS).eq(AuthenticationRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
    }
    hasExpiryTime() {
        return this.flags.and(AuthenticationRequestDetails.FLAG_HAS_EXPIRY_TIME).eq(AuthenticationRequestDetails.FLAG_HAS_EXPIRY_TIME);
    }
    calcFlags(flags = this.flags) {
        if (this.requestID) {
            flags = flags.or(AuthenticationRequestDetails.FLAG_HAS_REQUEST_ID);
        }
        if (this.recipientConstraints) {
            flags = flags.or(AuthenticationRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
        }
        if (this.expiryTime) {
            flags = flags.or(AuthenticationRequestDetails.FLAG_HAS_EXPIRY_TIME);
        }
        return flags;
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.flags.toNumber());
        if (this.hasRequestID()) {
            length += this.requestID.getByteLength();
        }
        if (this.hasRecipentConstraints()) {
            length += varuint_1.default.encodingLength(this.recipientConstraints.length);
            for (let i = 0; i < this.recipientConstraints.length; i++) {
                length += varuint_1.default.encodingLength(this.recipientConstraints[i].type);
                length += this.recipientConstraints[i].identity.getByteLength();
            }
        }
        if (this.hasExpiryTime()) {
            length += varuint_1.default.encodingLength(this.expiryTime.toNumber());
        }
        return length;
    }
    toBuffer() {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeCompactSize(this.flags.toNumber());
        if (this.hasRequestID()) {
            writer.writeSlice(this.requestID.toBuffer());
        }
        if (this.hasRecipentConstraints()) {
            writer.writeCompactSize(this.recipientConstraints.length);
            for (let i = 0; i < this.recipientConstraints.length; i++) {
                writer.writeCompactSize(this.recipientConstraints[i].type);
                writer.writeSlice(this.recipientConstraints[i].identity.toBuffer());
            }
        }
        if (this.hasExpiryTime()) {
            writer.writeCompactSize(this.expiryTime.toNumber());
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        if (this.hasRequestID()) {
            this.requestID = new CompactAddressObject_1.CompactIAddressObject();
            reader.offset = this.requestID.fromBuffer(reader.buffer, reader.offset);
        }
        if (this.hasRecipentConstraints()) {
            this.recipientConstraints = [];
            const recipientConstraintsLength = reader.readCompactSize();
            for (let i = 0; i < recipientConstraintsLength; i++) {
                const compactId = new CompactAddressObject_1.CompactIAddressObject();
                const type = reader.readCompactSize();
                const identityOffset = reader.offset;
                reader.offset = compactId.fromBuffer(buffer, identityOffset);
                this.recipientConstraints.push({
                    type: type,
                    identity: compactId
                });
            }
        }
        if (this.hasExpiryTime()) {
            this.expiryTime = new bn_js_1.BN(reader.readCompactSize());
        }
        return reader.offset;
    }
    toJson() {
        const flags = this.calcFlags();
        const retval = {
            flags: flags.toNumber(),
            requestid: this.requestID.toJson(),
            recipientConstraints: this.recipientConstraints ? this.recipientConstraints.map(p => ({ type: p.type,
                identity: p.identity.toJson() })) : undefined,
            expirytime: this.expiryTime ? this.expiryTime.toNumber() : undefined
        };
        return retval;
    }
    static fromJson(data) {
        const loginDetails = new AuthenticationRequestDetails();
        loginDetails.flags = new bn_js_1.BN((data === null || data === void 0 ? void 0 : data.flags) || 0);
        loginDetails.requestID = CompactAddressObject_1.CompactIAddressObject.fromCompactAddressObjectJson(data.requestid);
        if (loginDetails.hasRecipentConstraints() && data.recipientconstraints) {
            loginDetails.recipientConstraints = data.recipientconstraints.map(p => ({ type: p.type,
                identity: CompactAddressObject_1.CompactIAddressObject.fromCompactAddressObjectJson(p.identity) }));
        }
        if (loginDetails.hasExpiryTime() && data.expirytime) {
            loginDetails.expiryTime = new bn_js_1.BN(data.expirytime);
        }
        return loginDetails;
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    isValid() {
        let valid = true;
        valid && (valid = this.flags != null && this.flags.gte(new bn_js_1.BN(0)));
        if (this.hasRequestID()) {
            if (!this.requestID || !this.requestID.isValid()) {
                return false;
            }
        }
        if (this.hasRecipentConstraints()) {
            if (!this.recipientConstraints || this.recipientConstraints.length === 0) {
                return false;
            }
        }
        if (this.hasExpiryTime()) {
            if (!this.expiryTime || this.expiryTime.isZero()) {
                return false;
            }
        }
        return valid;
    }
}
exports.AuthenticationRequestDetails = AuthenticationRequestDetails;
AuthenticationRequestDetails.FLAG_HAS_REQUEST_ID = new bn_js_1.BN(1, 10);
AuthenticationRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS = new bn_js_1.BN(2, 10);
AuthenticationRequestDetails.FLAG_HAS_EXPIRY_TIME = new bn_js_1.BN(4, 10);
// Recipient Constraint Types - What types of Identity can login, e.g. REQUIRED_SYSTEM and "VRSC" means only identities on the Verus chain can login
AuthenticationRequestDetails.REQUIRED_ID = 1;
AuthenticationRequestDetails.REQUIRED_SYSTEM = 2;
AuthenticationRequestDetails.REQUIRED_PARENT = 3;
