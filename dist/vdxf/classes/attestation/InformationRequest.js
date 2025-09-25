"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestInformation = exports.RequestItem = exports.InformationType = exports.RequestedFormatFlags = void 0;
const bn_js_1 = require("bn.js");
const varint_1 = require("../../../utils/varint");
const varuint_1 = require("../../../utils/varuint");
const bufferutils_1 = require("../../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
var RequestedFormatFlags;
(function (RequestedFormatFlags) {
    RequestedFormatFlags[RequestedFormatFlags["FULL_DATA"] = 1] = "FULL_DATA";
    RequestedFormatFlags[RequestedFormatFlags["PARTIAL_DATA"] = 2] = "PARTIAL_DATA";
    RequestedFormatFlags[RequestedFormatFlags["COLLECTION"] = 4] = "COLLECTION"; // Multiple FULL_DATA only
})(RequestedFormatFlags || (exports.RequestedFormatFlags = RequestedFormatFlags = {}));
var InformationType;
(function (InformationType) {
    InformationType[InformationType["ATTESTATION"] = 1] = "ATTESTATION";
    InformationType[InformationType["CLAIM"] = 2] = "CLAIM";
    InformationType[InformationType["CREDENTIAL"] = 3] = "CREDENTIAL";
})(InformationType || (exports.InformationType = InformationType = {}));
class RequestItem {
    constructor(json) {
        this.version = (json === null || json === void 0 ? void 0 : json.version) || RequestItem.DEFAULT_VERSION;
        this.format = (json === null || json === void 0 ? void 0 : json.format) || RequestItem.FULL_DATA;
        this.type = (json === null || json === void 0 ? void 0 : json.type) || RequestItem.ATTESTATION;
        this.id = (json === null || json === void 0 ? void 0 : json.id) || {};
        this.signer = (json === null || json === void 0 ? void 0 : json.signer) || '';
        this.requestedkeys = (json === null || json === void 0 ? void 0 : json.requestedkeys) || [];
    }
    isFormatValid() {
        // Allowed values: 1 (FULL), 2 (PARTIAL), 5 (FULL|COLLECTION), 6 (PARTIAL|COLLECTION)
        const f = this.format;
        return (f.eq(RequestItem.FULL_DATA) ||
            f.eq(RequestItem.PARTIAL_DATA) ||
            f.eq(RequestItem.FULL_DATA.or(RequestItem.COLLECTION)) ||
            f.eq(RequestItem.PARTIAL_DATA.or(RequestItem.COLLECTION)));
    }
    isValid() {
        let valid = this.version.gte(RequestInformation.FIRST_VERSION) && this.version.lte(RequestInformation.LAST_VERSION);
        valid && (valid = this.isFormatValid());
        valid && (valid = this.type.gte(RequestItem.ATTESTATION) && this.type.lte(RequestItem.CREDENTIAL));
        return valid;
    }
    getByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.version);
        length += varint_1.default.encodingLength(this.format);
        length += varint_1.default.encodingLength(this.type);
        // Serialize id object as JSON string
        const idJson = JSON.stringify(this.id);
        length += varuint_1.default.encodingLength(Buffer.byteLength(idJson, 'utf8'));
        length += Buffer.byteLength(idJson, 'utf8');
        // Add signer length
        length += varuint_1.default.encodingLength(Buffer.byteLength(this.signer, 'utf8'));
        length += Buffer.byteLength(this.signer, 'utf8');
        length += varuint_1.default.encodingLength(this.requestedkeys ? this.requestedkeys.length : 0);
        if (this.requestedkeys) {
            for (const key of this.requestedkeys) {
                length += varuint_1.default.encodingLength(Buffer.byteLength(key, 'utf8'));
                length += Buffer.byteLength(key, 'utf8');
            }
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.version);
        writer.writeVarInt(this.format);
        writer.writeVarInt(this.type);
        // Serialize id object as JSON string
        const idJson = JSON.stringify(this.id);
        writer.writeVarSlice(Buffer.from(idJson, 'utf8'));
        // Write signer
        writer.writeVarSlice(Buffer.from(this.signer, 'utf8'));
        writer.writeCompactSize(this.requestedkeys ? this.requestedkeys.length : 0);
        if (this.requestedkeys) {
            for (const key of this.requestedkeys) {
                writer.writeVarSlice(Buffer.from(key, 'utf8'));
            }
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        this.version = reader.readVarInt();
        this.format = reader.readVarInt();
        this.type = reader.readVarInt();
        // Deserialize id object from JSON string
        const idJsonString = reader.readVarSlice().toString('utf8');
        this.id = JSON.parse(idJsonString);
        // Read signer
        this.signer = reader.readVarSlice().toString('utf8');
        this.requestedkeys = [];
        const requestedKeysLength = reader.readCompactSize();
        for (let i = 0; i < requestedKeysLength; i++) {
            this.requestedkeys.push(reader.readVarSlice().toString('utf8'));
        }
        return reader.offset;
    }
    toJSON() {
        return {
            version: this.version.toNumber(),
            format: this.format.toNumber(),
            type: this.type.toNumber(),
            id: this.id,
            signer: this.signer,
            requestedkeys: this.requestedkeys
        };
    }
    fromJSON(json) {
        this.version = new bn_js_1.BN(json.version);
        this.format = new bn_js_1.BN(json.format);
        this.type = new bn_js_1.BN(json.type);
        this.id = json.id;
        this.signer = json.signer;
        this.requestedkeys = json.requestedkeys || [];
    }
}
exports.RequestItem = RequestItem;
RequestItem.VERSION_INVALID = new bn_js_1.BN(0);
RequestItem.FIRST_VERSION = new bn_js_1.BN(1);
RequestItem.LAST_VERSION = new bn_js_1.BN(1);
RequestItem.DEFAULT_VERSION = new bn_js_1.BN(1);
RequestItem.FULL_DATA = new bn_js_1.BN(1);
RequestItem.PARTIAL_DATA = new bn_js_1.BN(2);
RequestItem.COLLECTION = new bn_js_1.BN(4);
RequestItem.ATTESTATION = new bn_js_1.BN(1);
RequestItem.CLAIM = new bn_js_1.BN(2);
RequestItem.CREDENTIAL = new bn_js_1.BN(3);
class RequestInformation {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) ? new bn_js_1.BN(data.version) : RequestInformation.DEFAULT_VERSION;
        this.items = (data === null || data === void 0 ? void 0 : data.items) || [];
    }
    isValid() {
        let valid = this.version.gte(RequestInformation.FIRST_VERSION) && this.version.lte(RequestInformation.LAST_VERSION);
        valid && (valid = this.items.every(item => {
            return item.isValid();
        }));
        return valid;
    }
    getByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.version);
        length += varuint_1.default.encodingLength(this.items.length);
        for (const item of this.items) {
            length += item.getByteLength();
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.version);
        writer.writeCompactSize(this.items ? this.items.length : 0);
        if (this.items) {
            for (const item of this.items) {
                const itemBuffer = item.toBuffer();
                writer.writeSlice(itemBuffer);
            }
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        this.version = reader.readVarInt();
        this.items = [];
        const itemsLength = reader.readCompactSize();
        for (let i = 0; i < itemsLength; i++) {
            const item = new RequestItem();
            reader.offset = item.fromBuffer(buffer, reader.offset);
            this.items.push(item);
        }
        return reader.offset;
    }
    toJSON() {
        return {
            version: this.version.toNumber(),
            items: this.items.map(item => item.toJSON())
        };
    }
    fromJSON(json) {
        this.version = new bn_js_1.BN(json.version);
        this.items = json.items.map(itemJson => {
            const item = new RequestItem();
            item.fromJSON(itemJson);
            return item;
        });
    }
}
exports.RequestInformation = RequestInformation;
RequestInformation.VERSION_INVALID = new bn_js_1.BN(0);
RequestInformation.FIRST_VERSION = new bn_js_1.BN(1);
RequestInformation.LAST_VERSION = new bn_js_1.BN(1);
RequestInformation.DEFAULT_VERSION = new bn_js_1.BN(1);
