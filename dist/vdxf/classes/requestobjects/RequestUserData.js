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
exports.RequestUserData = void 0;
const bn_js_1 = require("bn.js");
const varuint_1 = require("../../../utils/varuint");
const bufferutils_1 = require("../../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const CompactIdAddressObject_1 = require("../CompactIdAddressObject");
const address_1 = require("../../../utils/address");
class RequestUserData {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || RequestUserData.DEFAULT_VERSION;
        this.flags = (data === null || data === void 0 ? void 0 : data.flags) || new bn_js_1.BN(0);
        this.searchDataKey = (data === null || data === void 0 ? void 0 : data.searchDataKey) || [];
        this.signer = data === null || data === void 0 ? void 0 : data.signer;
        this.requestedKeys = data === null || data === void 0 ? void 0 : data.requestedKeys;
        this.setFlags();
    }
    calcFlags() {
        let flags = new bn_js_1.BN(0);
        if (this.requestedKeys && this.requestedKeys.length > 0) {
            flags = flags.or(RequestUserData.HAS_REQUESTED_KEYS);
        }
        if (this.signer) {
            flags = flags.or(RequestUserData.HAS_SIGNER);
        }
        return flags;
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    hasSigner() {
        return this.flags.and(RequestUserData.HAS_SIGNER).eq(RequestUserData.HAS_SIGNER);
    }
    hasRequestedKeys() {
        return this.flags.and(RequestUserData.HAS_REQUESTED_KEYS).eq(RequestUserData.HAS_REQUESTED_KEYS);
    }
    /**
     * Checks if exactly one data type flag is set (FULL_DATA, PARTIAL_DATA, or COLLECTION)
     * @returns True if exactly one data type flag is set
     */
    hasDataTypeSet() {
        const dataTypeFlags = RequestUserData.FULL_DATA.or(RequestUserData.PARTIAL_DATA).or(RequestUserData.COLLECTION);
        const setDataFlags = this.flags.and(dataTypeFlags);
        // Check if exactly one flag is set by verifying it's a power of 2
        return !setDataFlags.isZero() && setDataFlags.and(setDataFlags.sub(new bn_js_1.BN(1))).isZero();
    }
    /**
     * Checks if exactly one request type flag is set (ATTESTATION, CLAIM, or CREDENTIAL)
     * @returns True if exactly one request type flag is set
     */
    hasRequestTypeSet() {
        const requestTypeFlags = RequestUserData.ATTESTATION.or(RequestUserData.CLAIM).or(RequestUserData.CREDENTIAL);
        const setRequestFlags = this.flags.and(requestTypeFlags);
        // Check if exactly one flag is set by verifying it's a power of 2
        return !setRequestFlags.isZero() && setRequestFlags.and(setRequestFlags.sub(new bn_js_1.BN(1))).isZero();
    }
    isValid() {
        let valid = this.version.gte(RequestUserData.FIRST_VERSION) && this.version.lte(RequestUserData.LAST_VERSION);
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
            length += 20; // VDXF key length
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
                    length += 20; // VDXF key length 
                }
            }
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
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        const searchDataKeyLength = reader.readCompactSize();
        this.searchDataKey = [];
        for (let i = 0; i < searchDataKeyLength; i++) {
            const keyHash = reader.readSlice(20); // 20-byte VDXF key
            const valueBuffer = reader.readVarSlice();
            const value = valueBuffer.toString('utf8');
            const key = (0, address_1.toBase58Check)(keyHash, 102);
            this.searchDataKey.push({ [key]: value });
        }
        if (this.hasSigner()) {
            const signer = new CompactIdAddressObject_1.CompactIdAddressObject();
            reader.offset = signer.fromBuffer(reader.buffer, reader.offset);
            this.signer = signer;
        }
        if (this.hasRequestedKeys()) {
            const requestedKeysLength = reader.readCompactSize();
            this.requestedKeys = [];
            for (let i = 0; i < requestedKeysLength; i++) {
                const keyHash = reader.readSlice(20); // 20-byte VDXF key
                const key = (0, address_1.toBase58Check)(keyHash, 102);
                this.requestedKeys.push(key);
            }
        }
        return reader.offset;
    }
    toJson() {
        const flags = this.calcFlags();
        return {
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            searchdatakey: this.searchDataKey,
            signer: this.signer.toJson(),
            requestedkeys: this.requestedKeys
        };
    }
    static fromJson(json) {
        const requestData = new RequestUserData();
        requestData.version = new bn_js_1.BN(json.version);
        requestData.flags = new bn_js_1.BN(json.flags);
        requestData.searchDataKey = json.searchdatakey;
        requestData.signer = json.signer ? CompactIdAddressObject_1.CompactIdAddressObject.fromJson(json.signer) : undefined;
        requestData.requestedKeys = json.requestedkeys;
        return requestData;
    }
}
exports.RequestUserData = RequestUserData;
RequestUserData.VERSION_INVALID = new bn_js_1.BN(0);
RequestUserData.FIRST_VERSION = new bn_js_1.BN(1);
RequestUserData.LAST_VERSION = new bn_js_1.BN(1);
RequestUserData.DEFAULT_VERSION = new bn_js_1.BN(1);
RequestUserData.FULL_DATA = new bn_js_1.BN(1);
RequestUserData.PARTIAL_DATA = new bn_js_1.BN(2);
RequestUserData.COLLECTION = new bn_js_1.BN(4);
RequestUserData.ATTESTATION = new bn_js_1.BN(8);
RequestUserData.CLAIM = new bn_js_1.BN(16);
RequestUserData.CREDENTIAL = new bn_js_1.BN(32);
RequestUserData.HAS_SIGNER = new bn_js_1.BN(64);
RequestUserData.HAS_REQUESTED_KEYS = new bn_js_1.BN(128);
