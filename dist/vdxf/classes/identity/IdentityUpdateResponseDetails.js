"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityUpdateResponseDetails = void 0;
const varint_1 = require("../../../utils/varint");
const bufferutils_1 = require("../../../utils/bufferutils");
const createHash = require("create-hash");
const bn_js_1 = require("bn.js");
const pbaas_1 = require("../../../constants/pbaas");
const vdxf_1 = require("../../../constants/vdxf");
const address_1 = require("../../../utils/address");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class IdentityUpdateResponseDetails {
    constructor(data) {
        this.flags = data && data.flags ? data.flags : new bn_js_1.BN("0", 10);
        if (data === null || data === void 0 ? void 0 : data.requestID) {
            if (!this.containsRequestID())
                this.toggleContainsRequestID();
            this.requestID = data.requestID;
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
    containsRequestID() {
        return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_REQUEST_ID).toNumber());
    }
    toggleContainsTxid() {
        this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID);
    }
    toggleContainsRequestID() {
        this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_REQUEST_ID);
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
        if (this.containsTxid()) {
            length += pbaas_1.UINT_256_LENGTH;
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.flags);
        if (this.containsRequestID()) {
            writer.writeSlice((0, address_1.fromBase58Check)(this.requestID).hash);
        }
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
        if (this.containsRequestID()) {
            this.requestID = (0, address_1.toBase58Check)(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH), vdxf_1.I_ADDR_VERSION);
        }
        if (this.containsTxid()) {
            this.txid = reader.readSlice(pbaas_1.UINT_256_LENGTH);
        }
        return reader.offset;
    }
    toJson() {
        return {
            flags: this.flags.toString(10),
            requestid: this.containsRequestID() ? this.requestID : undefined,
            txid: this.containsTxid() ? (Buffer.from(this.txid.toString('hex'), 'hex').reverse()).toString('hex') : undefined
        };
    }
    static fromJson(json) {
        return new IdentityUpdateResponseDetails({
            flags: new bn_js_1.BN(json.flags, 10),
            requestID: json.requestid,
            txid: json.txid ? Buffer.from(json.txid, 'hex').reverse() : undefined
        });
    }
}
exports.IdentityUpdateResponseDetails = IdentityUpdateResponseDetails;
// stored in natural order, if displayed as text make sure to reverse!
IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID = new bn_js_1.BN(1, 10);
IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_REQUEST_ID = new bn_js_1.BN(2, 10);
