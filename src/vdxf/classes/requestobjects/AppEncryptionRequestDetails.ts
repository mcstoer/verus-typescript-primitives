
/**
 * AppEncryptionRequestDetails - Class for handling application requests for encrypted derived seeds
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
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { CompactIdAddressObject, CompactIdAddressObjectJson } from '../CompactIdAddressObject';
import varuint from '../../../utils/varuint';

export interface AppEncryptionRequestDetailsInterface {
  version?: BigNumber;
  flags: BigNumber;
  encryptToZAddress: string;
  derivationNumber: BigNumber;
  secondaryDerivationNumber?: BigNumber;
  fromAddress?: CompactIdAddressObject;
  toAddress?: CompactIdAddressObject;
}

export interface AppEncryptionRequestDetailsJson {
  version: number;
  flags: number;
  encrypttozaddress: string;
  derivationnumber: number;
  secondaryderivationnumber?: number;
  fromaddress?: CompactIdAddressObjectJson;
  toaddress?: CompactIdAddressObjectJson;
}

/**
 * Checks if a string is a valid hexadecimal address
 * @param flags - Optional flags for the request
 * @flag HAS_FROM_ADDRESS - Indicates if a from address is included
 * @flag HAS_TO_ADDRESS - Indicates if a to address is included
 * @flag HAS_OPTIONAL_SEED_DERIVATION - Indicates if an optional derivation number is included
 * @flag ADDRESSES_NOT_FQN - Indicates if addresses are in hex format rather than FQN
 * 
 * @param encryptToZAddress - The encryption key to use for encrypting to
 * @param derivationNumber - The derivation number to validate
 * @param secondaryDerivationNumber - The optional derivation number to validate
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
  static HAS_SECONDARY_SEED_DERIVATION_NUMBER = new BN(4);

  version: BigNumber;
  flags: BigNumber;
  encryptToZAddress: string;
  derivationNumber: BigNumber;
  secondaryDerivationNumber?: BigNumber;
  fromAddress?: CompactIdAddressObject;
  toAddress?: CompactIdAddressObject;

  constructor(data?: AppEncryptionRequestDetailsInterface) {
    this.version = data?.version || AppEncryptionRequestDetails.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0);
    this.encryptToZAddress = data?.encryptToZAddress || '';
    this.derivationNumber = data?.derivationNumber || new BN(0);
    this.secondaryDerivationNumber = data?.secondaryDerivationNumber;
    this.fromAddress = data?.fromAddress;
    this.toAddress = data?.toAddress;

    this.setFlags();
  }

  setFlags(): void {
    this.flags = this.calcFlags();
  }

  calcFlags(): BigNumber {
    let flags = new BN(0);

    if (this.secondaryDerivationNumber != null) {
      flags = flags.or(AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER);
    }

    if (this.fromAddress != null) {
      flags = flags.or(AppEncryptionRequestDetails.HAS_FROM_ADDRESS);
    }

    if (this.toAddress != null) {
      flags = flags.or(AppEncryptionRequestDetails.HAS_TO_ADDRESS);
    }

    return flags;
  }

  isValid(): boolean {
    let valid = this.encryptToZAddress != null && this.encryptToZAddress.length > 0;
    valid &&= this.derivationNumber != null && this.derivationNumber.gte(new BN(0));
    valid &&= this.secondaryDerivationNumber == null || this.secondaryDerivationNumber.gte(new BN(0));

    return valid;
  }

  hasSecondarySeedDerivation(): boolean {
    return this.flags.and(AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER).gt(new BN(0));
  }

  hasFromAddress(): boolean {
    return this.flags.and(AppEncryptionRequestDetails.HAS_FROM_ADDRESS).gt(new BN(0));
  }

  hasToAddress(): boolean {
    return this.flags.and(AppEncryptionRequestDetails.HAS_TO_ADDRESS).gt(new BN(0));
  }

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.flags.toNumber());

    // encryptToKey - zaddress encoding (43 bytes for sapling address data)
    length += 43; // Sapling address decoded data (11 + 32 bytes)

    length += varuint.encodingLength(this.derivationNumber.toNumber());

    if (this.hasSecondarySeedDerivation()) {
      length += varint.encodingLength(this.secondaryDerivationNumber);
    }

    if (this.hasFromAddress()) {
        length += this.fromAddress.getByteLength();
    }

    if (this.hasToAddress()) {
       length += this.toAddress.getByteLength();
    }

    return length;
  }

  toBuffer(): Buffer {

    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    // Write flags
    writer.writeCompactSize(this.flags.toNumber());

    // Write encryptToAddress as decoded sapling address data
    const saplingData = decodeSaplingAddress(this.encryptToZAddress);
    writer.writeSlice(Buffer.concat([saplingData.d, saplingData.pk_d]));

    // Write mandatory derivation number
    writer.writeVarInt(this.derivationNumber);

    if (this.hasSecondarySeedDerivation()) {
      writer.writeVarInt(this.secondaryDerivationNumber);
    }

    if (this.hasFromAddress()) {
        writer.writeSlice(this.fromAddress.toBuffer());
    }

    if (this.hasToAddress()) {
       writer.writeSlice(this.toAddress.toBuffer());
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);

    // Read flags
    this.flags = new BN(reader.readCompactSize());

    // Read encryptToAddress as 43-byte sapling data and encode as sapling address
    const saplingData = reader.readSlice(43);
    this.encryptToZAddress = toBech32('zs', saplingData);

    // Read mandatory derivation number
    this.derivationNumber = reader.readVarInt();

    // Read optional derivation number if flag is set
    if (this.hasSecondarySeedDerivation()) {
      this.secondaryDerivationNumber = reader.readVarInt();
    }

    // Read addresses based on flags
    if (this.hasFromAddress()) {
      const CompactId = new CompactIdAddressObject();
      reader.offset = CompactId.fromBuffer(reader.buffer, reader.offset);
      this.fromAddress = CompactId;
    }

    if (this.hasToAddress()) {
      const CompactId = new CompactIdAddressObject();
      reader.offset = CompactId.fromBuffer(reader.buffer, reader.offset);
      this.toAddress = CompactId;
    }

    return reader.offset;
  }

  toJson(): AppEncryptionRequestDetailsJson {
    // Set flags before serialization
    const flags = this.calcFlags();

    return {
      version: this.version.toNumber(),
      flags: flags.toNumber(),
      encrypttozaddress: this.encryptToZAddress,
      derivationnumber: this.derivationNumber.toNumber(),
      secondaryderivationnumber: this.secondaryDerivationNumber?.toNumber(),
      fromaddress: this.fromAddress.toJson(),
      toaddress: this.toAddress.toJson()
    };
  }

  static fromJson(json: AppEncryptionRequestDetailsJson): AppEncryptionRequestDetails {
    const instance = new AppEncryptionRequestDetails();
    instance.version = new BN(json.version);
    instance.flags = new BN(json.flags);
    instance.encryptToZAddress = json.encrypttozaddress;
    instance.derivationNumber = new BN(json.derivationnumber);
    instance.secondaryDerivationNumber = json?.secondaryderivationnumber ? new BN(json.secondaryderivationnumber) : undefined;
    
    if(instance.hasFromAddress()) {
      instance.fromAddress = CompactIdAddressObject.fromJson(json?.fromaddress);
    }

    if(instance.hasToAddress()) {
      instance.toAddress = CompactIdAddressObject.fromJson(json?.toaddress);
    }
    
    return instance;
  }

}
