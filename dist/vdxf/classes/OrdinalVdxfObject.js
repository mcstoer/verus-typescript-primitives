"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerusPayInvoiceOrdinalVdxfObject = exports.DataDescriptorOrdinalVdxfObject = exports.SerializableEntityOrdinalVdxfObject = exports.GeneralTypeOrdinalVdxfObject = exports.OrdinalVdxfObject = void 0;
const bufferutils_1 = require("../../utils/bufferutils");
const bn_js_1 = require("bn.js");
const varuint_1 = require("../../utils/varuint");
const address_1 = require("../../utils/address");
const varint_1 = require("../../utils/varint");
const vdxf_1 = require("../../constants/vdxf");
const pbaas_1 = require("../../pbaas");
const VerusPayInvoiceDetails_1 = require("./payment/VerusPayInvoiceDetails");
const OrdinalVdxfObjectOrdinalMap_1 = require("./OrdinalVdxfObjectOrdinalMap");
const pbaas_2 = require("../../constants/pbaas");
const helpers_1 = require("../../constants/ordinals/helpers");
const ordinals_1 = require("../../constants/ordinals/ordinals");
class OrdinalVdxfObject {
    constructor(request = {
        type: ordinals_1.VDXF_ORDINAL_DATA_DESCRIPTOR
    }) {
        if (request.key) {
            this.type = OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR;
            this.key = request.key;
            if (request.data) {
                this.data = request.data;
            }
            else
                this.data = Buffer.alloc(0);
        }
        else if (request.type == null) {
            this.type = ordinals_1.VDXF_ORDINAL_DATA_DESCRIPTOR;
        }
        else {
            this.type = request.type;
        }
        if (request.version)
            this.version = request.version;
        else
            this.version = OrdinalVdxfObject.VERSION_CURRENT;
    }
    isDefinedByVdxfKey() {
        return this.type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR);
    }
    isDefinedByTextVdxfKey() {
        return this.type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_VDXF_ID_STRING);
    }
    isDefinedByCurrencyOrId() {
        return this.type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_ID_OR_CURRENCY);
    }
    isDefinedByCustomKey() {
        return this.isDefinedByCurrencyOrId() || this.isDefinedByTextVdxfKey() || this.isDefinedByVdxfKey();
    }
    getDataByteLength() {
        return 0;
    }
    toDataBuffer() {
        return Buffer.alloc(0);
    }
    fromDataBuffer(buffer) { }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.type.toNumber());
        if (this.isDefinedByVdxfKey()) {
            length += (0, address_1.fromBase58Check)(this.key).hash.length;
        }
        else if (this.isDefinedByTextVdxfKey() || this.isDefinedByCurrencyOrId()) {
            const utf8Key = Buffer.from(this.key, 'utf8');
            length += varuint_1.default.encodingLength(utf8Key.length);
            length += utf8Key.length;
        }
        length += varint_1.default.encodingLength(this.version);
        const dataLength = this.getDataByteLength();
        length += varuint_1.default.encodingLength(dataLength);
        length += dataLength;
        return length;
    }
    toBuffer() {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeCompactSize(this.type.toNumber());
        if (this.isDefinedByVdxfKey()) {
            writer.writeSlice((0, address_1.fromBase58Check)(this.key).hash);
        }
        else if (this.isDefinedByTextVdxfKey() || this.isDefinedByCurrencyOrId()) {
            writer.writeVarSlice(Buffer.from(this.key, 'utf8'));
        }
        writer.writeVarInt(this.version);
        writer.writeVarSlice(this.toDataBuffer());
        return writer.buffer;
    }
    fromBufferOptionalType(buffer, offset, type, key) {
        if (buffer.length == 0)
            throw new Error("Cannot create request from empty buffer");
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        if (!type) {
            this.type = new bn_js_1.BN(reader.readCompactSize());
        }
        else
            this.type = type;
        if (!key) {
            if (this.isDefinedByVdxfKey()) {
                this.key = (0, address_1.toBase58Check)(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH), vdxf_1.I_ADDR_VERSION);
            }
            else if (this.isDefinedByTextVdxfKey() || this.isDefinedByCurrencyOrId()) {
                this.key = reader.readVarSlice().toString('utf8');
            }
        }
        else {
            this.key = key;
        }
        this.version = reader.readVarInt();
        const dataBuf = reader.readVarSlice();
        this.fromDataBuffer(dataBuf);
        return reader.offset;
    }
    fromBuffer(buffer, offset) {
        return this.fromBufferOptionalType(buffer, offset);
    }
    toJson() {
        return {
            type: this.type ? this.type.toString() : undefined,
            version: this.version ? this.version.toString() : undefined,
            vdxfkey: this.key,
            data: this.data ? this.isDefinedByCustomKey() ? this.data.toString('hex') : this.data.toJson() : undefined
        };
    }
    static createFromBuffer(buffer, offset, optimizeWithOrdinal = false, rootSystemName = pbaas_2.DEFAULT_VERUS_CHAINNAME) {
        (0, helpers_1.registerOrdinals)();
        if (buffer.length == 0)
            throw new Error("Cannot create request from empty buffer");
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        let type = new bn_js_1.BN(reader.readCompactSize());
        const rootSystemId = (0, address_1.toIAddress)(rootSystemName);
        const Entity = (0, helpers_1.getOrdinalVdxfObjectClassForType)(type);
        const ord = new Entity({ type });
        let key;
        if (optimizeWithOrdinal) {
            let vdxfKey;
            if (ord.isDefinedByVdxfKey()) {
                key = (0, address_1.toBase58Check)(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH), vdxf_1.I_ADDR_VERSION);
                vdxfKey = key;
            }
            else if (ord.isDefinedByTextVdxfKey() || ord.isDefinedByCurrencyOrId()) {
                key = reader.readVarSlice().toString('utf8');
                if (ord.isDefinedByTextVdxfKey()) {
                    vdxfKey = (0, address_1.getDataKey)(key, undefined, rootSystemId).id;
                }
                else {
                    vdxfKey = (0, address_1.toIAddress)(key, rootSystemName);
                }
            }
            if (OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.vdxfKeyHasOrdinal(vdxfKey)) {
                type = new bn_js_1.BN(OrdinalVdxfObjectOrdinalMap_1.OrdinalVdxfObjectOrdinalMap.getOrdinalForVdxfKey(vdxfKey));
            }
        }
        reader.offset = ord.fromBufferOptionalType(buffer, reader.offset, type, key);
        return { offset: reader.offset, obj: ord };
    }
}
exports.OrdinalVdxfObject = OrdinalVdxfObject;
OrdinalVdxfObject.VERSION_INVALID = new bn_js_1.BN(0, 10);
OrdinalVdxfObject.VERSION_FIRST = new bn_js_1.BN(1, 10);
OrdinalVdxfObject.VERSION_LAST = new bn_js_1.BN(1, 10);
OrdinalVdxfObject.VERSION_CURRENT = new bn_js_1.BN(1, 10);
OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR = new bn_js_1.BN(102, 10);
OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_VDXF_ID_STRING = new bn_js_1.BN(103, 10);
OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_ID_OR_CURRENCY = new bn_js_1.BN(104, 10);
class GeneralTypeOrdinalVdxfObject extends OrdinalVdxfObject {
    constructor(request = {
        type: OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR,
        data: Buffer.alloc(0),
        key: vdxf_1.NULL_ADDRESS
    }) {
        super({
            type: request.type,
            data: request.data,
            key: request.key
        });
    }
    getDataByteLength() {
        return this.data.length;
    }
    toDataBuffer() {
        return this.data;
    }
    fromDataBuffer(buffer) {
        this.data = Buffer.from(buffer);
    }
    static fromJson(details) {
        return new GeneralTypeOrdinalVdxfObject({
            key: details.vdxfkey,
            data: details.data ? Buffer.from(details.data, 'hex') : undefined
        });
    }
}
exports.GeneralTypeOrdinalVdxfObject = GeneralTypeOrdinalVdxfObject;
class SerializableEntityOrdinalVdxfObject extends OrdinalVdxfObject {
    constructor(request, entity) {
        if (!request || !request.type)
            throw new Error("Expected request with data and type");
        super({
            type: request.type
        });
        this.entity = entity;
        this.data = request.data ? request.data : new entity();
    }
    getDataByteLength() {
        return this.data.getByteLength();
    }
    toDataBuffer() {
        return this.data.toBuffer();
    }
    fromDataBuffer(buffer) {
        this.data = new this.entity();
        this.data.fromBuffer(buffer);
    }
}
exports.SerializableEntityOrdinalVdxfObject = SerializableEntityOrdinalVdxfObject;
class DataDescriptorOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new pbaas_1.DataDescriptor()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_DATA_DESCRIPTOR,
            data: request.data
        }, pbaas_1.DataDescriptor);
    }
    static fromJson(details) {
        return new DataDescriptorOrdinalVdxfObject({
            data: pbaas_1.DataDescriptor.fromJson(details.data)
        });
    }
}
exports.DataDescriptorOrdinalVdxfObject = DataDescriptorOrdinalVdxfObject;
class VerusPayInvoiceOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new VerusPayInvoiceDetails_1.VerusPayInvoiceDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_VERUSPAY_INVOICE,
            data: request.data
        }, VerusPayInvoiceDetails_1.VerusPayInvoiceDetails);
    }
    static fromJson(details) {
        return new VerusPayInvoiceOrdinalVdxfObject({
            data: VerusPayInvoiceDetails_1.VerusPayInvoiceDetails.fromJson(details.data)
        });
    }
}
exports.VerusPayInvoiceOrdinalVdxfObject = VerusPayInvoiceOrdinalVdxfObject;
