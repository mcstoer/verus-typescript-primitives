import bufferutils from "../../../utils/bufferutils";
import base64url from "base64url";
import { BN } from 'bn.js';
import { BigNumber } from "../../../utils/types/BigNumber";
import { OrdinalVdxfObject, OrdinalVdxfObjectJson } from "../ordinals/OrdinalVdxfObject";
import varuint from "../../../utils/varuint";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { createHash } from "crypto";
import { VerifiableSignatureData, VerifiableSignatureDataJson } from "../VerifiableSignatureData";

export interface GenericEnvelopeInterface {
  version?: BigNumber;
  flags?: BigNumber;
  signature?: VerifiableSignatureData;
  createdAt?: BigNumber;
  salt?: Buffer;
  details: Array<OrdinalVdxfObject>;
}

export type GenericEnvelopeJson = {
  version: string;
  flags?: string;
  signature?: VerifiableSignatureDataJson;
  createdat?: string;
  salt?: string;
  details: Array<OrdinalVdxfObjectJson>;
}

export class GenericEnvelope implements SerializableEntity {
  version: BigNumber;
  flags: BigNumber;
  signature?: VerifiableSignatureData;
  createdAt?: BigNumber;
  salt?: Buffer; // var length buffer
  details: Array<OrdinalVdxfObject>;

  static VERSION_CURRENT = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static BASE_FLAGS = new BN(0, 10)
  static FLAG_SIGNED = new BN(1, 10)
  static FLAG_HAS_CREATED_AT = new BN(2, 10)
  static FLAG_MULTI_DETAILS = new BN(4, 10)
  static FLAG_IS_TESTNET = new BN(8, 10)
  static FLAG_HAS_SALT = new BN(16, 10)

  constructor(
    envelope: GenericEnvelopeInterface = {
      details: [],
      flags: GenericEnvelope.BASE_FLAGS
    }
  ) {
    this.signature = envelope.signature;
    this.details = envelope.details;
    this.createdAt = envelope.createdAt;
    this.salt = envelope.salt;

    if (envelope.flags) this.flags = envelope.flags;
    else this.flags = GenericEnvelope.BASE_FLAGS;

    if (envelope.version) this.version = envelope.version;
    else this.version = GenericEnvelope.VERSION_CURRENT;

    this.setFlags();
  }

  isValidVersion(): boolean {
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
    if (this.createdAt) this.setHasCreatedAt();
    if (this.details && this.details.length > 1) this.setHasMultiDetails();
    if (this.signature) this.setSigned();
    if (this.salt) this.setHasSalt();
  }

  getRawDataSha256(includeSig = false) {
    return createHash("sha256").update(this.toBufferOptionalSig(includeSig)).digest();
  }

  getDetailsIdentitySignatureHash(signedBlockheight: number): Buffer<ArrayBufferLike> {
    if (this.isSigned()) {
      return this.signature.getIdentityHash(signedBlockheight, this.getRawDataSha256());
    } else throw new Error("Must contain verifiable signature with at least systemID and identityID to generate details identity signature hash")
  }

  getDetails(index = 0): OrdinalVdxfObject {
    return this.details[index];
  }

  protected getDetailsBufferLength(): number {
    let length = 0;

    if (this.hasCreatedAt()) {
      length += varuint.encodingLength(this.createdAt.toNumber());
    }

    if (this.hasSalt()) {
      const saltLen = this.salt.length;

      length += varuint.encodingLength(saltLen);
      length += saltLen;
    }

    if (this.hasMultiDetails()) {
      length += varuint.encodingLength(this.details.length);
      
      for (const detail of this.details) {
        length += detail.getByteLength();
      }
    } else {
      length += this.getDetails().getByteLength();
    }

    return length;
  }

  protected getDetailsBuffer(): Buffer {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.getDetailsBufferLength())
    );

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
    } else {
      writer.writeSlice(this.getDetails().toBuffer());
    }

    return writer.buffer;
  }

  private internalGetByteLength(includeSig = true): number {
    let length = 0;

    length += varuint.encodingLength(this.version.toNumber());
    length += varuint.encodingLength(this.flags.toNumber());

    if (this.isSigned() && includeSig) {  
      length += this.signature!.getByteLength();
    }
    
    length += this.getDetailsBufferLength();

    return length;
  }

  protected getByteLengthOptionalSig(includeSig?: boolean): number {
    return this.internalGetByteLength(includeSig);
  }

  getByteLength(): number {
    return this.getByteLengthOptionalSig(true);
  }

  protected toBufferOptionalSig(includeSig = true) {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.internalGetByteLength(includeSig))
    );

    writer.writeCompactSize(this.version.toNumber());
    writer.writeCompactSize(this.flags.toNumber());

    if (this.isSigned() && includeSig) {
      writer.writeSlice(this.signature!.toBuffer());
    }

    writer.writeSlice(this.getDetailsBuffer());

    return writer.buffer;
  }

  toBuffer(): Buffer {
    return this.toBufferOptionalSig(true);
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    if (buffer.length == 0) throw new Error("Cannot create envelope from empty buffer");
    
    const reader = new bufferutils.BufferReader(buffer, offset);
    
    this.version = new BN(reader.readCompactSize());
    this.flags = new BN(reader.readCompactSize());

    if (this.isSigned()) {
      const _sig = new VerifiableSignatureData();
      reader.offset = _sig.fromBuffer(reader.buffer, reader.offset);
      this.signature = _sig;
    }

    if (this.hasCreatedAt()) {
      this.createdAt = new BN(reader.readCompactSize());
    }

    if (this.hasSalt()) {
      this.salt = reader.readVarSlice();
    }

    if (this.hasMultiDetails()) {
      this.details = [];

      const numItems = reader.readCompactSize();

      for (let i = 0; i < numItems; i++) {
        const ord = OrdinalVdxfObject.createFromBuffer(reader.buffer, reader.offset);

        reader.offset = ord.offset;
        this.details.push(ord.obj);
      }
    } else {
      const ord = OrdinalVdxfObject.createFromBuffer(reader.buffer, reader.offset);

      reader.offset = ord.offset;
      this.details = [ord.obj]
    }

    return reader.offset;
  }

  toString() {
    return base64url.encode(this.toBuffer());
  }

  toJson(): GenericEnvelopeJson {
    const details = [];

    if (this.details != null) {
      for (const detail of this.details) {
        details.push(detail.toJson())
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