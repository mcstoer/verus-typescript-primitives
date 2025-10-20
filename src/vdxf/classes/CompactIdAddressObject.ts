
/**
 * CompactIdentityObject - Class representing an id in the smallest possible format
 *
 * This class is used to represent an identity or address in a compact format, allowing for efficient
 * storage and transmission. The compact id can be represented either as a fully qualified name (FQN)
 * or as an identity address (iaddress). The class includes methods for serialization, deserialization,
 * and validation of the compact id object.
 *
 */

import { BN } from 'bn.js';
import bufferutils from '../../utils/bufferutils';
import { BigNumber } from '../../utils/types/BigNumber';
const { BufferReader, BufferWriter } = bufferutils;
import { SerializableEntity } from '../../utils/types/SerializableEntity';
import varuint from '../../utils/varuint';
import { fromBase58Check, toBase58Check, toIAddress } from "../../utils/address";
import varint from '../../utils/varint';
import { I_ADDR_VERSION } from '../../constants/vdxf';

export interface CompactIdAddressObjectJson {
  version: number;
  flags: number;
  address: string;
  rootsystemname: string;
}

export class CompactIdAddressObject implements SerializableEntity {

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  static IS_FQN = new BN(1);
  static IS_IDENTITYID = new BN(2);

  version: BigNumber;
  flags: BigNumber;
  address: string;
  rootSystemName: string;

  constructor(data?: CompactIdAddressObject) {
    this.version = data?.version || new BN(CompactIdAddressObject.DEFAULT_VERSION);
    this.flags = data?.flags || new BN(0);
    this.address = data?.address || '';
    this.rootSystemName = data?.rootSystemName || 'VRSC';
  }

  isFQN(): boolean {
    return (this.flags.and(CompactIdAddressObject.IS_FQN).eq(CompactIdAddressObject.IS_FQN));
  }

  isIaddress(): boolean {
    return (this.flags.and(CompactIdAddressObject.IS_IDENTITYID).eq(CompactIdAddressObject.IS_IDENTITYID));
  }

  isValid(): boolean {
    return this.address != null && this.address.length > 0  && (this.isFQN() || this.isIaddress());
  }

  setAddressTransferType(): void {

    if(!this.isValid()){
      throw new Error('CompactIdAddressObject: invalid address or flags not set');
    }
    
    if(this.isIaddress()) {
      return;
    }

    if(this.isFQN()) {
      if(this.address.length > 20) {
        this.flags = CompactIdAddressObject.IS_IDENTITYID;
        this.address = toIAddress(this.address, this.rootSystemName);
      } else {
        this.flags = CompactIdAddressObject.IS_FQN;
      }
    }
  }

  getByteLength(): number {

    this.setAddressTransferType();
    let length = 0;

    length += varint.encodingLength(this.flags);

    if (this.isIaddress()) {
      length += 20; // identityuint160
    } else {
      length += varuint.encodingLength(Buffer.from(this.address, 'utf8').byteLength)
        + Buffer.from(this.address, 'utf8').byteLength;
    }

    return length;
  }
  toBuffer(): Buffer {

    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeVarInt(this.flags);

    if (this.isIaddress()) {
      writer.writeSlice(fromBase58Check(this.address).hash);
    }
    else {
      writer.writeVarSlice(Buffer.from(this.address, 'utf8'));
    }
   
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();

    if (this.isIaddress()) {
        this.address = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
    } else {
        this.address = reader.readVarSlice().toString('utf8');
    }
    return reader.offset;
  }
 
  toJson(): any {
    this.setAddressTransferType();
    return {
      version: this.version.toNumber(),
      flags: this.flags.toNumber(),
      address: this.address,
      rootsystemname: this.rootSystemName,
    };
  }
  static fromJson(json: any): CompactIdAddressObject {
    const instance = new CompactIdAddressObject();
    instance.version = new BN(json.version);
    instance.flags = new BN(json.flags);
    instance.address = json.address;
    instance.rootSystemName = json.rootsystemname;
    return instance;
  }
}

