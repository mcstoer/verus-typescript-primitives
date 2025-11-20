import varint from '../../../utils/varint'
import bufferutils from '../../../utils/bufferutils'
import createHash = require('create-hash');
import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { fromBase58Check, toBase58Check } from '../../../utils/address';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../../constants/vdxf';
import varuint from '../../../utils/varuint';
const { BufferReader, BufferWriter } = bufferutils;

export type LoginResponseDetailsJson = {
  flags: string,
  requestid: string
}

export class LoginResponseDetails implements SerializableEntity {
  flags?: BigNumber;
  requestID?: string;              // ID of request, to be referenced in response

  constructor (data?: {
    flags?: BigNumber,
    requestID?: string
  }) {
    this.flags = data && data.flags ? data.flags : new BN("0", 10);

    if (data?.requestID) {
      this.requestID = data.requestID;
    } else this.requestID = '';
  }

  toSha256() {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    length += HASH160_BYTE_LENGTH;

    return length;
  }

  toBuffer() {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeVarInt(this.flags);

    writer.writeSlice(fromBase58Check(this.requestID).hash);

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();

    this.requestID = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);

    return reader.offset;
  }

  toJson(): LoginResponseDetailsJson {
    return {
      flags: this.flags.toString(10),
      requestid: this.requestID,
    }
  }

  static fromJson(json: LoginResponseDetailsJson): LoginResponseDetails {
    return new LoginResponseDetails({
      flags: new BN(json.flags, 10),
      requestID: json.requestid
    });
  }
}