import { BN } from 'bn.js';
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { GenericEnvelope, GenericEnvelopeInterface, GenericEnvelopeJson } from "../envelope/GenericEnvelope";
import bufferutils from '../../../utils/bufferutils';
import { BigNumber } from '../../../utils/types/BigNumber';
import { EHashTypes } from '../../../pbaas/DataDescriptor';
import varuint from '../../../utils/varuint';
import { GENERIC_REQUEST_DEEPLINK_VDXF_KEY } from '../../keys';
import base64url from 'base64url';

export type GenericResponseJson = GenericEnvelopeJson & {
  requesthash?: string,
  requesthashtype?: number
}

export type GenericResponseInterface = GenericEnvelopeInterface & {
  requestHash?: Buffer,
  requestHashType?: BigNumber
}

export class GenericResponse extends GenericEnvelope implements SerializableEntity {
  requestHash?: Buffer;
  requestHashType?: BigNumber;

  static VERSION_CURRENT = new BN(1, 10);
  static VERSION_FIRSTVALID = new BN(1, 10);
  static VERSION_LASTVALID = new BN(1, 10);

  static BASE_FLAGS = GenericEnvelope.BASE_FLAGS;
  static FLAG_SIGNED = GenericEnvelope.FLAG_SIGNED;
  static FLAG_HAS_CREATED_AT = GenericEnvelope.FLAG_HAS_CREATED_AT;
  static FLAG_MULTI_DETAILS = GenericEnvelope.FLAG_MULTI_DETAILS;
  static FLAG_IS_TESTNET = GenericEnvelope.FLAG_IS_TESTNET;
  static FLAG_HAS_SALT = GenericEnvelope.FLAG_HAS_SALT;
  static FLAG_HAS_REQUEST_HASH = new BN(32, 10);

  constructor(
    envelope: GenericResponseInterface = {
      details: [],
      flags: GenericResponse.BASE_FLAGS
    }
  ) {
    super(envelope)

    this.requestHash = envelope.requestHash;

    this.setFlags();

    this.requestHashType = envelope.requestHashType;

    if (this.requestHashType == null && this.hasRequestHash()) {
      this.requestHashType = new BN(EHashTypes.HASH_SHA256)
    }
  }

  hasRequestHash() {
    return !!(this.flags.and(GenericResponse.FLAG_HAS_REQUEST_HASH).toNumber());
  }

  setHasRequestHash() {
    this.flags = this.flags.or(GenericResponse.FLAG_HAS_REQUEST_HASH);
  }

  setFlags() {
    super.setFlags();

    if (this.requestHash) this.setHasRequestHash();
  }

  getByteLength(): number {
    let length = super.getByteLength();

    if (this.hasRequestHash()) {
      const hashLen = this.requestHash.length;

      length += varuint.encodingLength(this.requestHashType.toNumber());

      length += varuint.encodingLength(this.requestHash.length);
      length += hashLen;
    }

    return length;
  }

  protected toBufferOptionalSig(includeSig = true) {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.getByteLength())
    );

    const superBuf = super.toBufferOptionalSig(includeSig);

    writer.writeSlice(superBuf);

    if (this.hasRequestHash()) {
      writer.writeCompactSize(this.requestHashType.toNumber());
      writer.writeVarSlice(this.requestHash);
    }
    
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    if (buffer.length == 0) throw new Error("Cannot create response from empty buffer");

    const reader = new bufferutils.BufferReader(buffer, offset);

    reader.offset = super.fromBuffer(reader.buffer, reader.offset);

    if (this.hasRequestHash()) {
      this.requestHashType = new BN(reader.readCompactSize());
      this.requestHash = reader.readVarSlice();
    }

    return reader.offset;
  }

  toJson(): GenericResponseJson {
    const parentJson = super.toJson();

    if (this.hasRequestHash()) {
      parentJson["requesthash"] = this.requestHash.toString('hex');
      parentJson["requesthashtype"] = this.requestHashType.toNumber();
    }

    return parentJson;
  }

  static fromWalletDeeplinkUri(uri: string): GenericResponse {
    const split = uri.split(`${GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/`);

    const inv = new GenericResponse();
    inv.fromBuffer(base64url.toBuffer(split[1]), 0);

    return inv;
  }

  static fromQrString(qrstring: string): GenericResponse {
    const inv = new GenericResponse();
    inv.fromBuffer(base64url.toBuffer(qrstring), 0);

    return inv;
  }
}