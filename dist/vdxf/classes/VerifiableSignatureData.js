"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifiableSignatureData = void 0;
const varuint_1 = require("../../utils/varuint");
const address_1 = require("../../utils/address");
const bufferutils_1 = require("../../utils/bufferutils");
const bn_js_1 = require("bn.js");
const vdxf_1 = require("../../constants/vdxf");
const DataDescriptor_1 = require("../../pbaas/DataDescriptor");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const createHash = require("create-hash");
const vdxf_2 = require("../../constants/vdxf");
const CompactAddressObject_1 = require("./CompactAddressObject");
const pbaas_1 = require("../../constants/pbaas");
const varint_1 = require("../../utils/varint");
const pbaas_2 = require("../../pbaas");
class VerifiableSignatureData {
    constructor(data) {
        this.version = data && data.version ? data.version : new bn_js_1.BN(0);
        this.flags = data && data.flags ? data.flags : new bn_js_1.BN(0);
        this.signatureVersion = data && data.signatureVersion ? data.signatureVersion : new bn_js_1.BN(2, 10);
        this.systemID = data && data.systemID ? data.systemID : new CompactAddressObject_1.CompactAddressObject({ type: CompactAddressObject_1.CompactAddressObject.TYPE_FQN, address: pbaas_1.DEFAULT_VERUS_CHAINNAME });
        this.hashType = data && data.hashType ? data.hashType : pbaas_1.HASH_TYPE_SHA256;
        this.identityID = data ? data.identityID : undefined;
        this.vdxfKeys = data ? data.vdxfKeys : undefined;
        this.vdxfKeyNames = data ? data.vdxfKeyNames : undefined;
        this.boundHashes = data ? data.boundHashes : undefined;
        this.statements = data ? data.statements : undefined;
        this.signatureAsVch = data && data.signatureAsVch ? data.signatureAsVch : Buffer.alloc(0);
        this.setFlags();
    }
    hasFlag(flag) {
        return !!(this.flags.and(flag).toNumber());
    }
    setFlag(flag) {
        this.flags = this.flags.or(flag);
    }
    hasVdxfKeys() {
        return this.hasFlag(VerifiableSignatureData.FLAG_HAS_VDXF_KEYS);
    }
    hasVdxfKeyNames() {
        return this.hasFlag(VerifiableSignatureData.FLAG_HAS_VDXF_KEY_NAMES);
    }
    hasBoundHashes() {
        return this.hasFlag(VerifiableSignatureData.FLAG_HAS_BOUND_HASHES);
    }
    hasStatements() {
        return this.hasFlag(VerifiableSignatureData.FLAG_HAS_STATEMENTS);
    }
    setHasVdxfKeys() {
        this.setFlag(VerifiableSignatureData.FLAG_HAS_VDXF_KEYS);
    }
    setHasVdxfKeyNames() {
        this.setFlag(VerifiableSignatureData.FLAG_HAS_VDXF_KEY_NAMES);
    }
    setHasBoundHashes() {
        this.setFlag(VerifiableSignatureData.FLAG_HAS_BOUND_HASHES);
    }
    setHasStatements() {
        this.setFlag(VerifiableSignatureData.FLAG_HAS_STATEMENTS);
    }
    calcFlags() {
        let flags = new bn_js_1.BN(0);
        if (this.hasVdxfKeys())
            flags = flags.or(VerifiableSignatureData.FLAG_HAS_VDXF_KEYS);
        if (this.hasVdxfKeyNames())
            flags = flags.or(VerifiableSignatureData.FLAG_HAS_VDXF_KEY_NAMES);
        if (this.hasBoundHashes())
            flags = flags.or(VerifiableSignatureData.FLAG_HAS_BOUND_HASHES);
        if (this.hasStatements())
            flags = flags.or(VerifiableSignatureData.FLAG_HAS_STATEMENTS);
        return flags;
    }
    setFlags() {
        if (this.vdxfKeys)
            this.setHasVdxfKeys();
        if (this.vdxfKeyNames)
            this.setHasVdxfKeyNames();
        if (this.boundHashes)
            this.setHasBoundHashes();
        if (this.statements)
            this.setHasStatements();
    }
    getBufferEncodingLength(buf) {
        const bufLen = buf.byteLength;
        return varuint_1.default.encodingLength(bufLen) + bufLen;
    }
    getByteLength() {
        let byteLength = 0;
        byteLength += varint_1.default.encodingLength(this.version);
        byteLength += varuint_1.default.encodingLength(this.flags.toNumber());
        byteLength += varuint_1.default.encodingLength(this.signatureVersion.toNumber());
        byteLength += varuint_1.default.encodingLength(this.hashType.toNumber());
        byteLength += this.systemID.getByteLength();
        byteLength += this.identityID.getByteLength();
        if (this.hasVdxfKeys()) {
            byteLength += varuint_1.default.encodingLength(this.vdxfKeys.length);
            for (const key of this.vdxfKeys) {
                byteLength += vdxf_1.HASH160_BYTE_LENGTH;
            }
        }
        if (this.hasVdxfKeyNames()) {
            byteLength += varuint_1.default.encodingLength(this.vdxfKeyNames.length);
            for (const key of this.vdxfKeyNames) {
                byteLength += this.getBufferEncodingLength(Buffer.from(key, 'utf8'));
            }
        }
        if (this.hasBoundHashes()) {
            byteLength += varuint_1.default.encodingLength(this.boundHashes.length);
            for (const hash of this.boundHashes) {
                byteLength += this.getBufferEncodingLength(hash);
            }
        }
        if (this.hasStatements()) {
            byteLength += varuint_1.default.encodingLength(this.statements.length);
            for (const statement of this.statements) {
                byteLength += this.getBufferEncodingLength(statement);
            }
        }
        byteLength += this.getBufferEncodingLength(this.signatureAsVch);
        return byteLength;
    }
    toBuffer() {
        const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()));
        bufferWriter.writeVarInt(this.version);
        bufferWriter.writeCompactSize(this.flags.toNumber());
        bufferWriter.writeCompactSize(this.signatureVersion.toNumber());
        bufferWriter.writeCompactSize(this.hashType.toNumber());
        bufferWriter.writeSlice(this.systemID.toBuffer());
        bufferWriter.writeSlice(this.identityID.toBuffer());
        if (this.hasVdxfKeys()) {
            bufferWriter.writeArray(this.vdxfKeys.map(x => (0, address_1.fromBase58Check)(x).hash));
        }
        if (this.hasVdxfKeyNames()) {
            bufferWriter.writeVector(this.vdxfKeyNames.map(x => Buffer.from(x, 'utf8')));
        }
        if (this.hasBoundHashes()) {
            bufferWriter.writeVector(this.boundHashes);
        }
        if (this.hasStatements()) {
            bufferWriter.writeVector(this.statements);
        }
        bufferWriter.writeVarSlice(this.signatureAsVch);
        return bufferWriter.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const bufferReader = new BufferReader(buffer, offset);
        this.version = bufferReader.readVarInt();
        this.flags = new bn_js_1.BN(bufferReader.readCompactSize());
        this.signatureVersion = new bn_js_1.BN(bufferReader.readCompactSize());
        this.hashType = new bn_js_1.BN(bufferReader.readCompactSize());
        this.systemID = new CompactAddressObject_1.CompactAddressObject();
        this.identityID = new CompactAddressObject_1.CompactAddressObject();
        bufferReader.offset = this.systemID.fromBuffer(bufferReader.buffer, bufferReader.offset);
        bufferReader.offset = this.identityID.fromBuffer(bufferReader.buffer, bufferReader.offset);
        if (this.hasVdxfKeys()) {
            this.vdxfKeys = bufferReader.readArray(vdxf_1.HASH160_BYTE_LENGTH).map(x => (0, address_1.toBase58Check)(x, vdxf_1.I_ADDR_VERSION));
        }
        if (this.hasVdxfKeyNames()) {
            this.vdxfKeyNames = bufferReader.readVector().map((x) => x.toString('utf8'));
        }
        if (this.hasBoundHashes()) {
            this.boundHashes = bufferReader.readVector();
        }
        if (this.hasStatements()) {
            this.statements = bufferReader.readVector();
        }
        this.signatureAsVch = bufferReader.readVarSlice();
        return bufferReader.offset;
    }
    // To fully implement, refer to VerusCoin/src/pbaas/crosschainrpc.cpp line 337, IdentitySignatureHash
    getIdentityHash(height, sigHash) {
        var heightBuffer = Buffer.allocUnsafe(4);
        heightBuffer.writeUInt32LE(height);
        if (this.hasBoundHashes() || this.hasStatements() || this.hasVdxfKeys() || this.hasVdxfKeyNames()) {
            throw new Error("Bound hashes, statements, and vdxfkeys in signature not yet supported.");
        }
        if (!this.hashType.eq(new bn_js_1.BN(DataDescriptor_1.EHashTypes.HASH_SHA256))) {
            throw new Error("Invalid signature type for identity hash");
        }
        if (this.signatureVersion.eq(new bn_js_1.BN(0))) {
            throw new Error("Invalid sig data version");
        }
        else if (this.signatureVersion.eq(new bn_js_1.BN(1))) {
            return createHash("sha256")
                .update(vdxf_2.VERUS_DATA_SIGNATURE_PREFIX)
                .update((0, address_1.fromBase58Check)(this.systemID.toIAddress()).hash)
                .update(heightBuffer)
                .update((0, address_1.fromBase58Check)(this.identityID.toIAddress()).hash)
                .update(sigHash)
                .digest();
        }
        else if (this.signatureVersion.eq(new bn_js_1.BN(2))) {
            return createHash("sha256")
                .update((0, address_1.fromBase58Check)(this.systemID.toIAddress()).hash)
                .update(heightBuffer)
                .update((0, address_1.fromBase58Check)(this.identityID.toIAddress()).hash)
                .update(vdxf_2.VERUS_DATA_SIGNATURE_PREFIX)
                .update(sigHash)
                .digest();
        }
        else {
            throw new Error("Unrecognized sig data version");
        }
    }
    toSignatureData(sigHash) {
        return new pbaas_2.SignatureData({
            version: this.version,
            system_ID: this.systemID.toIAddress(),
            hash_type: this.hashType,
            signature_hash: sigHash,
            identity_ID: this.identityID.toIAddress(),
            sig_type: pbaas_2.SignatureData.TYPE_VERUSID_DEFAULT,
            vdxf_keys: this.vdxfKeys,
            vdxf_key_names: this.vdxfKeyNames,
            bound_hashes: this.boundHashes,
            signature_as_vch: this.signatureAsVch
        });
    }
    toJson() {
        var _a, _b;
        const flags = this.calcFlags();
        return {
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            signatureversion: this.signatureVersion.toNumber(),
            hashtype: this.hashType.toNumber(),
            systemid: this.systemID.toJson(),
            identityid: this.identityID.toJson(),
            vdxfkeys: this.vdxfKeys,
            vdxfkeynames: this.vdxfKeyNames,
            boundhashes: (_a = this.boundHashes) === null || _a === void 0 ? void 0 : _a.map(x => x.toString('hex')),
            statements: (_b = this.statements) === null || _b === void 0 ? void 0 : _b.map(x => x.toString('hex')),
            signature: this.signatureAsVch.toString('hex')
        };
    }
    static fromJson(json) {
        var _a, _b;
        const instance = new VerifiableSignatureData();
        instance.version = new bn_js_1.BN(json.version);
        instance.flags = new bn_js_1.BN(json.flags);
        instance.signatureVersion = new bn_js_1.BN(json.signatureversion);
        instance.hashType = new bn_js_1.BN(json.hashtype);
        instance.systemID = CompactAddressObject_1.CompactAddressObject.fromJson(json.systemid);
        instance.identityID = CompactAddressObject_1.CompactAddressObject.fromJson(json.identityid);
        instance.vdxfKeys = json === null || json === void 0 ? void 0 : json.vdxfkeys;
        instance.vdxfKeyNames = json === null || json === void 0 ? void 0 : json.vdxfkeynames;
        instance.boundHashes = (_a = json.boundhashes) === null || _a === void 0 ? void 0 : _a.map(x => Buffer.from(x, 'hex'));
        instance.statements = (_b = json.statements) === null || _b === void 0 ? void 0 : _b.map(x => Buffer.from(x, 'hex'));
        instance.signatureAsVch = Buffer.from(json.signature, 'hex');
        return instance;
    }
}
exports.VerifiableSignatureData = VerifiableSignatureData;
VerifiableSignatureData.VERSION_INVALID = new bn_js_1.BN(0);
VerifiableSignatureData.FIRST_VERSION = new bn_js_1.BN(1);
VerifiableSignatureData.LAST_VERSION = new bn_js_1.BN(1);
VerifiableSignatureData.DEFAULT_VERSION = new bn_js_1.BN(1);
VerifiableSignatureData.TYPE_VERUSID_DEFAULT = new bn_js_1.BN(1);
VerifiableSignatureData.FLAG_HAS_VDXF_KEYS = new bn_js_1.BN(1);
VerifiableSignatureData.FLAG_HAS_VDXF_KEY_NAMES = new bn_js_1.BN(2);
VerifiableSignatureData.FLAG_HAS_BOUND_HASHES = new bn_js_1.BN(4);
VerifiableSignatureData.FLAG_HAS_STATEMENTS = new bn_js_1.BN(8);
