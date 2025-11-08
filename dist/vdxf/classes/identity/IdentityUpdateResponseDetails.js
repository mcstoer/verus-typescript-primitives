"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityUpdateResponseDetails = void 0;
const varint_1 = require("../../../utils/varint");
const bufferutils_1 = require("../../../utils/bufferutils");
const createHash = require("create-hash");
const bn_js_1 = require("bn.js");
const pbaas_1 = require("../../../constants/pbaas");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class IdentityUpdateResponseDetails {
    constructor(data) {
        this.flags = data && data.flags ? data.flags : new bn_js_1.BN("0", 10);
        if (data === null || data === void 0 ? void 0 : data.requestID) {
            this.requestID = data.requestID;
        }
        else
            this.requestID = new bn_js_1.BN("0", 10);
        if (data === null || data === void 0 ? void 0 : data.createdAt) {
            this.createdAt = data.createdAt;
        }
        if (data === null || data === void 0 ? void 0 : data.txid) {
            if (!this.containsTxid())
                this.toggleContainsTxid();
            this.txid = data.txid;
        }
    }
    containsTxid() {
        return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID).toNumber());
    }
    toggleContainsTxid() {
        this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID);
    }
    toSha256() {
        return createHash("sha256").update(this.toBuffer()).digest();
    }
    getByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.flags);
        length += varint_1.default.encodingLength(this.requestID);
        length += varint_1.default.encodingLength(this.createdAt);
        if (this.containsTxid()) {
            length += pbaas_1.UINT_256_LENGTH;
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.flags);
        writer.writeVarInt(this.requestID);
        writer.writeVarInt(this.createdAt);
        if (this.containsTxid()) {
            if (this.txid.length !== pbaas_1.UINT_256_LENGTH)
                throw new Error("invalid txid length");
            writer.writeSlice(this.txid);
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.flags = reader.readVarInt();
        this.requestID = reader.readVarInt();
        this.createdAt = reader.readVarInt();
        if (this.containsTxid()) {
            this.txid = reader.readSlice(pbaas_1.UINT_256_LENGTH);
        }
        return reader.offset;
    }
    toJson() {
        return {
            flags: this.flags.toString(10),
            requestid: this.requestID.toString(10),
            createdat: this.createdAt.toString(10),
            txid: this.containsTxid() ? (Buffer.from(this.txid.toString('hex'), 'hex').reverse()).toString('hex') : undefined
        };
    }
    static fromJson(json) {
        return new IdentityUpdateResponseDetails({
            flags: new bn_js_1.BN(json.flags, 10),
            requestID: new bn_js_1.BN(json.requestid, 10),
            createdAt: new bn_js_1.BN(json.createdat, 10),
            txid: json.txid ? Buffer.from(json.txid, 'hex').reverse() : undefined
        });
    }
}
exports.IdentityUpdateResponseDetails = IdentityUpdateResponseDetails;
// stored in natural order, if displayed as text make sure to reverse!
IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_VALID = new bn_js_1.BN(0, 10);
IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID = new bn_js_1.BN(1, 10);
