"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipientConstraint = void 0;
const bufferutils_1 = require("../../../utils/bufferutils");
const varuint_1 = require("../../../utils/varuint");
const CompactAddressObject_1 = require("../CompactAddressObject");
class RecipientConstraint {
    constructor(data) {
        var _a;
        this.type = (_a = data === null || data === void 0 ? void 0 : data.type) !== null && _a !== void 0 ? _a : 0;
        this.identity = (data === null || data === void 0 ? void 0 : data.identity) || new CompactAddressObject_1.CompactIAddressObject();
    }
    static fromData(data) {
        if (data instanceof RecipientConstraint) {
            return data;
        }
        return new RecipientConstraint({
            type: data.type,
            identity: data.identity,
        });
    }
    getByteLength() {
        return varuint_1.default.encodingLength(this.type) + this.identity.getByteLength();
    }
    toBuffer() {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeCompactSize(this.type);
        writer.writeSlice(this.identity.toBuffer());
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        this.type = reader.readCompactSize();
        this.identity = new CompactAddressObject_1.CompactIAddressObject();
        reader.offset = this.identity.fromBuffer(reader.buffer, reader.offset);
        return reader.offset;
    }
    toJson() {
        return {
            type: this.type,
            identity: this.identity.toJson(),
        };
    }
    static fromJson(data) {
        return new RecipientConstraint({
            type: data.type,
            identity: CompactAddressObject_1.CompactIAddressObject.fromCompactAddressObjectJson(data.identity),
        });
    }
}
exports.RecipientConstraint = RecipientConstraint;
