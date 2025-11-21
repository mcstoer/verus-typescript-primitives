import varint from '../utils/varint'
import varuint from '../utils/varuint'
import { fromBase58Check, toBase58Check } from "../utils/address";
import bufferutils from '../utils/bufferutils'
import { BN } from 'bn.js';
import { BigNumber } from '../utils/types/BigNumber';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION, HASH256_BYTE_LENGTH } from '../constants/vdxf';
import { SerializableEntity } from '../utils/types/SerializableEntity';
const { BufferReader, BufferWriter } = bufferutils

export interface ContentMultiMapRemoveJson {
  version: number;
  action: number;
  entrykey: string;
  valuehash: string;
}

export class ContentMultiMapRemove implements SerializableEntity {
  version: BigNumber;
  action: BigNumber;
  entry_key: string;
  value_hash: Buffer;

  static VERSION_INVALID = new BN(0);
  static VERSION_FIRST = new BN(1);
  static VERSION_LAST = new BN(1);
  static VERSION_CURRENT = new BN(1);
  static ACTION_FIRST = new BN(1);
  static ACTION_REMOVE_ONE_KEYVALUE = new BN(1);
  static ACTION_REMOVE_ALL_KEYVALUE = new BN(2);
  static ACTION_REMOVE_ALL_KEY = new BN(3);
  static ACTION_CLEAR_MAP = new BN(4);
  static ACTION_LAST = new BN(4);

  constructor(data?: { version?: BigNumber, action?: BigNumber, entry_key?: string, value_hash?: Buffer }) {
    this.version = data?.version || new BN(1, 10);
    this.action = data?.action || new BN(0, 10);
    this.entry_key = data?.entry_key || "";
    this.value_hash = data?.value_hash || Buffer.alloc(0);
  }

  getByteLength() {
    let byteLength = 0; 

    byteLength += varint.encodingLength(this.version);
    byteLength += varint.encodingLength(this.action);
    if (this.action != ContentMultiMapRemove.ACTION_CLEAR_MAP) {
      byteLength += HASH160_BYTE_LENGTH
      if (this.action != ContentMultiMapRemove.ACTION_REMOVE_ALL_KEY) {
        byteLength += HASH256_BYTE_LENGTH;
      }
    }
    return byteLength
  }

  toBuffer() {
    const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()))

    bufferWriter.writeVarInt(this.version);
    bufferWriter.writeVarInt(this.action);

    if (this.action != ContentMultiMapRemove.ACTION_CLEAR_MAP) {
      bufferWriter.writeSlice(fromBase58Check(this.entry_key).hash);
      if (this.action != ContentMultiMapRemove.ACTION_REMOVE_ALL_KEY) {
        bufferWriter.writeSlice(this.value_hash); 
      }
    }

    return bufferWriter.buffer
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.version = new BN(reader.readVarInt());
    this.action = new BN(reader.readVarInt());

    if (!this.action.eq(ContentMultiMapRemove.ACTION_CLEAR_MAP)) {
      this.entry_key = toBase58Check(reader.readSlice(20), I_ADDR_VERSION)
      if (!this.action.eq(ContentMultiMapRemove.ACTION_REMOVE_ALL_KEY)) {
        this.value_hash = reader.readSlice(32); 
      }
    }
    return reader.offset;
  }

  static fromJson(data: ContentMultiMapRemoveJson): ContentMultiMapRemove {
    return new ContentMultiMapRemove({
      version: new BN(data.version),
      action: new BN(data.action),
      entry_key: data.entrykey,
      value_hash: Buffer.from(data.valuehash, 'hex').reverse() // Unit256 Reverse to match the original hash order
    })
  }

  toJson(): ContentMultiMapRemoveJson {
    return {
      version: this.version.toNumber(),
      action: this.action.toNumber(),
      entrykey: this.entry_key,
      valuehash: Buffer.from(this.value_hash).reverse().toString('hex')
    }
  }

  isValid() {

    if (this.version.gte(ContentMultiMapRemove.VERSION_FIRST) &&
      this.version.lte(ContentMultiMapRemove.VERSION_LAST)) {
        return (this.action.eq(ContentMultiMapRemove.ACTION_CLEAR_MAP) || 
          (this.entry_key && (this.entry_key.length > 0) && 
            (this.action.eq(ContentMultiMapRemove.ACTION_REMOVE_ALL_KEY) || this.value_hash.length > 0)
          ));
    }
    return false;
  }
}