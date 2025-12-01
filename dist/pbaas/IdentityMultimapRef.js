"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityMultimapRef = void 0;
const varint_1 = require("../utils/varint");
const address_1 = require("../utils/address");
const bufferutils_1 = require("../utils/bufferutils");
const bn_js_1 = require("bn.js");
const vdxf_1 = require("../constants/vdxf");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class IdentityMultimapRef {
    constructor(data) {
        if (data) {
            this.version = data.version || IdentityMultimapRef.CURRENT_VERSION;
            this.flags = data.flags || new bn_js_1.BN(0);
            this.id_ID = data.id_ID || "";
            this.key = data.key || "";
            this.height_start = data.height_start || new bn_js_1.BN(0);
            this.height_end = data.height_end || new bn_js_1.BN(0);
            this.data_hash = data.data_hash || Buffer.alloc(0);
            this.system_id = data.system_id || "";
        }
    }
    setFlags() {
        this.flags = this.flags.and(IdentityMultimapRef.FLAG_NO_DELETION);
        if (this.data_hash && this.data_hash.length > 0) {
            this.flags = this.flags.or(IdentityMultimapRef.FLAG_HAS_DATAHASH);
        }
        if (this.system_id && this.system_id.length > 0) {
            this.flags = this.flags.or(IdentityMultimapRef.FLAG_HAS_SYSTEM);
        }
    }
    getByteLength() {
        let byteLength = 0;
        this.setFlags();
        byteLength += varint_1.default.encodingLength(this.version);
        byteLength += varint_1.default.encodingLength(this.flags);
        byteLength += vdxf_1.HASH160_BYTE_LENGTH; // id_ID
        byteLength += vdxf_1.HASH160_BYTE_LENGTH; // vdxfkey 
        byteLength += varint_1.default.encodingLength(this.height_start); // height_start uint32
        byteLength += varint_1.default.encodingLength(this.height_end); // height_end uint32
        if (this.flags.and(IdentityMultimapRef.FLAG_HAS_DATAHASH).gt(new bn_js_1.BN(0))) {
            byteLength += vdxf_1.HASH256_BYTE_LENGTH;
        }
        if (this.flags.and(IdentityMultimapRef.FLAG_HAS_SYSTEM).gt(new bn_js_1.BN(0))) {
            byteLength += vdxf_1.HASH160_BYTE_LENGTH;
        }
        return byteLength;
    }
    toBuffer() {
        const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()));
        bufferWriter.writeVarInt(this.version);
        bufferWriter.writeVarInt(this.flags);
        bufferWriter.writeSlice((0, address_1.fromBase58Check)(this.id_ID).hash);
        bufferWriter.writeSlice((0, address_1.fromBase58Check)(this.key).hash);
        bufferWriter.writeVarInt(this.height_start);
        bufferWriter.writeVarInt(this.height_end);
        if (this.flags.and(IdentityMultimapRef.FLAG_HAS_DATAHASH).gt(new bn_js_1.BN(0))) {
            bufferWriter.writeSlice(this.data_hash);
        }
        if (this.flags.and(IdentityMultimapRef.FLAG_HAS_SYSTEM).gt(new bn_js_1.BN(0))) {
            bufferWriter.writeSlice((0, address_1.fromBase58Check)(this.system_id).hash);
        }
        return bufferWriter.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.version = reader.readVarInt();
        this.flags = reader.readVarInt();
        this.id_ID = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        this.key = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        this.height_start = reader.readVarInt();
        this.height_end = reader.readVarInt();
        if (this.flags.and(IdentityMultimapRef.FLAG_HAS_DATAHASH).gt(new bn_js_1.BN(0))) {
            this.data_hash = reader.readSlice(32);
        }
        if (this.flags.and(IdentityMultimapRef.FLAG_HAS_SYSTEM).gt(new bn_js_1.BN(0))) {
            this.system_id = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        }
        return reader.offset;
    }
    isValid() {
        return this.version.gte(IdentityMultimapRef.FIRST_VERSION) &&
            this.version.lte(IdentityMultimapRef.LAST_VERSION) &&
            this.flags.and(IdentityMultimapRef.FLAG_HAS_DATAHASH.add(IdentityMultimapRef.FLAG_HAS_SYSTEM)).eq(IdentityMultimapRef.FLAG_HAS_DATAHASH.add(IdentityMultimapRef.FLAG_HAS_SYSTEM)) &&
            !(!this.id_ID || this.id_ID.length === 0) && !(!this.key || this.key.length === 0);
    }
    hasDataHash() {
        return this.flags.and(IdentityMultimapRef.FLAG_HAS_DATAHASH).gt(new bn_js_1.BN(0));
    }
    hasSystemID() {
        return this.flags.and(IdentityMultimapRef.FLAG_HAS_SYSTEM).gt(new bn_js_1.BN(0));
    }
    toJson() {
        let retval = {
            version: this.version.toNumber(),
            flags: this.flags.toNumber(),
            vdxfkey: this.key,
            startheight: this.height_start.toNumber(),
            endheight: this.height_end.toNumber(),
            identityid: this.id_ID
        };
        if (this.hasDataHash()) {
            retval.datahash = Buffer.from(this.data_hash).reverse().toString('hex');
        }
        if (this.hasSystemID()) {
            retval.systemid = this.system_id;
        }
        return retval;
    }
    static fromJson(data) {
        return new IdentityMultimapRef({
            version: new bn_js_1.BN(data.version),
            flags: new bn_js_1.BN(data.flags),
            key: data.vdxfkey,
            id_ID: data.identityid,
            height_start: new bn_js_1.BN(data.startheight),
            height_end: new bn_js_1.BN(data.endheight),
            data_hash: Buffer.from(data.datahash, 'hex').reverse(),
            system_id: data.systemid
        });
    }
}
exports.IdentityMultimapRef = IdentityMultimapRef;
IdentityMultimapRef.FLAG_NO_DELETION = new bn_js_1.BN(1);
IdentityMultimapRef.FLAG_HAS_DATAHASH = new bn_js_1.BN(2);
IdentityMultimapRef.FLAG_HAS_SYSTEM = new bn_js_1.BN(4);
IdentityMultimapRef.FIRST_VERSION = new bn_js_1.BN(1);
IdentityMultimapRef.LAST_VERSION = new bn_js_1.BN(1);
IdentityMultimapRef.CURRENT_VERSION = new bn_js_1.BN(1);
