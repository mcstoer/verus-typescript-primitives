import varuint from '../../utils/varuint'
import { fromBase58Check, toBase58Check } from "../../utils/address";
import bufferutils from '../../utils/bufferutils'
import { BN } from 'bn.js';
import { BigNumber } from '../../utils/types/BigNumber';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../constants/vdxf';
import { SerializableEntity } from '../../utils/types/SerializableEntity';
import { EHashTypes } from '../../pbaas/DataDescriptor';
const { BufferReader, BufferWriter } = bufferutils
const createHash = require("create-hash");
import { VERUS_DATA_SIGNATURE_PREFIX } from "../../constants/vdxf";
import { CompactIdAddressObject, CompactIdAddressObjectJson } from './CompactIdAddressObject';
import { DEFAULT_VERUS_CHAINNAME, HASH_TYPE_SHA256 } from '../../constants/pbaas';
import varint from '../../utils/varint';
import { SignatureData } from '../../pbaas';

export interface SignatureJsonDataInterface {
  version: number;
  flags: number;
  hashtype: number;
  systemid: CompactIdAddressObjectJson;
  identityid: CompactIdAddressObjectJson;
  vdxfkeys?: Array<string>;
  vdxfkeynames?: Array<string>;
  boundhashes?: Array<string>;
  statements?: Array<string>;
  signature: string
}

export interface VerifiableSignatureDataInterface {
  version: BigNumber;
  flags: BigNumber;
  hashType: BigNumber;
  systemId: CompactIdAddressObject;
  identityId: CompactIdAddressObject;
  vdxfKeys?: Array<string>;
  vdxfKeyNames?: Array<string>;
  boundHashes?: Array<Buffer>;
  statements?: Array<Buffer>;
  signatureAsVch: Buffer;
}

export class VerifiableSignatureData implements SerializableEntity {
  version: BigNumber;
  flags: BigNumber;
  hashType: BigNumber;
  identityId: CompactIdAddressObject;
  systemId: CompactIdAddressObject;
  vdxfKeys?: Array<string>;
  vdxfKeyNames?: Array<string>;
  boundHashes?: Array<Buffer>;
  statements?: Array<Buffer>;
  signatureAsVch: Buffer;

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);
  static TYPE_VERUSID_DEFAULT = new BN(1);

  static FLAG_HAS_VDXF_KEYS = new BN(1);
  static FLAG_HAS_VDXF_KEY_NAMES = new BN(2);
  static FLAG_HAS_BOUND_HASHES = new BN(4);
  static FLAG_HAS_STATEMENTS = new BN(8);

  constructor(data?: VerifiableSignatureDataInterface) {
    this.version = data && data.flags ? data.flags : new BN(0);
    this.flags = data && data.flags ? data.flags : new BN(0);
    this.systemId = data && data.systemId ? data.systemId : new CompactIdAddressObject({ type: CompactIdAddressObject.IS_FQN, address: DEFAULT_VERUS_CHAINNAME });
    this.hashType = data && data.hashType ? data.hashType : HASH_TYPE_SHA256;
    this.identityId = data ? data.identityId : undefined;
    this.vdxfKeys = data ? data.vdxfKeys : undefined;
    this.vdxfKeyNames = data ? data.vdxfKeyNames : undefined;
    this.boundHashes = data ? data.boundHashes : undefined;
    this.statements = data ? data.statements : undefined;
    this.signatureAsVch = data && data.signatureAsVch ? data.signatureAsVch : Buffer.alloc(0);

    this.setFlags();
  }

  private hasFlag(flag: BigNumber) {
    return !!(this.flags.and(flag).toNumber());
  }

  private setFlag(flag: BigNumber) {
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

  calcFlags(): BigNumber {
    let flags = new BN(0);
    if (this.hasVdxfKeys()) flags = flags.or(VerifiableSignatureData.FLAG_HAS_VDXF_KEYS);
    if (this.hasVdxfKeyNames()) flags = flags.or(VerifiableSignatureData.FLAG_HAS_VDXF_KEY_NAMES);
    if (this.hasBoundHashes()) flags = flags.or(VerifiableSignatureData.FLAG_HAS_BOUND_HASHES);
    if (this.hasStatements()) flags = flags.or(VerifiableSignatureData.FLAG_HAS_STATEMENTS);
    return flags;
  }

  setFlags() {
    if (this.vdxfKeys) this.setHasVdxfKeys();
    if (this.vdxfKeyNames) this.setHasVdxfKeyNames();
    if (this.boundHashes) this.setHasBoundHashes();
    if (this.statements) this.setHasStatements();
  }

  private getBufferEncodingLength(buf: Buffer) {
    const bufLen = buf.byteLength;
    
    return varuint.encodingLength(bufLen) + bufLen;
  }

  getByteLength() {
    let byteLength = 0;

    byteLength += varint.encodingLength(this.version);

    byteLength += varuint.encodingLength(this.flags.toNumber());

    byteLength += varuint.encodingLength(this.hashType.toNumber());

    byteLength += this.systemId.getByteLength();
    byteLength += this.identityId.getByteLength();

    if (this.hasVdxfKeys()) {
      byteLength += varuint.encodingLength(this.vdxfKeys.length);

      for (const key of this.vdxfKeys) {
        byteLength += HASH160_BYTE_LENGTH
      }
    }

    if (this.hasVdxfKeyNames()) {
      byteLength += varuint.encodingLength(this.vdxfKeyNames.length);

      for (const key of this.vdxfKeyNames) {
        byteLength += this.getBufferEncodingLength(Buffer.from(key, 'utf8'))
      }
    }

    if (this.hasBoundHashes()) {
      byteLength += varuint.encodingLength(this.boundHashes.length);

      for (const hash of this.boundHashes) {
        byteLength += this.getBufferEncodingLength(hash)
      }
    }

    if (this.hasStatements()) {
      byteLength += varuint.encodingLength(this.statements.length);

      for (const statement of this.statements) {
        byteLength += this.getBufferEncodingLength(statement)
      }
    }

    byteLength += this.getBufferEncodingLength(this.signatureAsVch)

    return byteLength
  }

  toBuffer() {
    const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()));

    bufferWriter.writeVarInt(this.version);

    bufferWriter.writeCompactSize(this.flags.toNumber());

    bufferWriter.writeCompactSize(this.hashType.toNumber());

    bufferWriter.writeSlice(this.systemId.toBuffer());
    bufferWriter.writeSlice(this.identityId.toBuffer());

    if (this.hasVdxfKeys()) {
      bufferWriter.writeArray(this.vdxfKeys!.map(x => fromBase58Check(x).hash));
    }

    if (this.hasVdxfKeyNames()) {
      bufferWriter.writeVector(this.vdxfKeyNames!.map(x => Buffer.from(x, 'utf8')));
    }

    if (this.hasBoundHashes()) {
      bufferWriter.writeVector(this.boundHashes!);
    }

    if (this.hasStatements()) {
      bufferWriter.writeVector(this.statements!);
    }

    bufferWriter.writeVarSlice(this.signatureAsVch);

    return bufferWriter.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const bufferReader = new BufferReader(buffer, offset);

    this.version = bufferReader.readVarInt();

    this.flags = new BN(bufferReader.readCompactSize());

    this.hashType = new BN(bufferReader.readCompactSize());

    this.systemId = new CompactIdAddressObject();
    this.identityId = new CompactIdAddressObject();

    bufferReader.offset = this.systemId.fromBuffer(bufferReader.buffer, bufferReader.offset);
    bufferReader.offset = this.identityId.fromBuffer(bufferReader.buffer, bufferReader.offset);

    if (this.hasVdxfKeys()) {
      this.vdxfKeys = bufferReader.readArray(HASH160_BYTE_LENGTH).map(x => toBase58Check(x, I_ADDR_VERSION));
    }

    if (this.hasVdxfKeyNames()) {
      this.vdxfKeyNames = bufferReader.readVector().map((x: Buffer) => x.toString('utf8'));
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
  getIdentityHash(height: number, sigHash: Buffer): Buffer<ArrayBufferLike> {
    var heightBuffer = Buffer.allocUnsafe(4)
    heightBuffer.writeUInt32LE(height);

    if (!this.hashType.eq(new BN(EHashTypes.HASH_SHA256))) {
      throw new Error("Invalid signature type for identity hash");
    }

    if (this.version.eq(new BN(1))) {
      return createHash("sha256")
        .update(VERUS_DATA_SIGNATURE_PREFIX)
        .update(fromBase58Check(this.systemId.toIAddress()).hash)
        .update(heightBuffer)
        .update(fromBase58Check(this.identityId.toIAddress()).hash)
        .update(sigHash)
        .digest();
    } else {
      return createHash("sha256")
        .update(fromBase58Check(this.systemId.toIAddress()).hash)
        .update(heightBuffer)
        .update(fromBase58Check(this.identityId.toIAddress()).hash)
        .update(VERUS_DATA_SIGNATURE_PREFIX)
        .update(sigHash)
        .digest();
    }
  }

  toSignatureData(sigHash: Buffer): SignatureData {
    return new SignatureData({
      version: this.version,
      system_ID: this.systemId.toIAddress(),
      hash_type: this.hashType,
      signature_hash: sigHash,
      identity_ID: this.identityId.toIAddress(),
      sig_type: SignatureData.TYPE_VERUSID_DEFAULT,
      vdxf_keys: this.vdxfKeys,
      vdxf_key_names: this.vdxfKeyNames,
      bound_hashes: this.boundHashes,
      signature_as_vch: this.signatureAsVch
    })
  }

  toJson(): SignatureJsonDataInterface {

    const flags = this.calcFlags();
    return {
      version: this.version.toNumber(),
      flags: flags.toNumber(),
      hashtype: this.hashType.toNumber(),
      systemid: this.systemId.toJson(),
      identityid: this.identityId.toJson(),
      vdxfkeys: this.vdxfKeys,
      vdxfkeynames: this.vdxfKeyNames,
      boundhashes: this.boundHashes?.map(x => x.toString('hex')),
      statements: this.statements?.map(x => x.toString('hex')),
      signature: this.signatureAsVch.toString('hex')
    };
  }

  static fromJson(json: SignatureJsonDataInterface): VerifiableSignatureData {
    const instance = new VerifiableSignatureData();
    instance.version = new BN(json.version);
    instance.flags = new BN(json.flags);
    instance.hashType = new BN(json.hashtype);
    instance.systemId = CompactIdAddressObject.fromJson(json.systemid);
    instance.identityId = CompactIdAddressObject.fromJson(json.identityid);
    instance.vdxfKeys = json?.vdxfkeys;
    instance.vdxfKeyNames = json?.vdxfkeynames;
    instance.boundHashes = json.boundhashes?.map(x => Buffer.from(x, 'hex'));
    instance.statements = json.statements?.map(x => Buffer.from(x, 'hex'));
    instance.signatureAsVch = Buffer.from(json.signature, 'hex');
    return instance;
  }
}