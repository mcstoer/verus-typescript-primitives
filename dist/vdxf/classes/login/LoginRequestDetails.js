"use strict";
/**
 * LoginRequestDetails - Class for handling application login and authentication requests
 *
 * This class is used when an application is requesting authentication or login from the user,
 * including specific recipientConstraints and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Response URIs for post-authentication redirects
 * - Optional expiry time for the authentication session
 *
 * The user's wallet can use these parameters to present a clear authentication request
 * to the user, showing exactly what recipientConstraints are being requested and where they will
 * be redirected after successful authentication. This enables secure, user-controlled
 * authentication flows with granular permission management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRequestDetails = void 0;
const bufferutils_1 = require("../../../utils/bufferutils");
const bn_js_1 = require("bn.js");
const varuint_1 = require("../../../utils/varuint");
const vdxf_1 = require("../../../constants/vdxf");
const address_1 = require("../../../utils/address");
const CompactAddressObject_1 = require("../CompactAddressObject");
const ResponseURI_1 = require("../ResponseURI");
class LoginRequestDetails {
    constructor(request) {
        this.version = (request === null || request === void 0 ? void 0 : request.version) || LoginRequestDetails.DEFAULT_VERSION;
        this.requestID = (request === null || request === void 0 ? void 0 : request.requestID) || '';
        this.flags = (request === null || request === void 0 ? void 0 : request.flags) || new bn_js_1.BN(0, 10);
        this.recipientConstraints = (request === null || request === void 0 ? void 0 : request.recipientConstraints) || null;
        this.responseURIs = (request === null || request === void 0 ? void 0 : request.responseURIs) || null;
        this.expiryTime = (request === null || request === void 0 ? void 0 : request.expiryTime) || null;
        this.setFlags();
    }
    hasRecipentConstraints() {
        return this.flags.and(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS).eq(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
    }
    hasResponseURIs() {
        return this.flags.and(LoginRequestDetails.FLAG_HAS_RESPONSE_URIS).eq(LoginRequestDetails.FLAG_HAS_RESPONSE_URIS);
    }
    hasExpiryTime() {
        return this.flags.and(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME).eq(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
    }
    calcFlags(flags = this.flags) {
        if (this.recipientConstraints) {
            flags = flags.or(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
        }
        if (this.responseURIs) {
            flags = flags.or(LoginRequestDetails.FLAG_HAS_RESPONSE_URIS);
        }
        if (this.expiryTime) {
            flags = flags.or(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
        }
        return flags;
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.flags.toNumber());
        length += vdxf_1.HASH160_BYTE_LENGTH;
        if (this.hasRecipentConstraints()) {
            length += varuint_1.default.encodingLength(this.recipientConstraints.length);
            for (let i = 0; i < this.recipientConstraints.length; i++) {
                length += varuint_1.default.encodingLength(this.recipientConstraints[i].type);
                length += this.recipientConstraints[i].identity.getByteLength();
            }
        }
        if (this.hasResponseURIs()) {
            length += varuint_1.default.encodingLength(this.responseURIs.length);
            for (let i = 0; i < this.responseURIs.length; i++) {
                length += this.responseURIs[i].getByteLength();
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
        writer.writeSlice((0, address_1.fromBase58Check)(this.requestID).hash);
        if (this.hasRecipentConstraints()) {
            writer.writeCompactSize(this.recipientConstraints.length);
            for (let i = 0; i < this.recipientConstraints.length; i++) {
                writer.writeCompactSize(this.recipientConstraints[i].type);
                writer.writeSlice(this.recipientConstraints[i].identity.toBuffer());
            }
        }
        if (this.hasResponseURIs()) {
            writer.writeCompactSize(this.responseURIs.length);
            for (let i = 0; i < this.responseURIs.length; i++) {
                writer.writeSlice(this.responseURIs[i].toBuffer());
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
        this.requestID = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        if (this.hasRecipentConstraints()) {
            this.recipientConstraints = [];
            const recipientConstraintsLength = reader.readCompactSize();
            for (let i = 0; i < recipientConstraintsLength; i++) {
                const compactId = new CompactAddressObject_1.CompactAddressObject();
                const type = reader.readCompactSize();
                const identityOffset = reader.offset;
                reader.offset = compactId.fromBuffer(buffer, identityOffset);
                this.recipientConstraints.push({
                    type: type,
                    identity: compactId
                });
            }
        }
        if (this.hasResponseURIs()) {
            this.responseURIs = [];
            const callbackURIsLength = reader.readCompactSize();
            for (let i = 0; i < callbackURIsLength; i++) {
                const newURI = new ResponseURI_1.ResponseURI();
                reader.offset = newURI.fromBuffer(reader.buffer, reader.offset);
                this.responseURIs.push(newURI);
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
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            requestid: this.requestID,
            recipientConstraints: this.recipientConstraints ? this.recipientConstraints.map(p => ({ type: p.type,
                identity: p.identity.toJson() })) : undefined,
            responseURIs: this.responseURIs ? this.responseURIs.map(x => x.toJson()) : undefined,
            expirytime: this.expiryTime ? this.expiryTime.toNumber() : undefined
        };
        return retval;
    }
    static fromJson(data) {
        const loginDetails = new LoginRequestDetails();
        loginDetails.version = new bn_js_1.BN((data === null || data === void 0 ? void 0 : data.version) || 0);
        loginDetails.flags = new bn_js_1.BN((data === null || data === void 0 ? void 0 : data.flags) || 0);
        loginDetails.requestID = data.requestid;
        if (loginDetails.hasRecipentConstraints() && data.recipientConstraints) {
            loginDetails.recipientConstraints = data.recipientConstraints.map(p => ({ type: p.type,
                identity: CompactAddressObject_1.CompactAddressObject.fromJson(p.identity) }));
        }
        if (loginDetails.hasResponseURIs() && data.responseURIs) {
            loginDetails.responseURIs = data.responseURIs.map(c => ResponseURI_1.ResponseURI.fromJson(c));
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
        let valid = this.requestID != null && this.requestID.length > 0;
        valid && (valid = this.flags != null && this.flags.gte(new bn_js_1.BN(0)));
        // Validate requestID is a valid base58 address
        try {
            (0, address_1.fromBase58Check)(this.requestID);
        }
        catch (_a) {
            valid = false;
        }
        if (this.hasRecipentConstraints()) {
            if (!this.recipientConstraints || this.recipientConstraints.length === 0) {
                return false;
            }
        }
        if (this.hasResponseURIs()) {
            if (!this.responseURIs || this.responseURIs.length === 0) {
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
exports.LoginRequestDetails = LoginRequestDetails;
// Version
LoginRequestDetails.DEFAULT_VERSION = new bn_js_1.BN(1, 10);
LoginRequestDetails.VERSION_FIRSTVALID = new bn_js_1.BN(1, 10);
LoginRequestDetails.VERSION_LASTVALID = new bn_js_1.BN(1, 10);
LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS = new bn_js_1.BN(1, 10);
LoginRequestDetails.FLAG_HAS_RESPONSE_URIS = new bn_js_1.BN(2, 10);
LoginRequestDetails.FLAG_HAS_EXPIRY_TIME = new bn_js_1.BN(4, 10);
// Recipient Constraint Types - What types of Identity can login, e.g. REQUIRED_SYSTEM and "VRSC" means only identities on the Verus chain can login
LoginRequestDetails.REQUIRED_ID = 1;
LoginRequestDetails.REQUIRED_SYSTEM = 2;
LoginRequestDetails.REQUIRED_PARENT = 3;
