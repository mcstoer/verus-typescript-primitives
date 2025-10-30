import varint from '../../../utils/varint'
import bufferutils from '../../../utils/bufferutils'
import createHash = require('create-hash');
import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import { UINT_256_LENGTH } from '../../../constants/pbaas';
import varuint from '../../../utils/varuint';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
const { BufferReader, BufferWriter } = bufferutils;

export type IdentityUpdateResponseDetailsJson = {
  flags: string,
  requestid: string,
  createdat: string,
  txid?: string,
  salt?: string
}

export class IdentityUpdateResponseDetails implements SerializableEntity {
  flags?: BigNumber;
  requestID?: BigNumber;              // ID of request, to be referenced in response
  createdAt?: BigNumber;              // Unix timestamp of request creation
  txid?: Buffer;                      // 32 byte transaction ID of identity update tx posted to blockchain, on same system asked for in request
                                      // stored in natural order, if displayed as text make sure to reverse!
  salt?: Buffer;                      // Optional salt

  static IDENTITY_UPDATE_RESPONSE_VALID = new BN(0, 10);
  static IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID = new BN(1, 10);
  static IDENTITY_UPDATE_RESPONSE_CONTAINS_SALT = new BN(2, 10);

  constructor (data?: {
    flags?: BigNumber,
    requestID?: BigNumber,
    createdAt?: BigNumber,
    txid?: Buffer,
    salt?: Buffer
  }) {
    this.flags = data && data.flags ? data.flags : new BN("0", 10);

    if (data?.requestID) {
      this.requestID = data.requestID;
    } else this.requestID = new BN("0", 10);

    if (data?.createdAt) {
      this.createdAt = data.createdAt;
    }

    if (data?.txid) {
      if (!this.containsTxid()) this.toggleContainsTxid();
      this.txid = data.txid;
    }

    if (data?.salt) {
      if (!this.containsSalt()) this.toggleContainsSalt();
      this.salt = data.salt;
    }
  }

  containsTxid() {
    return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID).toNumber());
  }

  containsSalt() {
    return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_SALT).toNumber());
  }

  toggleContainsTxid() {
    this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID);
  }

  toggleContainsSalt() {
    this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_SALT);
  }

  toSha256() {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    length += varint.encodingLength(this.requestID);

    length += varint.encodingLength(this.createdAt);

    if (this.containsTxid()) {
      length += UINT_256_LENGTH;
    }

    if (this.containsSalt()) {
      const saltLen = this.salt.length;

      length += varuint.encodingLength(saltLen);
      length += saltLen;
    }

    return length;
  }

  toBuffer() {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeVarInt(this.flags);

    writer.writeVarInt(this.requestID);

    writer.writeVarInt(this.createdAt);

    if (this.containsTxid()) {
      if (this.txid.length !== UINT_256_LENGTH) throw new Error("invalid txid length");

      writer.writeSlice(this.txid);
    }

    if (this.containsSalt()) {
      writer.writeVarSlice(this.salt);
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();

    this.requestID = reader.readVarInt();

    this.createdAt = reader.readVarInt();

    if (this.containsTxid()) {
      this.txid = reader.readSlice(UINT_256_LENGTH);
    }

    if (this.containsSalt()) {
      this.salt = reader.readVarSlice();
    }

    return reader.offset;
  }

  toJson(): IdentityUpdateResponseDetailsJson {
    return {
      flags: this.flags.toString(10),
      requestid: this.requestID.toString(10),
      createdat: this.createdAt.toString(10),
      txid: this.containsTxid() ? (Buffer.from(this.txid.toString('hex'), 'hex').reverse()).toString('hex') : undefined,
      salt: this.containsSalt() ? this.salt.toString('hex') : undefined
    }
  }

  static fromJson(json: IdentityUpdateResponseDetailsJson): IdentityUpdateResponseDetails {
    return new IdentityUpdateResponseDetails({
      flags: new BN(json.flags, 10),
      requestID: new BN(json.requestid, 10),
      createdAt: new BN(json.createdat, 10),
      txid: json.txid ? Buffer.from(json.txid, 'hex').reverse() : undefined,
      salt: json.salt ? Buffer.from(json.salt, 'hex') : undefined
    });
  }
}