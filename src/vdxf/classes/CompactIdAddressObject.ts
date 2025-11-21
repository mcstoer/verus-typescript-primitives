/**
 * CompactIdentityObject - Class representing an id in the smallest possible format
 *
 * This class is used to represent an identity or address in a compact format, allowing for efficient
 * storage and transmission. The compact id can be represented either as a fully qualified name (FQN)
 * or as an identity address (iaddress). The class includes methods for serialization, deserialization,
 * and validation of the compact id object.
 */

import { BN } from 'bn.js';
import bufferutils from '../../utils/bufferutils';
import { BigNumber } from '../../utils/types/BigNumber';
const { BufferReader, BufferWriter } = bufferutils;
import { SerializableEntity } from '../../utils/types/SerializableEntity';
import varuint from '../../utils/varuint';
import { fromBase58Check, toBase58Check, toIAddress } from "../../utils/address";
import varint from '../../utils/varint';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../constants/vdxf';

export interface CompactIdAddressObjectJson {
  version: number;
  type: number;
  address: string;
  rootsystemname: string;
}

export interface CompactIdAddressObjectInterface {
  version?: BigNumber;
  type: BigNumber;
  address: string;
  rootSystemName?: string;
}

export class CompactIdAddressObject implements SerializableEntity {
  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  static IS_FQN = new BN(1);
  static IS_IDENTITYID = new BN(2);

  version: BigNumber;
  type: BigNumber;
  address: string;
  rootSystemName: string;

  constructor(data?: CompactIdAddressObjectInterface) {
    this.version = data?.version || new BN(CompactIdAddressObject.DEFAULT_VERSION);
    this.type = data?.type || new BN(0);
    this.address = data?.address || '';
    this.rootSystemName = data?.rootSystemName || 'VRSC';
    this.setAddressTransferType();
  }

  isFQN(): boolean {
    return (this.type.eq(CompactIdAddressObject.IS_FQN));
  }

  isIaddress(): boolean {
    return (this.type.eq(CompactIdAddressObject.IS_IDENTITYID));
  }

  isValid(): boolean {
    return this.address != null && this.address.length > 0 && (this.isFQN() || this.isIaddress());
  }

  toIAddress(): string {
    if (this.isIaddress()) return this.address;
    else if (this.isFQN()) {
      return toIAddress(this.address, this.rootSystemName);
    } else throw new Error("Unknown type")
  }

  static fromIAddress(iaddr: string): CompactIdAddressObject {
    return new CompactIdAddressObject({
      address: iaddr,
      type: CompactIdAddressObject.IS_IDENTITYID
    })
  }

  setAddressTransferType(): void {

    if (this.isIaddress()) {
      return;
    }

    if (this.isFQN()) {
      if (this.address.length > 20) {
        this.type = CompactIdAddressObject.IS_IDENTITYID;
        this.address = toIAddress(this.address, this.rootSystemName);
      } else {
        this.type = CompactIdAddressObject.IS_FQN;
      }
    }
  }

  getByteLength(): number {

    let length = 0;

    length += varuint.encodingLength(this.version.toNumber());
    length += varuint.encodingLength(this.type.toNumber());

    if (this.isIaddress()) {
      length += HASH160_BYTE_LENGTH; // identityuint160
    } else {
      const addrLen = Buffer.from(this.address, 'utf8').byteLength;

      length += varuint.encodingLength(addrLen) + addrLen
    }

    return length;
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeCompactSize(this.version.toNumber());
    writer.writeCompactSize(this.type.toNumber());

    if (this.isIaddress()) {
      writer.writeSlice(fromBase58Check(this.address).hash);
    } else {
      writer.writeVarSlice(Buffer.from(this.address, 'utf8'));
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);

    this.version = new BN(reader.readCompactSize());
    this.type = new BN(reader.readCompactSize());

    if (this.isIaddress()) {
      this.address = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
    } else {
      this.address = reader.readVarSlice().toString('utf8');
    }

    return reader.offset;
  }

  toJson(): CompactIdAddressObjectJson {

    return {
      version: this.version.toNumber(),
      type: this.type.toNumber(),
      address: this.address,
      rootsystemname: this.rootSystemName,
    };
  }

  static fromJson(json: any): CompactIdAddressObject {
    const instance = new CompactIdAddressObject();
    instance.version = new BN(json.version);
    instance.type = new BN(json.type);
    instance.address = json.address;
    instance.rootSystemName = json.rootsystemname;
    return instance;
  }
}