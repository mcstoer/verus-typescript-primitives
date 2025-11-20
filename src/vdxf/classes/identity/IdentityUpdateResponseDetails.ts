import varint from '../../../utils/varint'
import bufferutils from '../../../utils/bufferutils'
import createHash = require('create-hash');
import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import { UINT_256_LENGTH } from '../../../constants/pbaas';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../../constants/vdxf';
import { fromBase58Check, toBase58Check } from '../../../utils/address';
const { BufferReader, BufferWriter } = bufferutils;

export type IdentityUpdateResponseDetailsJson = {
  flags: string,
  requestid: string,
  txid?: string
}

export class IdentityUpdateResponseDetails implements SerializableEntity {
  flags?: BigNumber;
  requestID?: string;              // ID of request, to be referenced in response
  txid?: Buffer;                      // 32 byte transaction ID of identity update tx posted to blockchain, on same system asked for in request
                                      // stored in natural order, if displayed as text make sure to reverse!

  static IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID = new BN(1, 10);
  static IDENTITY_UPDATE_RESPONSE_CONTAINS_REQUEST_ID = new BN(2, 10);

  constructor (data?: {
    flags?: BigNumber,
    requestID?: string,
    txid?: Buffer
  }) {
    this.flags = data && data.flags ? data.flags : new BN("0", 10);

    if (data?.requestID) {
      if (!this.containsRequestID()) this.toggleContainsRequestID();
      this.requestID = data.requestID;
    }

    if (data?.txid) {
      if (!this.containsTxid()) this.toggleContainsTxid();
      this.txid = data.txid;
    }
  }

  containsTxid() {
    return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID).toNumber());
  }

  containsRequestID() {
    return !!(this.flags.and(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_REQUEST_ID).toNumber());
  }

  toggleContainsTxid() {
    this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID);
  }

  toggleContainsRequestID() {
    this.flags = this.flags.xor(IdentityUpdateResponseDetails.IDENTITY_UPDATE_RESPONSE_CONTAINS_REQUEST_ID);
  }

  toSha256() {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    if (this.containsRequestID()) {
      length += HASH160_BYTE_LENGTH;
    }

    if (this.containsTxid()) {
      length += UINT_256_LENGTH;
    }

    return length;
  }

  toBuffer() {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeVarInt(this.flags);

    if (this.containsRequestID()) {
      writer.writeSlice(fromBase58Check(this.requestID).hash);
    }

    if (this.containsTxid()) {
      if (this.txid.length !== UINT_256_LENGTH) throw new Error("invalid txid length");

      writer.writeSlice(this.txid);
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();

    if (this.containsRequestID()) {
      this.requestID = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);
    }

    if (this.containsTxid()) {
      this.txid = reader.readSlice(UINT_256_LENGTH);
    }

    return reader.offset;
  }

  toJson(): IdentityUpdateResponseDetailsJson {
    return {
      flags: this.flags.toString(10),
      requestid: this.containsRequestID() ? this.requestID : undefined,
      txid: this.containsTxid() ? (Buffer.from(this.txid.toString('hex'), 'hex').reverse()).toString('hex') : undefined
    }
  }

  static fromJson(json: IdentityUpdateResponseDetailsJson): IdentityUpdateResponseDetails {
    return new IdentityUpdateResponseDetails({
      flags: new BN(json.flags, 10),
      requestID: json.requestid,
      txid: json.txid ? Buffer.from(json.txid, 'hex').reverse() : undefined
    });
  }
}