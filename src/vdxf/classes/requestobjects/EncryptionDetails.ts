import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import varint from '../../../utils/varint';
import varuint from '../../../utils/varuint';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;
import { fromBase58Check, toBase58Check } from '../../../utils/address';
import { I_ADDR_VERSION } from '../../../constants/vdxf';
import { decodeSaplingAddress, toBech32 } from '../../../utils/sapling';
import { TransferDestination, TransferDestinationJson } from '../../../pbaas/TransferDestination';

import { SerializableEntity } from '../../../utils/types/SerializableEntity';

export enum EncryptionType {
  TYPE_PUBKEY = 1,
  TYPE_ZADDRESS = 2
}

export enum SeedDerivationMethod {
  FROM_ADDRESS_ONLY = 1,
  TO_ADDRESS_ONLY = 2,
  BOTH_ADDRESSES = 3,
  NONE = 4
}

export interface EncryptionDetailsInterface {
  type: EncryptionType;
  key: string;
  derivationNumber: BigNumber;
  seedDerivationMethod?: BigNumber;
  fromAddress?: TransferDestination;
  toAddress?: TransferDestination;
}

export interface EncryptionDetailsJson {
  type: number;
  key: string;
  derivationnumber: number;
  seedderivationmethod: number;
  fromaddress?: TransferDestinationJson;
  toaddress?: TransferDestinationJson;
}


export class EncryptionDetails implements SerializableEntity {

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  type: EncryptionType;
  key: string;
  derivationNumber: BigNumber;
  seedDerivationMethod: BigNumber;
  fromAddress?: TransferDestination;
  toAddress?: TransferDestination;

  constructor(data?: EncryptionDetailsInterface) {
    this.type = data?.type || EncryptionType.TYPE_PUBKEY;
    this.key = data?.key || '';
    this.derivationNumber = data?.derivationNumber || new BN(0);
    this.fromAddress = data?.fromAddress;
    this.toAddress = data?.toAddress;
    this.seedDerivationMethod = data?.seedDerivationMethod;
  }

  isValid(): boolean {
    let valid = this.key != null && this.key.length > 0;
    valid &&= this.type != null && (this.type === EncryptionType.TYPE_PUBKEY || this.type === EncryptionType.TYPE_ZADDRESS);
    valid &&= this.derivationNumber != null && this.derivationNumber.gte(new BN(0));
    valid &&= this.isKeyFormatValid();

    // Validate seed derivation method and required addresses
    if (this.seedDerivationMethod) {
      const method = this.seedDerivationMethod.toNumber();
      valid &&= method >= SeedDerivationMethod.FROM_ADDRESS_ONLY && method <= SeedDerivationMethod.NONE;

      // Check required addresses based on derivation method
      if (method === SeedDerivationMethod.FROM_ADDRESS_ONLY || method === SeedDerivationMethod.BOTH_ADDRESSES) {
        valid &&= this.fromAddress != null && this.fromAddress.isValid();
      }
      if (method === SeedDerivationMethod.TO_ADDRESS_ONLY || method === SeedDerivationMethod.BOTH_ADDRESSES) {
        valid &&= this.toAddress != null && this.toAddress.isValid();
      }
    }

    return valid;
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(new BN(this.type));

    // Key length - depends on type
    if (this.type === EncryptionType.TYPE_PUBKEY) {
      length += 33; // 33 byte pubkey
    } else if (this.type === EncryptionType.TYPE_ZADDRESS) {
      length += 43; // Sapling address decoded data (11 + 32 bytes)
    }

    // Mandatory derivation number
    length += varint.encodingLength(this.derivationNumber);

    length += varint.encodingLength(this.seedDerivationMethod); // seedDerivationMethod itself

    if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.FROM_ADDRESS_ONLY))) {
      length += this.fromAddress!.getByteLength();
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.TO_ADDRESS_ONLY))) {
      length += this.toAddress!.getByteLength();
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.BOTH_ADDRESSES))) {
      length += this.fromAddress!.getByteLength() + this.toAddress!.getByteLength();
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.NONE))) {
      // length += 0; No additional data for NONE
    }

    return length;
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    // Write type
    writer.writeVarInt(new BN(this.type));

    // Write key - depends on type
    if (this.type === EncryptionType.TYPE_PUBKEY) {
      writer.writeSlice(Buffer.from(this.key, 'hex'));
    } else if (this.type === EncryptionType.TYPE_ZADDRESS) {
      // Write as decoded sapling address data
      const saplingData = decodeSaplingAddress(this.key);
      writer.writeSlice(Buffer.concat([saplingData.d, saplingData.pk_d]));
    } else {
      // Fallback to UTF8 encoding with length prefix
      writer.writeVarSlice(Buffer.from(this.key, 'utf8'));
    }

    // Write mandatory derivation number
    writer.writeVarInt(this.derivationNumber);

    writer.writeVarInt(this.seedDerivationMethod);

    if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.FROM_ADDRESS_ONLY))) {
      writer.writeSlice(this.fromAddress!.toBuffer());
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.TO_ADDRESS_ONLY))) {
      writer.writeSlice(this.toAddress!.toBuffer());
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.BOTH_ADDRESSES))) {
      writer.writeSlice(this.fromAddress!.toBuffer());
      writer.writeSlice(this.toAddress!.toBuffer());
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.NONE))) {
      // No additional data for NONE
    }


    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);

    // Read type
    this.type = reader.readVarInt().toNumber() as EncryptionType;

    // Read key - depends on type
    if (this.type === EncryptionType.TYPE_PUBKEY) {
      this.key = reader.readSlice(33).toString('hex');
    } else if (this.type === EncryptionType.TYPE_ZADDRESS) {
      // Read as 43-byte sapling data and encode as sapling address
      const saplingData = reader.readSlice(43);
      this.key = toBech32('zs', saplingData);
    } else {
      // Fallback to UTF8 decoding with length prefix
      this.key = reader.readVarSlice().toString('utf8');
    }

    // Read mandatory derivation number
    this.derivationNumber = reader.readVarInt();

    this.seedDerivationMethod = reader.readVarInt();

    if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.FROM_ADDRESS_ONLY))) {
      this.fromAddress = new TransferDestination();
      reader.offset = this.fromAddress.fromBuffer(buffer, reader.offset);
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.TO_ADDRESS_ONLY))) {
      this.toAddress = new TransferDestination();
      reader.offset = this.toAddress.fromBuffer(buffer, reader.offset);
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.BOTH_ADDRESSES))) {
      this.fromAddress = new TransferDestination();
      reader.offset = this.fromAddress.fromBuffer(buffer, reader.offset);
      this.toAddress = new TransferDestination();
      reader.offset = this.toAddress.fromBuffer(buffer, reader.offset);
    } else if (this.seedDerivationMethod.eq(new BN(SeedDerivationMethod.NONE))) {
      // No additional data for NONE
    }

    return reader.offset;
  }

  toJSON(): EncryptionDetailsJson {
    return {
      type: this.type,
      key: this.key,
      derivationnumber: this.derivationNumber.toNumber(),
      fromaddress: this.fromAddress?.toJson(),
      toaddress: this.toAddress?.toJson(),
      seedderivationmethod: this.seedDerivationMethod?.toNumber()
    };
  }

  static fromJSON(json: EncryptionDetailsJson): EncryptionDetails {
    return new EncryptionDetails({
      type: json.type as EncryptionType,
      key: json.key,
      derivationNumber: new BN(json.derivationnumber),
      fromAddress: json.fromaddress ? TransferDestination.fromJson(json.fromaddress) : undefined,
      toAddress: json.toaddress ? TransferDestination.fromJson(json.toaddress) : undefined,
      seedDerivationMethod: json.seedderivationmethod ? new BN(json.seedderivationmethod) : undefined
    });
  }
  /**
   * Validate that the key format matches the encryption type
   */
  isKeyFormatValid(): boolean {
    try {
      if (this.type === EncryptionType.TYPE_PUBKEY) {
        // Should be a valid base58 address
        const key = Buffer.from(this.key, 'hex');
        if (key.length !== 33) {
          return false;
        }
        return true;
      } else if (this.type === EncryptionType.TYPE_ZADDRESS) {
        // Should be a valid sapling address
        decodeSaplingAddress(this.key);
        return true;
      }
      // For other types, any string is valid
      return true;
    } catch {
      return false;
    }
  }
}
