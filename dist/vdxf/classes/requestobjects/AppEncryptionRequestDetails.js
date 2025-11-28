"use strict";
/**
 * AppEncryptionRequestDetails - Class for handling application requests for encrypted derived seeds
 *
 * This class is used when an application is requesting an encrypted derived seed from the user's master seed,
 * using specific parameters passed by the application. The request includes:
 * - App or delegated ID making the request (mandatory)
 * - A target encryption key (zaddress format) for encrypting the reply
 * - Derivation number for seed generation
 * - Optional derivation ID (defaults to Z-address from ID signing if not present)
 * - Optional request ID for tracking
 *
 * The user's wallet can use these parameters to derive a specific seed from their master seed
 * and encrypt it using the provided encryption key, ensuring the application receives only
 * the specific derived seed it needs without exposing the master seed.
 *
 * The RETURN_ESK flag can be set to signal that the Extended Spending Key should be returned.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEncryptionRequestDetails = void 0;
const bn_js_1 = require("bn.js");
const bufferutils_1 = require("../../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const sapling_1 = require("../../../utils/sapling");
const CompactAddressObject_1 = require("../CompactAddressObject");
const varuint_1 = require("../../../utils/varuint");
const address_1 = require("../../../utils/address");
const vdxf_1 = require("../../../constants/vdxf");
/**
 * Checks if a string is a valid hexadecimal address
 * @param flags - Optional flags for the request
 * @flag HAS_REQUEST_ID - Indicates if a request ID is included
 *
 * @param encryptToZAddress - The encryption key to use for encrypting to
 * @param derivationNumber - The derivation number to validate
 */
class AppEncryptionRequestDetails {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || AppEncryptionRequestDetails.DEFAULT_VERSION;
        this.flags = (data === null || data === void 0 ? void 0 : data.flags) || new bn_js_1.BN(0);
        this.appOrDelegatedID = data === null || data === void 0 ? void 0 : data.appOrDelegatedID;
        this.encryptToZAddress = (data === null || data === void 0 ? void 0 : data.encryptToZAddress) || '';
        this.derivationNumber = (data === null || data === void 0 ? void 0 : data.derivationNumber) || new bn_js_1.BN(0);
        this.derivationID = data === null || data === void 0 ? void 0 : data.derivationID;
        this.requestID = data === null || data === void 0 ? void 0 : data.requestID;
        this.setFlags();
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    calcFlags() {
        let flags = new bn_js_1.BN(0);
        if (this.derivationID != null) {
            flags = flags.or(AppEncryptionRequestDetails.HAS_DERIVATION_ID);
        }
        if (this.requestID != null) {
            flags = flags.or(AppEncryptionRequestDetails.HAS_REQUEST_ID);
        }
        return flags;
    }
    isValid() {
        let valid = this.appOrDelegatedID != null;
        valid && (valid = this.encryptToZAddress != null && this.encryptToZAddress.length > 0);
        valid && (valid = this.derivationNumber != null && this.derivationNumber.gte(new bn_js_1.BN(0)));
        return valid;
    }
    hasDerivationID(flags = this.flags) {
        return flags.and(AppEncryptionRequestDetails.HAS_DERIVATION_ID).gt(new bn_js_1.BN(0));
    }
    hasRequestID(flags = this.flags) {
        return flags.and(AppEncryptionRequestDetails.HAS_REQUEST_ID).gt(new bn_js_1.BN(0));
    }
    getByteLength() {
        const flags = this.calcFlags();
        let length = 0;
        length += varuint_1.default.encodingLength(flags.toNumber());
        // appOrDelegatedID
        length += this.appOrDelegatedID.getByteLength();
        // encryptToKey - zaddress encoding (43 bytes for sapling address data)
        length += 43; // Sapling address decoded data (11 + 32 bytes)
        length += varuint_1.default.encodingLength(this.derivationNumber.toNumber());
        if (this.hasDerivationID(flags)) {
            length += this.derivationID.getByteLength();
        }
        if (this.hasRequestID(flags)) {
            length += vdxf_1.HASH160_BYTE_LENGTH;
        }
        return length;
    }
    toBuffer() {
        const flags = this.calcFlags();
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        // Write flags
        writer.writeCompactSize(flags.toNumber());
        // Write appOrDelegatedID
        writer.writeSlice(this.appOrDelegatedID.toBuffer());
        // Write encryptToAddress as decoded sapling address data
        const saplingData = (0, sapling_1.decodeSaplingAddress)(this.encryptToZAddress);
        writer.writeSlice(Buffer.concat([saplingData.d, saplingData.pk_d]));
        // Write mandatory derivation number
        writer.writeVarInt(this.derivationNumber);
        if (this.hasDerivationID(flags)) {
            writer.writeSlice(this.derivationID.toBuffer());
        }
        if (this.hasRequestID(flags)) {
            writer.writeSlice((0, address_1.fromBase58Check)(this.requestID).hash);
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        // Read flags
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        // Read appOrDelegatedID
        const appOrDelegatedIDObj = new CompactAddressObject_1.CompactAddressObject();
        reader.offset = appOrDelegatedIDObj.fromBuffer(reader.buffer, reader.offset);
        this.appOrDelegatedID = appOrDelegatedIDObj;
        // Read encryptToAddress as 43-byte sapling data and encode as sapling address
        const saplingData = reader.readSlice(43);
        this.encryptToZAddress = (0, sapling_1.toBech32)('zs', saplingData);
        // Read mandatory derivation number
        this.derivationNumber = reader.readVarInt();
        if (this.hasDerivationID()) {
            const derivationIDObj = new CompactAddressObject_1.CompactAddressObject();
            reader.offset = derivationIDObj.fromBuffer(reader.buffer, reader.offset);
            this.derivationID = derivationIDObj;
        }
        if (this.hasRequestID()) {
            this.requestID = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        }
        return reader.offset;
    }
    toJson() {
        var _a;
        // Set flags before serialization
        const flags = this.calcFlags();
        return {
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            appordelegatedid: this.appOrDelegatedID.toJson(),
            encrypttozaddress: this.encryptToZAddress,
            derivationnumber: this.derivationNumber.toNumber(),
            derivationid: (_a = this.derivationID) === null || _a === void 0 ? void 0 : _a.toJson(),
            requestid: this.requestID
        };
    }
    static fromJson(json) {
        const instance = new AppEncryptionRequestDetails();
        instance.version = new bn_js_1.BN(json.version);
        instance.flags = new bn_js_1.BN(json.flags);
        instance.appOrDelegatedID = CompactAddressObject_1.CompactAddressObject.fromJson(json.appordelegatedid);
        instance.encryptToZAddress = json.encrypttozaddress;
        instance.derivationNumber = new bn_js_1.BN(json.derivationnumber);
        if (instance.hasDerivationID()) {
            instance.derivationID = CompactAddressObject_1.CompactAddressObject.fromJson(json === null || json === void 0 ? void 0 : json.derivationid);
        }
        if (instance.hasRequestID()) {
            instance.requestID = json === null || json === void 0 ? void 0 : json.requestid;
        }
        return instance;
    }
}
exports.AppEncryptionRequestDetails = AppEncryptionRequestDetails;
AppEncryptionRequestDetails.VERSION_INVALID = new bn_js_1.BN(0);
AppEncryptionRequestDetails.FIRST_VERSION = new bn_js_1.BN(1);
AppEncryptionRequestDetails.LAST_VERSION = new bn_js_1.BN(1);
AppEncryptionRequestDetails.DEFAULT_VERSION = new bn_js_1.BN(1);
AppEncryptionRequestDetails.HAS_DERIVATION_ID = new bn_js_1.BN(1);
AppEncryptionRequestDetails.HAS_REQUEST_ID = new bn_js_1.BN(2);
AppEncryptionRequestDetails.RETURN_ESK = new bn_js_1.BN(4); //flag to signal to return the Extended Spending Key
