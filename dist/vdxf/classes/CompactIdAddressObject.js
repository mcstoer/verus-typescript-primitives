"use strict";
/**
 * CompactIdentityObject - Class representing an id in the smallest possible format
 *
 * This class is used to represent an identity or address in a compact format, allowing for efficient
 * storage and transmission. The compact id can be represented either as a fully qualified name (FQN)
 * or as an identity address (iaddress). The class includes methods for serialization, deserialization,
 * and validation of the compact id object.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompactIdAddressObject = void 0;
const bn_js_1 = require("bn.js");
const bufferutils_1 = require("../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const varuint_1 = require("../../utils/varuint");
const address_1 = require("../../utils/address");
const vdxf_1 = require("../../constants/vdxf");
class CompactIdAddressObject {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || new bn_js_1.BN(CompactIdAddressObject.DEFAULT_VERSION);
        this.type = (data === null || data === void 0 ? void 0 : data.type) || new bn_js_1.BN(0);
        this.address = (data === null || data === void 0 ? void 0 : data.address) || '';
        this.rootSystemName = (data === null || data === void 0 ? void 0 : data.rootSystemName) || 'VRSC';
        this.setAddressTransferType();
    }
    isFQN() {
        return (this.type.eq(CompactIdAddressObject.IS_FQN));
    }
    isIaddress() {
        return (this.type.eq(CompactIdAddressObject.IS_IDENTITYID));
    }
    isValid() {
        return this.address != null && this.address.length > 0 && (this.isFQN() || this.isIaddress());
    }
    toIAddress() {
        if (this.isIaddress())
            return this.address;
        else if (this.isFQN()) {
            return (0, address_1.toIAddress)(this.address, this.rootSystemName);
        }
        else
            throw new Error("Unknown type");
    }
    static fromIAddress(iaddr) {
        return new CompactIdAddressObject({
            address: iaddr,
            type: CompactIdAddressObject.IS_IDENTITYID
        });
    }
    setAddressTransferType() {
        if (this.isIaddress()) {
            return;
        }
        if (this.isFQN()) {
            if (this.address.length > 20) {
                this.type = CompactIdAddressObject.IS_IDENTITYID;
                this.address = (0, address_1.toIAddress)(this.address, this.rootSystemName);
            }
            else {
                this.type = CompactIdAddressObject.IS_FQN;
            }
        }
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.version.toNumber());
        length += varuint_1.default.encodingLength(this.type.toNumber());
        if (this.isIaddress()) {
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
        writer.writeCompactSize(this.type.toNumber());
        if (this.isIaddress()) {
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
        this.type = new bn_js_1.BN(reader.readCompactSize());
        if (this.isIaddress()) {
            this.address = (0, address_1.toBase58Check)(reader.readSlice(20), vdxf_1.I_ADDR_VERSION);
        }
        else {
            this.address = reader.readVarSlice().toString('utf8');
        }
        return reader.offset;
    }
    toJson() {
        return {
            version: this.version.toNumber(),
            type: this.type.toNumber(),
            address: this.address,
            rootsystemname: this.rootSystemName,
        };
    }
    static fromJson(json) {
        const instance = new CompactIdAddressObject();
        instance.version = new bn_js_1.BN(json.version);
        instance.type = new bn_js_1.BN(json.type);
        instance.address = json.address;
        instance.rootSystemName = json.rootsystemname;
        return instance;
    }
}
exports.CompactIdAddressObject = CompactIdAddressObject;
CompactIdAddressObject.VERSION_INVALID = new bn_js_1.BN(0);
CompactIdAddressObject.FIRST_VERSION = new bn_js_1.BN(1);
CompactIdAddressObject.LAST_VERSION = new bn_js_1.BN(1);
CompactIdAddressObject.DEFAULT_VERSION = new bn_js_1.BN(1);
CompactIdAddressObject.IS_FQN = new bn_js_1.BN(1);
CompactIdAddressObject.IS_IDENTITYID = new bn_js_1.BN(2);
