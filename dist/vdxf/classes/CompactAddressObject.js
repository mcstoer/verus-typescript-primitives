"use strict";
/**
 * CompactIdentityObject - Class representing an id in the smallest possible format
 *
 * This class is used to represent an identity or address in a compact format, allowing for efficient
 * storage and transmission. The compact id can be represented either as a fully qualified name (FQN)
 * or as an identity address (iaddress) or as an x address (tag/index). The class includes methods for serialization, deserialization,
 * and validation of the compact id object.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompactAddressObject = void 0;
const bn_js_1 = require("bn.js");
const bufferutils_1 = require("../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const varuint_1 = require("../../utils/varuint");
const address_1 = require("../../utils/address");
const vdxf_1 = require("../../constants/vdxf");
const pbaas_1 = require("../../constants/pbaas");
class CompactAddressObject {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || new bn_js_1.BN(CompactAddressObject.DEFAULT_VERSION);
        this.type = (data === null || data === void 0 ? void 0 : data.type.toString()) || "1";
        this.address = (data === null || data === void 0 ? void 0 : data.address) || '';
        this.rootSystemName = (data === null || data === void 0 ? void 0 : data.rootSystemName) || 'VRSC';
        this.nameSpace = (data === null || data === void 0 ? void 0 : data.nameSpace) || (0, address_1.toIAddress)(this.rootSystemName);
    }
    get BNType() {
        return new bn_js_1.BN(this.type);
    }
    set setType(type) {
        this.type = type.toString();
    }
    isFQN() {
        return (this.BNType.eq(CompactAddressObject.TYPE_FQN));
    }
    isIaddress() {
        return (this.BNType.eq(CompactAddressObject.TYPE_I_ADDRESS));
    }
    isXaddress() {
        return (this.BNType.eq(CompactAddressObject.TYPE_X_ADDRESS));
    }
    isValid() {
        return this.address != null;
    }
    toIAddress() {
        if (this.isXaddress())
            throw new Error("Cannot convert I to X address");
        else if (this.isIaddress())
            return this.address;
        else if (this.isFQN()) {
            return (0, address_1.toIAddress)(this.address, this.rootSystemName);
        }
        else
            throw new Error("Unknown type");
    }
    toXAddress() {
        if (this.isIaddress())
            throw new Error("Cannot convert X to I address");
        else if (this.isXaddress())
            return this.address;
        else if (this.isFQN()) {
            return (0, address_1.getDataKey)(this.address, this.nameSpace, (0, address_1.toIAddress)(this.rootSystemName), vdxf_1.X_ADDR_VERSION).id;
        }
        else
            throw new Error("Unknown type");
    }
    static fromIAddress(iaddr) {
        return new CompactAddressObject({
            address: iaddr,
            type: CompactAddressObject.TYPE_I_ADDRESS
        });
    }
    static fromXAddress(xaddr, nameSpace = pbaas_1.DEFAULT_VERUS_CHAINID) {
        return new CompactAddressObject({
            address: xaddr,
            nameSpace: nameSpace,
            type: CompactAddressObject.TYPE_X_ADDRESS
        });
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.version.toNumber());
        length += varuint_1.default.encodingLength(this.BNType.toNumber());
        if (this.isIaddress() || this.isXaddress()) {
            length += vdxf_1.HASH160_BYTE_LENGTH; // identityuint160
        }
        else {
            const addrLen = Buffer.from(this.address, 'utf8').byteLength;
            length += varuint_1.default.encodingLength(addrLen) + addrLen;
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeCompactSize(this.version.toNumber());
        writer.writeCompactSize(this.BNType.toNumber());
        if (this.isIaddress() || this.isXaddress()) {
            writer.writeSlice((0, address_1.fromBase58Check)(this.address).hash);
        }
        else {
            writer.writeVarSlice(Buffer.from(this.address, 'utf8'));
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        this.version = new bn_js_1.BN(reader.readCompactSize());
        this.type = new bn_js_1.BN(reader.readCompactSize()).toString();
        if (this.isIaddress() || this.isXaddress()) {
            this.address = (0, address_1.toBase58Check)(reader.readSlice(20), this.isIaddress() ? vdxf_1.I_ADDR_VERSION : vdxf_1.X_ADDR_VERSION);
        }
        else {
            this.address = reader.readVarSlice().toString('utf8');
        }
        return reader.offset;
    }
    toJson() {
        return {
            version: this.version.toNumber(),
            type: this.BNType.toNumber(),
            address: this.address,
            rootsystemname: this.rootSystemName,
        };
    }
    static fromJson(json) {
        const instance = new CompactAddressObject();
        instance.version = new bn_js_1.BN(json.version);
        instance.type = new bn_js_1.BN(json.type).toString();
        instance.address = json.address;
        instance.rootSystemName = json.rootsystemname;
        return instance;
    }
}
exports.CompactAddressObject = CompactAddressObject;
CompactAddressObject.VERSION_INVALID = new bn_js_1.BN(0);
CompactAddressObject.FIRST_VERSION = new bn_js_1.BN(1);
CompactAddressObject.LAST_VERSION = new bn_js_1.BN(1);
CompactAddressObject.DEFAULT_VERSION = new bn_js_1.BN(1);
CompactAddressObject.TYPE_FQN = new bn_js_1.BN(1);
CompactAddressObject.TYPE_I_ADDRESS = new bn_js_1.BN(2);
CompactAddressObject.TYPE_X_ADDRESS = new bn_js_1.BN(3);
