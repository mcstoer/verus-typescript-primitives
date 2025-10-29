import { BN } from 'bn.js';
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { GenericEnvelope, GenericEnvelopeInterface, GenericEnvelopeJson } from "../envelope/GenericEnvelope";
import { SaplingPaymentAddress } from '../../../pbaas/SaplingPaymentAddress';
import bufferutils from '../../../utils/bufferutils';

export type GenericRequestJson = GenericEnvelopeJson & {
  encryptresponsetoaddress?: string;
};

export type GenericRequestInterface = GenericEnvelopeInterface & {
  encryptResponseToAddress?: SaplingPaymentAddress;
}

export class GenericRequest extends GenericEnvelope implements SerializableEntity {
  encryptResponseToAddress?: SaplingPaymentAddress;

  static VERSION_CURRENT = new BN(1, 10);
  static VERSION_FIRSTVALID = new BN(1, 10);
  static VERSION_LASTVALID = new BN(1, 10);

  static BASE_FLAGS = GenericEnvelope.BASE_FLAGS;
  static FLAG_SIGNED = GenericEnvelope.FLAG_SIGNED;
  static FLAG_HAS_CREATED_AT = GenericEnvelope.FLAG_HAS_CREATED_AT;
  static FLAG_MULTI_DETAILS = GenericEnvelope.FLAG_MULTI_DETAILS;
  static FLAG_IS_TESTNET = GenericEnvelope.FLAG_IS_TESTNET;
  static FLAG_HAS_SALT = GenericEnvelope.FLAG_HAS_SALT;
  static FLAG_HAS_ENCRYPT_RESPONSE_TO_ADDRESS = new BN(32, 10);

  constructor(
    envelope: GenericRequestInterface = {
      details: [],
      flags: GenericRequest.BASE_FLAGS
    }
  ) {
    super(envelope)

    this.encryptResponseToAddress = envelope.encryptResponseToAddress;

    this.setFlags();
  }

  hasEncryptResponseToAddress() {
    return !!(this.flags.and(GenericRequest.FLAG_HAS_ENCRYPT_RESPONSE_TO_ADDRESS).toNumber());
  }

  setHasEncryptResponseToAddress() {
    this.flags = this.flags.or(GenericRequest.FLAG_HAS_ENCRYPT_RESPONSE_TO_ADDRESS);
  }

  setFlags() {
    super.setFlags();

    if (this.encryptResponseToAddress) this.setHasEncryptResponseToAddress();
  }

  getByteLength(): number {
    let length = super.getByteLength();

    if (this.hasEncryptResponseToAddress()) {
      length += this.encryptResponseToAddress.getByteLength();
    }

    return length;
  }

  protected toBufferOptionalSig(includeSig = true) {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.getByteLength())
    );

    const superBuf = super.toBufferOptionalSig(includeSig);

    writer.writeSlice(superBuf);

    if (this.hasEncryptResponseToAddress()) {
      writer.writeSlice(this.encryptResponseToAddress.toBuffer());
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    if (buffer.length == 0) throw new Error("Cannot create request from empty buffer");

    const reader = new bufferutils.BufferReader(buffer, offset);

    reader.offset = super.fromBuffer(reader.buffer, reader.offset);

    if (this.hasEncryptResponseToAddress()) {
      this.encryptResponseToAddress = new SaplingPaymentAddress();

      reader.offset = this.encryptResponseToAddress.fromBuffer(reader.buffer, reader.offset);
    }

    return reader.offset;
  }

  toJson(): GenericRequestJson {
    const parentJson = super.toJson();

    if (this.hasEncryptResponseToAddress()) {
      parentJson["encryptresponsetoaddress"] = this.encryptResponseToAddress.toAddressString();
    }

    return parentJson;
  }
}