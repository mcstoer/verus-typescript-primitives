"use strict";
/**
 * InformationRequest - Class for handling application requests for specific user information/data
 *
 * This class is used when an application is requesting specific information or data from the user's
 * identity or data stores. The request includes:
 * - Search data keys (VDXF keys) to identify the specific data being requested
 * - Optional specific keys within the data object for partial data requests
 * - Signer information to identify wanted signer of the data
 * - Optional statement for boundhashes in the signature
 *
 * The user's wallet can use these parameters to locate the signed object information and present
 * it to the user for approval before sharing with the requesting application. This enables
 * selective disclosure of personal information while maintaining user privacy and control.
 *
 * Flags determine the type and scope of the request:
 * - FULL_DATA vs PARTIAL_DATA: Whether complete objects or specific fields are requested
 * - COLLECTION: Whether multiple data objects are being requested
 * - HAS_STATEMENT: Whether the request includes an attestation statement
 * - ATTESTATION/CLAIM/CREDENTIAL: Type of verification being requested
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataRequestDetails = void 0;
const bn_js_1 = require("bn.js");
const varuint_1 = require("../../../utils/varuint");
const bufferutils_1 = require("../../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const CompactAddressObject_1 = require("../CompactAddressObject");
const address_1 = require("../../../utils/address");
const vdxf_1 = require("../../../constants/vdxf");
class UserDataRequestDetails {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || UserDataRequestDetails.DEFAULT_VERSION;
        this.flags = (data === null || data === void 0 ? void 0 : data.flags) || new bn_js_1.BN(0);
        this.searchDataKey = (data === null || data === void 0 ? void 0 : data.searchDataKey) || [];
        this.signer = data === null || data === void 0 ? void 0 : data.signer;
        this.requestedKeys = data === null || data === void 0 ? void 0 : data.requestedKeys;
        this.requestID = data === null || data === void 0 ? void 0 : data.requestID;
        this.setFlags();
    }
    calcFlags() {
        let flags = new bn_js_1.BN(0);
        if (this.requestedKeys && this.requestedKeys.length > 0) {
            flags = flags.or(UserDataRequestDetails.HAS_REQUESTED_KEYS);
        }
        if (this.signer) {
            flags = flags.or(UserDataRequestDetails.HAS_SIGNER);
        }
        if (this.requestID) {
            flags = flags.or(UserDataRequestDetails.HAS_REQUEST_ID);
        }
        return flags;
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    hasSigner() {
        return this.flags.and(UserDataRequestDetails.HAS_SIGNER).eq(UserDataRequestDetails.HAS_SIGNER);
    }
    hasRequestedKeys() {
        return this.flags.and(UserDataRequestDetails.HAS_REQUESTED_KEYS).eq(UserDataRequestDetails.HAS_REQUESTED_KEYS);
    }
    hasRequestID() {
        return this.flags.and(UserDataRequestDetails.HAS_REQUEST_ID).eq(UserDataRequestDetails.HAS_REQUEST_ID);
    }
    /**
     * Checks if exactly one data type flag is set (FULL_DATA, PARTIAL_DATA, or COLLECTION)
     * @returns True if exactly one data type flag is set
     */
    hasDataTypeSet() {
        const dataTypeFlags = UserDataRequestDetails.FULL_DATA.or(UserDataRequestDetails.PARTIAL_DATA).or(UserDataRequestDetails.COLLECTION);
        const setDataFlags = this.flags.and(dataTypeFlags);
        // Check if exactly one flag is set by verifying it's a power of 2
        return !setDataFlags.isZero() && setDataFlags.and(setDataFlags.sub(new bn_js_1.BN(1))).isZero();
    }
    /**
     * Checks if exactly one request type flag is set (ATTESTATION, CLAIM, or CREDENTIAL)
     * @returns True if exactly one request type flag is set
     */
    hasRequestTypeSet() {
        const requestTypeFlags = UserDataRequestDetails.ATTESTATION.or(UserDataRequestDetails.CLAIM).or(UserDataRequestDetails.CREDENTIAL);
        const setRequestFlags = this.flags.and(requestTypeFlags);
        // Check if exactly one flag is set by verifying it's a power of 2
        return !setRequestFlags.isZero() && setRequestFlags.and(setRequestFlags.sub(new bn_js_1.BN(1))).isZero();
    }
    isValid() {
        let valid = this.version.gte(UserDataRequestDetails.FIRST_VERSION) && this.version.lte(UserDataRequestDetails.LAST_VERSION);
        // Check that exactly one data type flag is set
        valid && (valid = this.hasDataTypeSet());
        // Check that exactly one request type flag is set
        valid && (valid = this.hasRequestTypeSet());
        // Check that searchDataKey is present
        valid && (valid = Object.keys(this.searchDataKey).length > 0);
        return valid;
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.flags.toNumber());
        length += varuint_1.default.encodingLength(this.searchDataKey.length);
        for (const item of this.searchDataKey) {
            const key = Object.keys(item)[0];
            const value = item[key];
            length += vdxf_1.HASH160_BYTE_LENGTH;
            length += varuint_1.default.encodingLength(Buffer.byteLength(value, 'utf8'));
            length += Buffer.byteLength(value, 'utf8');
        }
        if (this.hasSigner()) {
            length += this.signer.getByteLength();
        }
        if (this.hasRequestedKeys()) {
            length += varuint_1.default.encodingLength(this.requestedKeys ? this.requestedKeys.length : 0);
            if (this.requestedKeys) {
                for (const key of this.requestedKeys) {
                    length += vdxf_1.HASH160_BYTE_LENGTH;
                }
            }
        }
        if (this.hasRequestID()) {
            length += this.requestID.getByteLength();
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeCompactSize(this.flags.toNumber());
        writer.writeCompactSize(this.searchDataKey.length);
        for (const item of this.searchDataKey) {
            const key = Object.keys(item)[0];
            const value = item[key];
            writer.writeSlice((0, address_1.fromBase58Check)(key).hash); // 20-byte VDXF key
            writer.writeVarSlice(Buffer.from(value, 'utf8'));
        }
        if (this.hasSigner()) {
            writer.writeSlice(this.signer.toBuffer());
        }
        if (this.hasRequestedKeys()) {
            writer.writeCompactSize(this.requestedKeys.length);
            for (const key of this.requestedKeys) {
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash); // 20-byte VDXF key
            }
        }
        if (this.hasRequestID()) {
            writer.writeSlice(this.requestID.toBuffer());
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        const searchDataKeyLength = reader.readCompactSize();
        this.searchDataKey = [];
        for (let i = 0; i < searchDataKeyLength; i++) {
            const keyHash = reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH); // 20-byte VDXF key
            const valueBuffer = reader.readVarSlice();
            const value = valueBuffer.toString('utf8');
            const key = (0, address_1.toBase58Check)(keyHash, vdxf_1.I_ADDR_VERSION);
            this.searchDataKey.push({ [key]: value });
        }
        if (this.hasSigner()) {
            const signer = new CompactAddressObject_1.CompactIAddressObject();
            reader.offset = signer.fromBuffer(reader.buffer, reader.offset);
            this.signer = signer;
        }
        if (this.hasRequestedKeys()) {
            const requestedKeysLength = reader.readCompactSize();
            this.requestedKeys = [];
            for (let i = 0; i < requestedKeysLength; i++) {
                const keyHash = reader.readSlice(20); // 20-byte VDXF key
                const key = (0, address_1.toBase58Check)(keyHash, vdxf_1.I_ADDR_VERSION);
                this.requestedKeys.push(key);
            }
        }
        if (this.hasRequestID()) {
            const requestID = new CompactAddressObject_1.CompactIAddressObject();
            reader.offset = requestID.fromBuffer(reader.buffer, reader.offset);
            this.requestID = requestID;
        }
        return reader.offset;
    }
    toJson() {
        var _a, _b;
        const flags = this.calcFlags();
        return {
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            searchdatakey: this.searchDataKey,
            signer: (_a = this.signer) === null || _a === void 0 ? void 0 : _a.toJson(),
            requestedkeys: this.requestedKeys,
            requestid: (_b = this.requestID) === null || _b === void 0 ? void 0 : _b.toJson(),
        };
    }
    static fromJson(json) {
        const requestData = new UserDataRequestDetails();
        requestData.version = new bn_js_1.BN(json.version);
        requestData.flags = new bn_js_1.BN(json.flags);
        requestData.searchDataKey = json.searchdatakey;
        requestData.signer = json.signer ? CompactAddressObject_1.CompactIAddressObject.fromCompactAddressObjectJson(json.signer) : undefined;
        requestData.requestedKeys = json.requestedkeys;
        requestData.requestID = json.requestid ? CompactAddressObject_1.CompactIAddressObject.fromCompactAddressObjectJson(json.requestid) : undefined;
        return requestData;
    }
}
exports.UserDataRequestDetails = UserDataRequestDetails;
UserDataRequestDetails.VERSION_INVALID = new bn_js_1.BN(0);
UserDataRequestDetails.FIRST_VERSION = new bn_js_1.BN(1);
UserDataRequestDetails.LAST_VERSION = new bn_js_1.BN(1);
UserDataRequestDetails.DEFAULT_VERSION = new bn_js_1.BN(1);
UserDataRequestDetails.HAS_REQUEST_ID = new bn_js_1.BN(1);
UserDataRequestDetails.FULL_DATA = new bn_js_1.BN(2);
UserDataRequestDetails.PARTIAL_DATA = new bn_js_1.BN(4);
UserDataRequestDetails.COLLECTION = new bn_js_1.BN(8);
UserDataRequestDetails.ATTESTATION = new bn_js_1.BN(16);
UserDataRequestDetails.CLAIM = new bn_js_1.BN(32);
UserDataRequestDetails.CREDENTIAL = new bn_js_1.BN(64);
UserDataRequestDetails.HAS_SIGNER = new bn_js_1.BN(128);
UserDataRequestDetails.HAS_REQUESTED_KEYS = new bn_js_1.BN(256);
