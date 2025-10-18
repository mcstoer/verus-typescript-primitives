
/**
 * AppEncryptionRequest - Class for handling application requests for encrypted derived seeds
 * 
 * This class is used when an application is requesting an encrypted derived seed from the user's master seed,
 * using specific parameters passed by the application. The request includes:
 * - A target encryption key (zaddress format)
 * - Derivation numbers for seed generation
 * - Optional source and destination addresses for context
 * 
 * The user's wallet can use these parameters to derive a specific seed from their master seed
 * and encrypt it using the provided encryption key, ensuring the application receives only
 * the specific derived seed it needs without exposing the master seed.
 */

import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import varint from '../../../utils/varint';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;
import { decodeSaplingAddress, toBech32 } from '../../../utils/sapling';
import { TransferDestination, TransferDestinationJson } from '../../../pbaas/TransferDestination';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { escape } from 'querystring';
import varuint from '../../../utils/varuint';
import { I_ADDR_VERSION } from '../../../constants/vdxf';
import { fromBase58Check, toBase58Check } from '../../..';
import { CompactIdentityObject } from './CompactIdentityObject';

export interface AppEncryptionRequestDetailsJson {
  version: number;
  flags: number;
  encryptToKey: string;
  derivationnumber: number;
  optionalderivationnumber?: number;
  fromaddress?: string;
  toaddress?: string;
}

/**
 * Checks if a string is a valid hexadecimal address
 * @param flags - Optional flags for the request
 * @flag HAS_FROM_ADDRESS - Indicates if a from address is included
 * @flag HAS_TO_ADDRESS - Indicates if a to address is included
 * @flag HAS_OPTIONAL_SEED_DERIVATION - Indicates if an optional derivation number is included
 * @flag ADDRESSES_NOT_FQN - Indicates if addresses are in hex format rather than FQN
 * 
 * @param encryptToKey - The encryption key to use for encrypting to
 * @param derivationNumber - The derivation number to validate
 * @param optionalDerivationNumber - The optional derivation number to validate
 * @param fromAddress - The from address to be included in the encryption either 
 * john.domain@ or [20-byte hex iaddress][20-byte hex system]
 * @param toAddress - The to address to be included in the encryption either
 * john.domain@ or [20-byte hex iaddress][20-byte hex system]
 */

export class AppEncryptionRequestDetails implements SerializableEntity {

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  static HAS_FROM_ADDRESS = new BN(1);
  static HAS_TO_ADDRESS = new BN(2);
  static HAS_OPTIONAL_SEED_DERIVATION = new BN(4);

  version: BigNumber;
  flags: BigNumber;
  encryptToKey: string;
  derivationNumber: BigNumber;
  optionalDerivationNumber?: BigNumber;
  fromAddress?: CompactIdentityObject;
  toAddress?: CompactIdentityObject;

  constructor(data?: AppEncryptionRequestDetails) {
    this.version = data?.version || AppEncryptionRequestDetails.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0);
    this.encryptToKey = data?.encryptToKey || '';
    this.derivationNumber = data?.derivationNumber || new BN(0);
    this.optionalDerivationNumber = data?.optionalDerivationNumber;
    this.fromAddress = data?.fromAddress;
    this.toAddress = data?.toAddress;
  }

  setFlags(): void {
    this.flags = new BN(0);

    if (this.optionalDerivationNumber != null) {
      this.flags = this.flags.or(AppEncryptionRequestDetails.HAS_OPTIONAL_SEED_DERIVATION);
    }

    if (this.fromAddress != null) {
      this.flags = this.flags.or(AppEncryptionRequestDetails.HAS_FROM_ADDRESS);
    }

    if (this.toAddress != null) {
      this.flags = this.flags.or(AppEncryptionRequestDetails.HAS_TO_ADDRESS);
    }
  }

  isValid(): boolean {
    let valid = this.encryptToKey != null && this.encryptToKey.length > 0;
    valid &&= this.derivationNumber != null && this.derivationNumber.gte(new BN(0));
    valid &&= this.optionalDerivationNumber == null || this.optionalDerivationNumber.gte(new BN(0));

    return valid;
  }

  hasOptionalSeedDerivation(): boolean {
    return this.flags.and(AppEncryptionRequestDetails.HAS_OPTIONAL_SEED_DERIVATION).gt(new BN(0));
  }

  hasFromAddress(): boolean {
    return this.flags.and(AppEncryptionRequestDetails.HAS_FROM_ADDRESS).gt(new BN(0));
  }

  hasToAddress(): boolean {
    return this.flags.and(AppEncryptionRequestDetails.HAS_TO_ADDRESS).gt(new BN(0));
  }

  isHexAddress(address: string): boolean {
    return address.length === 40 && address.match(/^[0-9a-fA-F]+$/) !== null;
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    // encryptToKey - zaddress encoding (43 bytes for sapling address data)
    length += 43; // Sapling address decoded data (11 + 32 bytes)

    length += varint.encodingLength(this.derivationNumber);

    if (this.hasOptionalSeedDerivation()) {
      length += varint.encodingLength(this.optionalDerivationNumber);
    }

    if (this.hasFromAddress()) {
      if (this.isHexAddress(this.fromAddress!)) {
        length += 20;
      } else {
        length += varuint.encodingLength(Buffer.from(this.fromAddress!, 'utf8').byteLength);
        length += Buffer.from(this.fromAddress!, 'utf8').byteLength;
      }
    }

    if (this.hasToAddress()) {
      if (this.isHexAddress(this.toAddress!)) {
        length += 20;
      } else {
        length += varuint.encodingLength(Buffer.from(this.toAddress!, 'utf8').byteLength);
        length += Buffer.from(this.toAddress!, 'utf8').byteLength;
      }
    }

    return length;
  }

  toBuffer(): Buffer {
    // Set flags before serialization
    this.setFlags();

    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    // Write flags
    writer.writeVarInt(this.flags);

    // Write encryptToKey as decoded sapling address data
    const saplingData = decodeSaplingAddress(this.encryptToKey);
    writer.writeSlice(Buffer.concat([saplingData.d, saplingData.pk_d]));

    // Write mandatory derivation number
    writer.writeVarInt(this.derivationNumber);

    // Write optional derivation number if flag is set
    if (this.hasOptionalSeedDerivation()) {
      writer.writeVarInt(this.optionalDerivationNumber);
    }

    // Write addresses based on flags
    if (this.hasFromAddress()) {
      if (this.isHexAddress(this.fromAddress!)) {
        writer.writeSlice(Buffer.from(this.fromAddress!, 'hex'));
      } else {
        writer.writeVarSlice(Buffer.from(this.fromAddress!, 'utf8'));
      }
    }

    if (this.hasToAddress()) {
      if (this.isHexAddress(this.toAddress!)) {
        writer.writeSlice(Buffer.from(this.toAddress!, 'hex'));
      } else {
        writer.writeVarSlice(Buffer.from(this.toAddress!, 'utf8'));
      }
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);

    // Read flags
    this.flags = reader.readVarInt();

    // Read encryptToKey as 43-byte sapling data and encode as sapling address
    const saplingData = reader.readSlice(43);
    this.encryptToKey = toBech32('zs', saplingData);

    // Read mandatory derivation number
    this.derivationNumber = reader.readVarInt();

    // Read optional derivation number if flag is set
    if (this.hasOptionalSeedDerivation()) {
      this.optionalDerivationNumber = reader.readVarInt();
    }

    // Read addresses based on flags
    if (this.hasFromAddress()) {
      if (this.isHexAddress(this.fromAddress!)) {
        this.fromAddress = reader.readSlice(20).toString('hex');
      } else {
        this.fromAddress = reader.readVarSlice().toString('utf8');
      }
    }

    if (this.hasToAddress()) {
      if (this.isHexAddress(this.toAddress!)) {
        this.toAddress = reader.readSlice(20).toString('hex');
      } else {
        this.toAddress = reader.readVarSlice().toString('utf8');
      }
    }

    return reader.offset;
  }

  toJSON(): AppEncryptionRequestDetailsJson {
    // Set flags before serialization
    this.setFlags();

    return {
      version: this.version.toNumber(),
      flags: this.flags.toNumber(),
      encryptToKey: this.encryptToKey,
      derivationnumber: this.derivationNumber.toNumber(),
      optionalderivationnumber: this.optionalDerivationNumber?.toNumber(),
      fromaddress: this.fromAddress,
      toaddress: this.toAddress
    };
  }

  static fromJSON(json: AppEncryptionRequestDetailsJson): AppEncryptionRequestDetails {
    const instance = new AppEncryptionRequestDetails();
    instance.version = new BN(json.version);
    instance.flags = new BN(json.flags);
    instance.encryptToKey = json.encryptToKey;
    instance.derivationNumber = new BN(json.derivationnumber);
    instance.optionalDerivationNumber = json?.optionalderivationnumber ? new BN(json.optionalderivationnumber) : undefined;
    instance.fromAddress = json?.fromaddress;
    instance.toAddress = json?.toaddress;
    return instance;
  }

}
