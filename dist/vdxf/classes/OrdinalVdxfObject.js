"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerusPayInvoiceOrdinalVdxfObject = exports.DataDescriptorOrdinalVdxfObject = exports.SerializableEntityOrdinalVdxfObject = exports.GeneralTypeOrdinalVdxfObject = exports.OrdinalVdxfObject = exports.getOrdinalVdxfObjectClassForType = void 0;
const bufferutils_1 = require("../../utils/bufferutils");
const bn_js_1 = require("bn.js");
const varuint_1 = require("../../utils/varuint");
const address_1 = require("../../utils/address");
const varint_1 = require("../../utils/varint");
const vdxf_1 = require("../../constants/vdxf");
const pbaas_1 = require("../../pbaas");
const VerusPayInvoiceDetails_1 = require("./payment/VerusPayInvoiceDetails");
const getOrdinalVdxfObjectClassForType = (type) => {
    if (type.eq(OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR))
        return DataDescriptorOrdinalVdxfObject;
    else if (type.eq(OrdinalVdxfObject.TYPE_INVOICE))
        return VerusPayInvoiceOrdinalVdxfObject;
    else if (type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE))
        return GeneralTypeOrdinalVdxfObject;
    else
        throw new Error("Unrecognized vdxf ordinal object type");
};
exports.getOrdinalVdxfObjectClassForType = getOrdinalVdxfObjectClassForType;
class OrdinalVdxfObject {
    constructor(request = {
        type: OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR
    }) {
        if (request.vdxfkey) {
            this.type = OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE;
            this.vdxfkey = request.vdxfkey;
            if (request.data) {
                this.data = request.data;
            }
            else
                this.data = Buffer.alloc(0);
        }
        else if (request.type == null) {
            this.type = OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR;
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
        return this.type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE);
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
            length += (0, address_1.fromBase58Check)(this.vdxfkey).hash.length;
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
            writer.writeSlice((0, address_1.fromBase58Check)(this.vdxfkey).hash);
        }
        writer.writeVarInt(this.version);
        writer.writeVarSlice(this.toDataBuffer());
        return writer.buffer;
    }
    fromBufferOptionalType(buffer, offset, type) {
        if (buffer.length == 0)
            throw new Error("Cannot create request from empty buffer");
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        if (!type) {
            this.type = new bn_js_1.BN(reader.readCompactSize());
        }
        else
            this.type = type;
        if (this.isDefinedByVdxfKey()) {
            this.vdxfkey = (0, address_1.toBase58Check)(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH), vdxf_1.I_ADDR_VERSION);
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
            vdxfkey: this.vdxfkey,
            data: this.data ? this.isDefinedByVdxfKey() ? this.data.toString('hex') : this.data.toJson() : undefined
        };
    }
    static createFromBuffer(buffer, offset) {
        if (buffer.length == 0)
            throw new Error("Cannot create request from empty buffer");
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        const type = new bn_js_1.BN(reader.readCompactSize());
        const Entity = (0, exports.getOrdinalVdxfObjectClassForType)(type);
        const ord = new Entity();
        ord.fromBufferOptionalType(buffer, reader.offset, type);
        return { offset, obj: ord };
    }
}
exports.OrdinalVdxfObject = OrdinalVdxfObject;
OrdinalVdxfObject.VERSION_INVALID = new bn_js_1.BN(0, 10);
OrdinalVdxfObject.VERSION_FIRST = new bn_js_1.BN(1, 10);
OrdinalVdxfObject.VERSION_LAST = new bn_js_1.BN(1, 10);
OrdinalVdxfObject.VERSION_CURRENT = new bn_js_1.BN(1, 10);
OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR = new bn_js_1.BN(0, 10);
OrdinalVdxfObject.TYPE_INVOICE = new bn_js_1.BN(1, 10);
OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE = new bn_js_1.BN(102, 10);
class GeneralTypeOrdinalVdxfObject extends OrdinalVdxfObject {
    constructor(request = {
        data: Buffer.alloc(0),
        vdxfkey: vdxf_1.NULL_ADDRESS
    }) {
        super({
            type: OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE,
            data: request.data,
            vdxfkey: request.vdxfkey
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
            vdxfkey: details.vdxfkey,
            data: details.data ? Buffer.from(details.data, 'hex') : undefined
        });
    }
}
exports.GeneralTypeOrdinalVdxfObject = GeneralTypeOrdinalVdxfObject;
class SerializableEntityOrdinalVdxfObject extends OrdinalVdxfObject {
    constructor(request, entity) {
        if (!request || !request.type || !request.data)
            throw new Error("Expected request with data and type");
        super({
            type: request.type
        });
        this.entity = entity;
        this.data = request.data;
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
            type: OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR,
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
            type: OrdinalVdxfObject.TYPE_INVOICE,
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
