import {
  WALLET_VDXF_KEY,
  GENERIC_REQUEST_DEEPLINK_VDXF_KEY
} from "../../";
import bufferutils from "../../../utils/bufferutils";
import base64url from "base64url";
import { BN } from 'bn.js';
import { BigNumber } from "../../../utils/types/BigNumber";
import { SignatureJsonDataInterface } from "../../../pbaas";
import { OrdinalVdxfObject, OrdinalVdxfObjectJson } from "../OrdinalVdxfObject";
import varuint from "../../../utils/varuint";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { createHash } from "crypto";
import { VerifiableSignatureData } from "../VerifiableSignatureData";

export interface GenericRequestInterface {
  version?: BigNumber;
  flags?: BigNumber;
  signature?: VerifiableSignatureData;
  createdAt?: BigNumber;
  salt?: Buffer;
  details: Array<OrdinalVdxfObject>;
}

export type GenericRequestJson = {
  version: string;
  flags?: string;
  signature?: SignatureJsonDataInterface;
  createdat?: string;
  salt?: string;
  details: Array<OrdinalVdxfObjectJson>;
}

export class GenericRequest implements SerializableEntity {
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
    request: GenericRequestInterface = {
      details: [],
      flags: GenericRequest.BASE_FLAGS
    }
  ) {
    this.signature = request.signature;
    this.details = request.details;
    this.createdAt = request.createdAt;
    this.salt = request.salt;

    if (request.flags) this.flags = request.flags;
    else this.flags = GenericRequest.BASE_FLAGS;

    if (request.version) this.version = request.version;
    else this.version = GenericRequest.VERSION_CURRENT;

    this.setFlags();
  }

  isValidVersion(): boolean {
    return this.version.gte(GenericRequest.VERSION_FIRSTVALID) && this.version.lte(GenericRequest.VERSION_LASTVALID);
  }

  isSigned() {
    return !!(this.flags.and(GenericRequest.FLAG_SIGNED).toNumber());
  }

  hasMultiDetails() {
    return !!(this.flags.and(GenericRequest.FLAG_MULTI_DETAILS).toNumber());
  }

  hasCreatedAt() {
    return !!(this.flags.and(GenericRequest.FLAG_HAS_CREATED_AT).toNumber());
  }

  hasSalt() {
    return !!(this.flags.and(GenericRequest.FLAG_HAS_SALT).toNumber());
  }

  isTestnet() {
    return !!(this.flags.and(GenericRequest.FLAG_IS_TESTNET).toNumber());
  }

  setSigned() {
    this.flags = this.flags.xor(GenericRequest.FLAG_SIGNED);
  }

  setHasMultiDetails() {
    this.flags = this.flags.xor(GenericRequest.FLAG_MULTI_DETAILS);
  }

  setHasCreatedAt() {
    this.flags = this.flags.xor(GenericRequest.FLAG_HAS_CREATED_AT);
  }

  setHasSalt() {
    this.flags = this.flags.xor(GenericRequest.FLAG_HAS_SALT);
  }

  setIsTestnet() {
    this.flags = this.flags.xor(GenericRequest.FLAG_IS_TESTNET);
  }

  setFlags() {
    if (this.createdAt) this.setHasCreatedAt();
    if (this.details && this.details.length > 1) this.setHasMultiDetails();
    if (this.signature) this.setSigned();
    if (this.salt) this.setHasSalt();
  }

  private getRawDataSha256() {
    return createHash("sha256").update(this.toBufferOptionalSig(false)).digest();
  }

  getDetailsHash(signedBlockheight: number): Buffer<ArrayBufferLike> {
    if (this.isSigned()) {
      return this.signature.getIdentityHash(signedBlockheight, this.getRawDataSha256());
    } else return this.getRawDataSha256()
  }

  getDetails(index = 0): OrdinalVdxfObject {
    return this.details[index];
  }

  private getDetailsBufferLength(): number {
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

  private getDetailsBuffer(): Buffer {
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

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.version.toNumber());
    length += varuint.encodingLength(this.flags.toNumber());

    if (this.isSigned()) {  
      length += this.signature!.getByteLength();
    }
    
    length += this.getDetailsBufferLength();

    return length;
  }

  private toBufferOptionalSig(includeSig = true) {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.getByteLength())
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
    if (buffer.length == 0) throw new Error("Cannot create request from empty buffer");
    
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

  toWalletDeeplinkUri(): string {
    return `${WALLET_VDXF_KEY.vdxfid.toLowerCase()}:/${
      GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid
    }/${this.toString()}`;
  }

  static fromWalletDeeplinkUri(uri: string): GenericRequest {
    const split = uri.split(`${GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/`);

    const inv = new GenericRequest();
    inv.fromBuffer(base64url.toBuffer(split[1]), 0);

    return inv;
  }

  toQrString(): string {
    return this.toString();
  }

  static fromQrString(qrstring: string): GenericRequest {
    const inv = new GenericRequest();
    inv.fromBuffer(base64url.toBuffer(qrstring), 0);

    return inv;
  }

  toJson(): GenericRequestJson {
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