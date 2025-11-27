"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEncryptionResponseDetails = void 0;
const bn_js_1 = require("bn.js");
const varint_1 = require("../../../utils/varint");
const bufferutils_1 = require("../../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const address_1 = require("../../../utils/address");
const vdxf_1 = require("../../../constants/vdxf");
const pbaas_1 = require("../../../pbaas");
const createHash = require("create-hash");
const SaplingExtendedSpendingKey_1 = require("../../../pbaas/SaplingExtendedSpendingKey");
const SaplingExtendedViewingKey_1 = require("../../../pbaas/SaplingExtendedViewingKey");
class AppEncryptionResponseDetails {
    constructor(data) {
        var _a, _b, _c, _d, _e;
        this.version = (_a = data === null || data === void 0 ? void 0 : data.version) !== null && _a !== void 0 ? _a : new bn_js_1.BN(1);
        this.flags = (_b = data === null || data === void 0 ? void 0 : data.flags) !== null && _b !== void 0 ? _b : new bn_js_1.BN(0, 10);
        this.IncomingViewingKey = (_c = data === null || data === void 0 ? void 0 : data.IncomingViewingKey) !== null && _c !== void 0 ? _c : Buffer.alloc(32);
        this.extendedViewingKey = (_d = data === null || data === void 0 ? void 0 : data.extendedViewingKey) !== null && _d !== void 0 ? _d : new SaplingExtendedViewingKey_1.SaplingExtendedViewingKey();
        this.address = (_e = data === null || data === void 0 ? void 0 : data.address) !== null && _e !== void 0 ? _e : new pbaas_1.SaplingPaymentAddress();
        if (data === null || data === void 0 ? void 0 : data.requestID) {
            if (!this.containsRequestID())
                this.toggleContainsRequestID();
            this.requestID = data.requestID;
        }
        if (data === null || data === void 0 ? void 0 : data.extendedSpendingKey) {
            if (!this.containsExtendedSpendingKey())
                this.toggleContainsExtendedSpendingKey();
            this.extendedSpendingKey = data.extendedSpendingKey;
        }
    }
    containsRequestID() {
        return !!(this.flags.and(AppEncryptionResponseDetails.RESPONSE_CONTAINS_REQUEST_ID).toNumber());
    }
    toggleContainsRequestID() {
        this.flags = this.flags.xor(AppEncryptionResponseDetails.RESPONSE_CONTAINS_REQUEST_ID);
    }
    containsExtendedSpendingKey() {
        return !!(this.flags.and(AppEncryptionResponseDetails.RESPONSE_CONTAINS_EXTENDED_SPENDING_KEY).toNumber());
    }
    toggleContainsExtendedSpendingKey() {
        this.flags = this.flags.xor(AppEncryptionResponseDetails.RESPONSE_CONTAINS_EXTENDED_SPENDING_KEY);
    }
    toSha256() {
        return createHash("sha256").update(this.toBuffer()).digest();
    }
    getByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.flags);
        if (this.containsRequestID()) {
            length += vdxf_1.HASH160_BYTE_LENGTH;
        }
        length += 32; // IncomingViewingKey
        length += this.extendedViewingKey.getByteLength();
        length += this.address.getByteLength();
        if (this.containsExtendedSpendingKey()) {
            length += this.extendedSpendingKey.getByteLength();
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.flags);
        if (this.containsRequestID()) {
            writer.writeSlice((0, address_1.fromBase58Check)(this.requestID).hash);
        }
        writer.writeSlice(this.IncomingViewingKey);
        writer.writeSlice(this.extendedViewingKey.toBuffer());
        writer.writeSlice(this.address.toBuffer());
        if (this.containsExtendedSpendingKey()) {
            writer.writeSlice(this.extendedSpendingKey.toBuffer());
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.flags = reader.readVarInt();
        if (this.containsRequestID()) {
            this.requestID = (0, address_1.toBase58Check)(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH), vdxf_1.I_ADDR_VERSION);
        }
        this.IncomingViewingKey = reader.readSlice(32);
        this.extendedViewingKey = new SaplingExtendedViewingKey_1.SaplingExtendedViewingKey();
        reader.offset = this.extendedViewingKey.fromBuffer(reader.buffer, reader.offset);
        this.address = new pbaas_1.SaplingPaymentAddress();
        reader.offset = this.address.fromBuffer(reader.buffer, reader.offset);
        if (this.containsExtendedSpendingKey()) {
            this.extendedSpendingKey = new SaplingExtendedSpendingKey_1.SaplingExtendedSpendingKey();
            reader.offset = this.extendedSpendingKey.fromBuffer(reader.buffer, reader.offset);
        }
        return reader.offset;
    }
    toJson() {
        return {
            version: this.version.toNumber(),
            flags: this.flags.toNumber(),
            requestid: this.containsRequestID() ? this.requestID : undefined,
            incomingviewingkey: this.IncomingViewingKey.toString('hex'),
            extendedviewingkey: this.extendedViewingKey.toKeyString(),
            address: this.address.toAddressString(),
            extendedspendingkey: this.containsExtendedSpendingKey() ? this.extendedSpendingKey.toKeyString() : undefined
        };
    }
    static fromJson(json) {
        var _a;
        return new AppEncryptionResponseDetails({
            version: new bn_js_1.BN(json.version, 10),
            flags: new bn_js_1.BN((_a = json.flags) !== null && _a !== void 0 ? _a : 0, 10),
            requestID: json.requestid,
            IncomingViewingKey: Buffer.from(json.incomingviewingkey, 'hex'),
            extendedViewingKey: SaplingExtendedViewingKey_1.SaplingExtendedViewingKey.fromKeyString(json.extendedviewingkey),
            address: pbaas_1.SaplingPaymentAddress.fromAddressString(json.address),
            extendedSpendingKey: json.extendedspendingkey ? SaplingExtendedSpendingKey_1.SaplingExtendedSpendingKey.fromKeyString(json.extendedspendingkey) : undefined
        });
    }
}
exports.AppEncryptionResponseDetails = AppEncryptionResponseDetails;
AppEncryptionResponseDetails.RESPONSE_CONTAINS_REQUEST_ID = new bn_js_1.BN(1, 10);
AppEncryptionResponseDetails.RESPONSE_CONTAINS_EXTENDED_SPENDING_KEY = new bn_js_1.BN(2, 10);
