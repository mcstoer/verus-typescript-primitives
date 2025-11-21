"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericEnvelope = void 0;
const bufferutils_1 = require("../../../utils/bufferutils");
const base64url_1 = require("base64url");
const bn_js_1 = require("bn.js");
const OrdinalVdxfObject_1 = require("../ordinals/OrdinalVdxfObject");
const varuint_1 = require("../../../utils/varuint");
const crypto_1 = require("crypto");
const VerifiableSignatureData_1 = require("../VerifiableSignatureData");
class GenericEnvelope {
    constructor(envelope = {
        details: [],
        flags: GenericEnvelope.BASE_FLAGS
    }) {
        this.signature = envelope.signature;
        this.details = envelope.details;
        this.createdAt = envelope.createdAt;
        this.salt = envelope.salt;
        if (envelope.flags)
            this.flags = envelope.flags;
        else
            this.flags = GenericEnvelope.BASE_FLAGS;
        if (envelope.version)
            this.version = envelope.version;
        else
            this.version = GenericEnvelope.VERSION_CURRENT;
        this.setFlags();
    }
    isValidVersion() {
        return this.version.gte(GenericEnvelope.VERSION_FIRSTVALID) && this.version.lte(GenericEnvelope.VERSION_LASTVALID);
    }
    isSigned() {
        return !!(this.flags.and(GenericEnvelope.FLAG_SIGNED).toNumber());
    }
    hasMultiDetails() {
        return !!(this.flags.and(GenericEnvelope.FLAG_MULTI_DETAILS).toNumber());
    }
    hasCreatedAt() {
        return !!(this.flags.and(GenericEnvelope.FLAG_HAS_CREATED_AT).toNumber());
    }
    hasSalt() {
        return !!(this.flags.and(GenericEnvelope.FLAG_HAS_SALT).toNumber());
    }
    isTestnet() {
        return !!(this.flags.and(GenericEnvelope.FLAG_IS_TESTNET).toNumber());
    }
    setSigned() {
        this.flags = this.flags.or(GenericEnvelope.FLAG_SIGNED);
    }
    setHasMultiDetails() {
        this.flags = this.flags.or(GenericEnvelope.FLAG_MULTI_DETAILS);
    }
    setHasCreatedAt() {
        this.flags = this.flags.or(GenericEnvelope.FLAG_HAS_CREATED_AT);
    }
    setHasSalt() {
        this.flags = this.flags.or(GenericEnvelope.FLAG_HAS_SALT);
    }
    setIsTestnet() {
        this.flags = this.flags.or(GenericEnvelope.FLAG_IS_TESTNET);
    }
    setFlags() {
        if (this.createdAt)
            this.setHasCreatedAt();
        if (this.details && this.details.length > 1)
            this.setHasMultiDetails();
        if (this.signature)
            this.setSigned();
        if (this.salt)
            this.setHasSalt();
    }
    getRawDataSha256(includeSig = false) {
        return (0, crypto_1.createHash)("sha256").update(this.toBufferOptionalSig(includeSig)).digest();
    }
    getDetailsIdentitySignatureHash(signedBlockheight) {
        if (this.isSigned()) {
            return this.signature.getIdentityHash(signedBlockheight, this.getRawDataSha256());
        }
        else
            throw new Error("Must contain verifiable signature with at least systemID and identityID to generate details identity signature hash");
    }
    getDetails(index = 0) {
        return this.details[index];
    }
    getDetailsBufferLength() {
        let length = 0;
        if (this.hasCreatedAt()) {
            length += varuint_1.default.encodingLength(this.createdAt.toNumber());
        }
        if (this.hasSalt()) {
            const saltLen = this.salt.length;
            length += varuint_1.default.encodingLength(saltLen);
            length += saltLen;
        }
        if (this.hasMultiDetails()) {
            length += varuint_1.default.encodingLength(this.details.length);
            for (const detail of this.details) {
                length += detail.getByteLength();
            }
        }
        else {
            length += this.getDetails().getByteLength();
        }
        return length;
    }
    getDetailsBuffer() {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.getDetailsBufferLength()));
        if (this.hasCreatedAt()) {
            writer.writeCompactSize(this.createdAt.toNumber());
        }
        if (this.hasSalt()) {
            writer.writeVarSlice(this.salt);
        }
        if (this.hasMultiDetails()) {
            writer.writeCompactSize(this.details.length);
            for (const detail of this.details) {
                writer.writeSlice(detail.toBuffer());
            }
        }
        else {
            writer.writeSlice(this.getDetails().toBuffer());
        }
        return writer.buffer;
    }
    internalGetByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.version.toNumber());
        length += varuint_1.default.encodingLength(this.flags.toNumber());
        if (this.isSigned()) {
            length += this.signature.getByteLength();
        }
        length += this.getDetailsBufferLength();
        return length;
    }
    getByteLength() {
        return this.internalGetByteLength();
    }
    toBufferOptionalSig(includeSig = true) {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.internalGetByteLength()));
        writer.writeCompactSize(this.version.toNumber());
        writer.writeCompactSize(this.flags.toNumber());
        if (this.isSigned() && includeSig) {
            writer.writeSlice(this.signature.toBuffer());
        }
        writer.writeSlice(this.getDetailsBuffer());
        return writer.buffer;
    }
    toBuffer() {
        return this.toBufferOptionalSig(true);
    }
    fromBuffer(buffer, offset) {
        if (buffer.length == 0)
            throw new Error("Cannot create envelope from empty buffer");
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        this.version = new bn_js_1.BN(reader.readCompactSize());
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        if (this.isSigned()) {
            const _sig = new VerifiableSignatureData_1.VerifiableSignatureData();
            reader.offset = _sig.fromBuffer(reader.buffer, reader.offset);
            this.signature = _sig;
        }
        if (this.hasCreatedAt()) {
            this.createdAt = new bn_js_1.BN(reader.readCompactSize());
        }
        if (this.hasSalt()) {
            this.salt = reader.readVarSlice();
        }
        if (this.hasMultiDetails()) {
            this.details = [];
            const numItems = reader.readCompactSize();
            for (let i = 0; i < numItems; i++) {
                const ord = OrdinalVdxfObject_1.OrdinalVdxfObject.createFromBuffer(reader.buffer, reader.offset);
                reader.offset = ord.offset;
                this.details.push(ord.obj);
            }
        }
        else {
            const ord = OrdinalVdxfObject_1.OrdinalVdxfObject.createFromBuffer(reader.buffer, reader.offset);
            reader.offset = ord.offset;
            this.details = [ord.obj];
        }
        return reader.offset;
    }
    toString() {
        return base64url_1.default.encode(this.toBuffer());
    }
    toJson() {
        const details = [];
        if (this.details != null) {
            for (const detail of this.details) {
                details.push(detail.toJson());
            }
        }
        return {
            signature: undefined, //TODO: Add signature toJson function this.isSigned() ? this.signature.toJson() : undefined,
            details: details,
            version: this.version.toString(),
            flags: this.flags.toString(),
            createdat: this.hasCreatedAt() ? this.createdAt.toString() : undefined
        };
    }
}
exports.GenericEnvelope = GenericEnvelope;
GenericEnvelope.VERSION_CURRENT = new bn_js_1.BN(1, 10);
GenericEnvelope.VERSION_FIRSTVALID = new bn_js_1.BN(1, 10);
GenericEnvelope.VERSION_LASTVALID = new bn_js_1.BN(1, 10);
GenericEnvelope.BASE_FLAGS = new bn_js_1.BN(0, 10);
GenericEnvelope.FLAG_SIGNED = new bn_js_1.BN(1, 10);
GenericEnvelope.FLAG_HAS_CREATED_AT = new bn_js_1.BN(2, 10);
GenericEnvelope.FLAG_MULTI_DETAILS = new bn_js_1.BN(4, 10);
GenericEnvelope.FLAG_IS_TESTNET = new bn_js_1.BN(8, 10);
GenericEnvelope.FLAG_HAS_SALT = new bn_js_1.BN(16, 10);
