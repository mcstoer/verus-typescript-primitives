"use strict";
/**
 * LoginRequestDetails - Class for handling application login and authentication requests
 *
 * This class is used when an application is requesting authentication or login from the user,
 * including specific recipientConstraints and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Callback URIs for post-authentication redirects
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
const CompactIdAddressObject_1 = require("../CompactIdAddressObject");
class LoginRequestDetails {
    constructor(request) {
        this.version = (request === null || request === void 0 ? void 0 : request.version) || LoginRequestDetails.DEFAULT_VERSION;
        this.requestId = (request === null || request === void 0 ? void 0 : request.requestId) || '';
        this.flags = (request === null || request === void 0 ? void 0 : request.flags) || new bn_js_1.BN(0, 10);
        this.recipientConstraints = (request === null || request === void 0 ? void 0 : request.recipientConstraints) || null;
        this.callbackURIs = (request === null || request === void 0 ? void 0 : request.callbackURIs) || null;
        this.expiryTime = (request === null || request === void 0 ? void 0 : request.expiryTime) || null;
        this.setFlags();
    }
    hasRecipentConstraints() {
        return this.flags.and(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS).eq(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
    }
    hascallbackURIs() {
        return this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
    }
    hasExpiryTime() {
        return this.flags.and(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME).eq(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
    }
    calcFlags(flags = this.flags) {
        if (this.recipientConstraints) {
            flags = flags.or(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
        }
        if (this.callbackURIs) {
            flags = flags.or(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
        }
        if (this.expiryTime) {
            flags = flags.or(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
        }
        return flags;
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.flags.toNumber());
        length += 20; // requestId hash length
        if (this.hasRecipentConstraints()) {
            length += varuint_1.default.encodingLength(this.recipientConstraints.length);
            for (let i = 0; i < this.recipientConstraints.length; i++) {
                length += varuint_1.default.encodingLength(this.recipientConstraints[i].type);
                length += this.recipientConstraints[i].identity.getByteLength();
            }
        }
        if (this.hascallbackURIs()) {
            length += varuint_1.default.encodingLength(this.callbackURIs.length);
            for (let i = 0; i < this.callbackURIs.length; i++) {
                length += varuint_1.default.encodingLength(this.callbackURIs[i].type);
                length += varuint_1.default.encodingLength(Buffer.from(this.callbackURIs[i].uri, 'utf8').byteLength);
                length += Buffer.from(this.callbackURIs[i].uri, 'utf8').byteLength;
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
        writer.writeSlice((0, address_1.fromBase58Check)(this.requestId).hash);
        if (this.hasRecipentConstraints()) {
            writer.writeCompactSize(this.recipientConstraints.length);
            for (let i = 0; i < this.recipientConstraints.length; i++) {
                writer.writeCompactSize(this.recipientConstraints[i].type);
                writer.writeSlice(this.recipientConstraints[i].identity.toBuffer());
            }
        }
        if (this.hascallbackURIs()) {
            writer.writeCompactSize(this.callbackURIs.length);
            for (let i = 0; i < this.callbackURIs.length; i++) {
                writer.writeCompactSize(this.callbackURIs[i].type);
                writer.writeVarSlice(Buffer.from(this.callbackURIs[i].uri, 'utf8'));
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
        this.requestId = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        if (this.hasRecipentConstraints()) {
            this.recipientConstraints = [];
            const recipientConstraintsLength = reader.readCompactSize();
            for (let i = 0; i < recipientConstraintsLength; i++) {
                const compactId = new CompactIdAddressObject_1.CompactIdAddressObject();
                const type = reader.readCompactSize();
                const identityOffset = reader.offset;
                reader.offset = compactId.fromBuffer(buffer, identityOffset);
                this.recipientConstraints.push({
                    type: type,
                    identity: compactId
                });
            }
        }
        if (this.hascallbackURIs()) {
            this.callbackURIs = [];
            const callbackURIsLength = reader.readCompactSize();
            for (let i = 0; i < callbackURIsLength; i++) {
                this.callbackURIs.push({
                    type: reader.readCompactSize(),
                    uri: reader.readVarSlice().toString('utf8')
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
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            requestid: this.requestId,
            recipientConstraints: this.recipientConstraints ? this.recipientConstraints.map(p => ({ type: p.type,
                identity: p.identity.toJson() })) : undefined,
            callbackURIs: this.callbackURIs ? this.callbackURIs : undefined,
            expirytime: this.expiryTime ? this.expiryTime.toNumber() : undefined
        };
        return retval;
    }
    static fromJson(data) {
        const loginDetails = new LoginRequestDetails();
        loginDetails.version = new bn_js_1.BN((data === null || data === void 0 ? void 0 : data.version) || 0);
        loginDetails.flags = new bn_js_1.BN((data === null || data === void 0 ? void 0 : data.flags) || 0);
        loginDetails.requestId = data.requestid;
        if (loginDetails.hasRecipentConstraints() && data.recipientConstraints) {
            loginDetails.recipientConstraints = data.recipientConstraints.map(p => ({ type: p.type,
                identity: CompactIdAddressObject_1.CompactIdAddressObject.fromJson(p.identity) }));
        }
        if (loginDetails.hascallbackURIs() && data.callbackURIs) {
            loginDetails.callbackURIs = data.callbackURIs.map(c => ({ type: c.type,
                uri: c.uri }));
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
        let valid = this.requestId != null && this.requestId.length > 0;
        valid && (valid = this.flags != null && this.flags.gte(new bn_js_1.BN(0)));
        // Validate requestId is a valid base58 address
        try {
            (0, address_1.fromBase58Check)(this.requestId);
        }
        catch (_a) {
            valid = false;
        }
        if (this.hasRecipentConstraints()) {
            if (!this.recipientConstraints || this.recipientConstraints.length === 0) {
                return false;
            }
        }
        if (this.hascallbackURIs()) {
            if (!this.callbackURIs || this.callbackURIs.length === 0) {
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
LoginRequestDetails.FLAG_HAS_CALLBACK_URI = new bn_js_1.BN(2, 10);
LoginRequestDetails.FLAG_HAS_EXPIRY_TIME = new bn_js_1.BN(4, 10);
// Recipient Constraint Types - What types of Identity can login, e.g. REQUIRED_SYSTEM and "VRSC" means only identities on the Verus chain can login
LoginRequestDetails.REQUIRED_ID = 1;
LoginRequestDetails.REQUIRED_SYSTEM = 2;
LoginRequestDetails.REQUIRED_PARENT = 3;
// Callback URI Types
LoginRequestDetails.TYPE_WEBHOOK = 1;
LoginRequestDetails.TYPE_REDIRECT = 2;
