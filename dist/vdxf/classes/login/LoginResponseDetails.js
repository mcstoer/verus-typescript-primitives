"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponseDetails = void 0;
const varint_1 = require("../../../utils/varint");
const bufferutils_1 = require("../../../utils/bufferutils");
const createHash = require("create-hash");
const bn_js_1 = require("bn.js");
const address_1 = require("../../../utils/address");
const vdxf_1 = require("../../../constants/vdxf");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class LoginResponseDetails {
    constructor(data) {
        this.flags = data && data.flags ? data.flags : new bn_js_1.BN("0", 10);
        if (data === null || data === void 0 ? void 0 : data.requestID) {
            this.requestID = data.requestID;
        }
        else
            this.requestID = '';
    }
    toSha256() {
        return createHash("sha256").update(this.toBuffer()).digest();
    }
    getByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.flags);
        length += vdxf_1.HASH160_BYTE_LENGTH;
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.flags);
        writer.writeSlice((0, address_1.fromBase58Check)(this.requestID).hash);
        return writer.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.flags = reader.readVarInt();
        this.requestID = (0, address_1.toBase58Check)(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH), vdxf_1.I_ADDR_VERSION);
        return reader.offset;
    }
    toJson() {
        return {
            flags: this.flags.toString(10),
            requestid: this.requestID,
        };
    }
    static fromJson(json) {
        return new LoginResponseDetails({
            flags: new bn_js_1.BN(json.flags, 10),
            requestID: json.requestid
        });
    }
}
exports.LoginResponseDetails = LoginResponseDetails;
