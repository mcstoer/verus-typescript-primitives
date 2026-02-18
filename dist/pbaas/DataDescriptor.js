"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EHashTypes = exports.VDXFDataDescriptor = exports.DataDescriptor = void 0;
const bn_js_1 = require("bn.js");
const varint_1 = require("../utils/varint");
const varuint_1 = require("../utils/varuint");
const bufferutils_1 = require("../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const _1 = require(".");
const index_1 = require("../vdxf/index");
const VDXF_Data = require("../vdxf/vdxfdatakeys");
const pbaas_1 = require("../constants/pbaas");
class DataDescriptor {
    constructor(data) {
        this.flags = new bn_js_1.BN(0);
        this.version = DataDescriptor.DEFAULT_VERSION;
        this.objectdata = Buffer.from([]);
        if (data != null) {
            if (data.flags != null)
                this.flags = data.flags;
            if (data.version != null)
                this.version = data.version;
            if (data.objectdata != null)
                this.objectdata = data.objectdata;
            if (data.label != null)
                this.label = data.label;
            if (data.mimeType != null)
                this.mimeType = data.mimeType;
            if (data.salt != null)
                this.salt = data.salt;
            if (data.epk != null)
                this.epk = data.epk;
            if (data.ivk != null)
                this.ivk = data.ivk;
            if (data.ssk != null)
                this.ssk = data.ssk;
            if (this.label && this.label.length > 64) {
                this.label = this.label.slice(0, 64);
            }
            if (this.mimeType && this.mimeType.length > 128) {
                this.mimeType = this.mimeType.slice(0, 128);
            }
            this.setFlags();
        }
    }
    static fromJson(data) {
        const newDataDescriptor = new DataDescriptor();
        if (data != null) {
            if (data.flags != null)
                newDataDescriptor.flags = new bn_js_1.BN(data.flags);
            if (data.version != null)
                newDataDescriptor.version = new bn_js_1.BN(data.version);
            if (data.objectdata != null)
                newDataDescriptor.objectdata = _1.VdxfUniValue.fromJson(data.objectdata).toBuffer();
            if (data.label != null)
                newDataDescriptor.label = data.label;
            if (data.mimetype != null)
                newDataDescriptor.mimeType = data.mimetype;
            if (data.salt != null)
                newDataDescriptor.salt = Buffer.from(data.salt, 'hex');
            if (data.epk != null)
                newDataDescriptor.epk = Buffer.from(data.epk, 'hex');
            if (data.ivk != null)
                newDataDescriptor.ivk = Buffer.from(data.ivk, 'hex');
            if (data.ssk != null)
                newDataDescriptor.ssk = Buffer.from(data.ssk, 'hex');
            if (newDataDescriptor.label && newDataDescriptor.label.length > 64) {
                newDataDescriptor.label = newDataDescriptor.label.slice(0, 64);
            }
            if (newDataDescriptor.mimeType && newDataDescriptor.mimeType.length > 128) {
                newDataDescriptor.mimeType = newDataDescriptor.mimeType.slice(0, 128);
            }
        }
        ;
        newDataDescriptor.setFlags();
        return newDataDescriptor;
    }
    decodeHashVector() {
        const vdxfData = new index_1.BufferDataVdxfObject();
        vdxfData.fromBuffer(this.objectdata);
        const hashes = [];
        if (vdxfData.vdxfkey == VDXF_Data.VectorUint256Key.vdxfid) {
            const reader = new BufferReader(Buffer.from(vdxfData.data, 'hex'));
            const count = reader.readVarInt();
            for (let i = 0; i < count.toNumber(); i++) {
                hashes.push(reader.readSlice(32));
            }
        }
        return hashes;
    }
    getByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.version);
        length += varint_1.default.encodingLength(this.flags);
        length += varuint_1.default.encodingLength(this.objectdata.length);
        length += this.objectdata.length;
        if (this.hasLabel()) {
            if (this.label.length > 64) {
                throw new Error("Label too long");
            }
            length += varuint_1.default.encodingLength(this.label.length);
            length += this.label.length;
        }
        if (this.hasMIME()) {
            if (this.mimeType.length > 128) {
                throw new Error("MIME type too long");
            }
            length += varuint_1.default.encodingLength(this.mimeType.length);
            length += this.mimeType.length;
        }
        if (this.hasSalt()) {
            length += varuint_1.default.encodingLength(this.salt.length);
            length += this.salt.length;
        }
        if (this.hasEPK()) {
            length += varuint_1.default.encodingLength(this.epk.length);
            length += this.epk.length;
        }
        if (this.hasIVK()) {
            length += varuint_1.default.encodingLength(this.ivk.length);
            length += this.ivk.length;
        }
        if (this.hasSSK()) {
            length += varuint_1.default.encodingLength(this.ssk.length);
            length += this.ssk.length;
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.version);
        writer.writeVarInt(this.flags);
        writer.writeVarSlice(this.objectdata);
        if (this.hasLabel()) {
            writer.writeVarSlice(Buffer.from(this.label));
        }
        if (this.hasMIME()) {
            writer.writeVarSlice(Buffer.from(this.mimeType));
        }
        if (this.hasSalt()) {
            writer.writeVarSlice(this.salt);
        }
        if (this.hasEPK()) {
            writer.writeVarSlice(this.epk);
        }
        if (this.hasIVK()) {
            writer.writeVarSlice(this.ivk);
        }
        if (this.hasSSK()) {
            writer.writeVarSlice(this.ssk);
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.version = reader.readVarInt();
        this.flags = reader.readVarInt();
        this.objectdata = reader.readVarSlice();
        if (this.hasLabel()) {
            this.label = reader.readVarSlice().toString();
        }
        if (this.hasMIME()) {
            this.mimeType = reader.readVarSlice().toString();
        }
        if (this.hasSalt()) {
            this.salt = reader.readVarSlice();
        }
        if (this.hasEPK()) {
            this.epk = reader.readVarSlice();
        }
        if (this.hasIVK()) {
            this.ivk = reader.readVarSlice();
        }
        if (this.hasSSK()) {
            this.ssk = reader.readVarSlice();
        }
        return reader.offset;
    }
    hasEncryptedData() {
        return this.flags.and(DataDescriptor.FLAG_ENCRYPTED_DATA).gt(new bn_js_1.BN(0));
    }
    hasSalt() {
        return this.flags.and(DataDescriptor.FLAG_SALT_PRESENT).gt(new bn_js_1.BN(0));
    }
    hasEPK() {
        return this.flags.and(DataDescriptor.FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT).gt(new bn_js_1.BN(0));
    }
    hasMIME() {
        return this.flags.and(DataDescriptor.FLAG_MIME_TYPE_PRESENT).gt(new bn_js_1.BN(0));
    }
    hasIVK() {
        return this.flags.and(DataDescriptor.FLAG_INCOMING_VIEWING_KEY_PRESENT).gt(new bn_js_1.BN(0));
    }
    hasSSK() {
        return this.flags.and(DataDescriptor.FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT).gt(new bn_js_1.BN(0));
    }
    hasLabel() {
        return this.flags.and(DataDescriptor.FLAG_LABEL_PRESENT).gt(new bn_js_1.BN(0));
    }
    calcFlags() {
        return this.flags.and(DataDescriptor.FLAG_ENCRYPTED_DATA).add(this.label ? DataDescriptor.FLAG_LABEL_PRESENT : new bn_js_1.BN(0)).add(this.mimeType ? DataDescriptor.FLAG_MIME_TYPE_PRESENT : new bn_js_1.BN(0)).add(this.salt ? DataDescriptor.FLAG_SALT_PRESENT : new bn_js_1.BN(0)).add(this.epk ? DataDescriptor.FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT : new bn_js_1.BN(0)).add(this.ivk ? DataDescriptor.FLAG_INCOMING_VIEWING_KEY_PRESENT : new bn_js_1.BN(0)).add(this.ssk ? DataDescriptor.FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT : new bn_js_1.BN(0));
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    isValid() {
        return !!(this.version.gte(DataDescriptor.FIRST_VERSION) && this.version.lte(DataDescriptor.LAST_VERSION) && this.flags.and(DataDescriptor.FLAG_MASK.notn(DataDescriptor.FLAG_MASK.bitLength())));
    }
    toJson() {
        var _a;
        const retval = {
            version: this.version.toNumber(),
            flags: this.flags.toNumber()
        };
        let isText = false;
        if (this.mimeType) {
            retval['mimetype'] = this.mimeType;
            if (this.mimeType.startsWith("text/"))
                isText = true;
        }
        let processedObject = new _1.VdxfUniValue();
        processedObject.fromBuffer(this.objectdata);
        if ((_a = processedObject.values[0]) === null || _a === void 0 ? void 0 : _a[""]) {
            const keys = Object.keys(processedObject.values[0]);
            const values = Object.values(processedObject.values[0]);
            if (isText && Buffer.isBuffer(values[0]) && keys[0] === "") {
                const objectDataUni = { message: '' };
                objectDataUni.message = values[0].toString('utf8');
                retval['objectdata'] = objectDataUni;
            }
            else if (Buffer.isBuffer(values[0])) {
                retval['objectdata'] = values[0].toString('hex');
            }
        }
        else {
            retval['objectdata'] = processedObject.toJson();
        }
        if (this.label)
            retval['label'] = this.label;
        if (this.salt)
            retval['salt'] = this.salt.toString('hex');
        if (this.epk)
            retval['epk'] = this.epk.toString('hex');
        if (this.ivk)
            retval['ivk'] = this.ivk.toString('hex');
        if (this.ssk)
            retval['ssk'] = this.ssk.toString('hex');
        return retval;
    }
}
exports.DataDescriptor = DataDescriptor;
DataDescriptor.VERSION_INVALID = new bn_js_1.BN(0);
DataDescriptor.VERSION_FIRST = new bn_js_1.BN(1);
DataDescriptor.FIRST_VERSION = new bn_js_1.BN(1);
DataDescriptor.LAST_VERSION = new bn_js_1.BN(1);
DataDescriptor.DEFAULT_VERSION = new bn_js_1.BN(1);
DataDescriptor.FLAG_ENCRYPTED_DATA = new bn_js_1.BN(1);
DataDescriptor.FLAG_SALT_PRESENT = new bn_js_1.BN(2);
DataDescriptor.FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT = new bn_js_1.BN(4);
DataDescriptor.FLAG_INCOMING_VIEWING_KEY_PRESENT = new bn_js_1.BN(8);
DataDescriptor.FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT = new bn_js_1.BN(0x10);
DataDescriptor.FLAG_LABEL_PRESENT = new bn_js_1.BN(0x20);
DataDescriptor.FLAG_MIME_TYPE_PRESENT = new bn_js_1.BN(0x40);
DataDescriptor.FLAG_MASK = (DataDescriptor.FLAG_ENCRYPTED_DATA.add(DataDescriptor.FLAG_SALT_PRESENT).add(DataDescriptor.FLAG_ENCRYPTION_PUBLIC_KEY_PRESENT).add(DataDescriptor.FLAG_INCOMING_VIEWING_KEY_PRESENT).add(DataDescriptor.FLAG_SYMMETRIC_ENCRYPTION_KEY_PRESENT).add(DataDescriptor.FLAG_LABEL_PRESENT).add(DataDescriptor.FLAG_MIME_TYPE_PRESENT));
;
class VDXFDataDescriptor extends index_1.BufferDataVdxfObject {
    constructor(dataDescriptor, vdxfkey = "", version = new bn_js_1.BN(1)) {
        super("", vdxfkey);
        this.version = version;
        if (dataDescriptor) {
            this.dataDescriptor = dataDescriptor;
        }
    }
    static fromDataVdxfObject(data) {
        const retval = new VDXFDataDescriptor();
        retval.version = data.version;
        retval.data = data.data;
        retval.fromBuffer(Buffer.from(retval.data, 'hex'));
        delete retval.data;
        return retval;
    }
    dataByteLength() {
        let length = 0;
        length += this.dataDescriptor.getByteLength();
        return length;
    }
    toDataBuffer() {
        return this.dataDescriptor.toBuffer();
    }
    fromDataBuffer(buffer, offset) {
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        this.data = reader.readVarSlice().toString('hex');
        this.dataDescriptor = new DataDescriptor();
        this.dataDescriptor.fromBuffer(Buffer.from(this.data, 'hex'), reader.offset);
        delete this.data;
        return reader.offset;
    }
    hasEncryptedData() {
        return this.dataDescriptor.hasEncryptedData();
    }
    hasLabel() {
        return this.dataDescriptor.hasLabel();
    }
    hasSalt() {
        return this.dataDescriptor.hasSalt();
    }
    hasEPK() {
        return this.dataDescriptor.hasEPK();
    }
    hasIVK() {
        return this.dataDescriptor.hasIVK();
    }
    hasSSK() {
        return this.dataDescriptor.hasSSK();
    }
    calcFlags() {
        return this.dataDescriptor.calcFlags();
    }
    setFlags() {
        return this.dataDescriptor.setFlags();
    }
}
exports.VDXFDataDescriptor = VDXFDataDescriptor;
;
var EHashTypes;
(function (EHashTypes) {
    EHashTypes[EHashTypes["HASH_INVALID"] = pbaas_1.HASH_TYPE_INVALID.toNumber()] = "HASH_INVALID";
    EHashTypes[EHashTypes["HASH_BLAKE2BMMR"] = pbaas_1.HASH_TYPE_BLAKE2B.toNumber()] = "HASH_BLAKE2BMMR";
    EHashTypes[EHashTypes["HASH_BLAKE2BMMR2"] = pbaas_1.HASH_TYPE_BLAKE2BMMR2.toNumber()] = "HASH_BLAKE2BMMR2";
    EHashTypes[EHashTypes["HASH_KECCAK"] = pbaas_1.HASH_TYPE_KECCAK256.toNumber()] = "HASH_KECCAK";
    EHashTypes[EHashTypes["HASH_SHA256D"] = pbaas_1.HASH_TYPE_SHA256D.toNumber()] = "HASH_SHA256D";
    EHashTypes[EHashTypes["HASH_SHA256"] = pbaas_1.HASH_TYPE_SHA256.toNumber()] = "HASH_SHA256";
    EHashTypes[EHashTypes["HASH_LASTTYPE"] = pbaas_1.HASH_TYPE_SHA256.toNumber()] = "HASH_LASTTYPE";
})(EHashTypes || (exports.EHashTypes = EHashTypes = {}));
;
