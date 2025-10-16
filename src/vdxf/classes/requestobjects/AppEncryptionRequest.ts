
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


export interface AppEncryptionRequestDetailsInterface {
  flags: BigNumber;
  encryptToKey: string;
  derivationNumber: BigNumber;
  optionalDerivationNumber?: BigNumber;
  fromAddress?: TransferDestination;
  toAddress?: TransferDestination;
}

export interface AppEncryptionRequestDetailsJson {
  flags: number;
  encryptToKey: string;
  derivationnumber: number;
  optionalderivationnumber?: number;
  fromaddress?: TransferDestinationJson;
  toaddress?: TransferDestinationJson;
}


export class AppEncryptionRequestDetails implements SerializableEntity {

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  static HAS_FROM_ADDRESS = new BN(1);
  static HAS_TO_ADDRESS = new BN(2);
  static BOTH_ADDRESSES = new BN(4);
  static HAS_OPTIONAL_SEED_DERIVATION = new BN(8);

  version: BigNumber = AppEncryptionRequestDetails.DEFAULT_VERSION;
  flags: BigNumber;
  encryptToKey: string;
  derivationNumber: BigNumber;
  optionalDerivationNumber?: BigNumber;
  fromAddress?: TransferDestination;
  toAddress?: TransferDestination;

  constructor(data?: AppEncryptionRequestDetailsInterface) {
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
    
    if (this.fromAddress != null && this.toAddress != null) {
      this.flags = this.flags.or(AppEncryptionRequestDetails.BOTH_ADDRESSES);
    } else if (this.fromAddress != null) {
      this.flags = this.flags.or(AppEncryptionRequestDetails.HAS_FROM_ADDRESS);
    } else if (this.toAddress != null) {
      this.flags = this.flags.or(AppEncryptionRequestDetails.HAS_TO_ADDRESS);
    }
  }

  isValid(): boolean {
    let valid = this.encryptToKey != null && this.encryptToKey.length > 0;
    valid &&= this.derivationNumber != null && this.derivationNumber.gte(new BN(0));
    valid &&= this.optionalDerivationNumber == null || this.optionalDerivationNumber.gte(new BN(0));

    return valid;
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    // encryptToKey - zaddress encoding (43 bytes for sapling address data)
    length += 43; // Sapling address decoded data (11 + 32 bytes)
    
    length += varint.encodingLength(this.derivationNumber);

    if(this.flags.and(AppEncryptionRequestDetails.HAS_OPTIONAL_SEED_DERIVATION).gt(new BN(0))) {
      length += varint.encodingLength(this.optionalDerivationNumber);
    }

    if (this.flags.and(AppEncryptionRequestDetails.HAS_FROM_ADDRESS).gt(new BN(0)) || 
        this.flags.and(AppEncryptionRequestDetails.BOTH_ADDRESSES).gt(new BN(0))) {
      length += this.fromAddress!.getByteLength();
    } 
    
    if (this.flags.and(AppEncryptionRequestDetails.HAS_TO_ADDRESS).gt(new BN(0)) || 
        this.flags.and(AppEncryptionRequestDetails.BOTH_ADDRESSES).gt(new BN(0))) {
      length += this.toAddress!.getByteLength();
    }

    return length;
  }  toBuffer(): Buffer {
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
    if (this.flags.and(AppEncryptionRequestDetails.HAS_OPTIONAL_SEED_DERIVATION).gt(new BN(0))) {
      writer.writeVarInt(this.optionalDerivationNumber);
    }

    // Write addresses based on flags
    if (this.flags.and(AppEncryptionRequestDetails.HAS_FROM_ADDRESS).gt(new BN(0)) || 
        this.flags.and(AppEncryptionRequestDetails.BOTH_ADDRESSES).gt(new BN(0))) {
      writer.writeSlice(this.fromAddress!.toBuffer());
    }
    
    if (this.flags.and(AppEncryptionRequestDetails.HAS_TO_ADDRESS).gt(new BN(0)) || 
        this.flags.and(AppEncryptionRequestDetails.BOTH_ADDRESSES).gt(new BN(0))) {
      writer.writeSlice(this.toAddress!.toBuffer());
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
    if (this.flags.and(AppEncryptionRequestDetails.HAS_OPTIONAL_SEED_DERIVATION).gt(new BN(0))) {
      this.optionalDerivationNumber = reader.readVarInt();
    }

    // Read addresses based on flags
    if (this.flags.and(AppEncryptionRequestDetails.HAS_FROM_ADDRESS).gt(new BN(0)) || 
        this.flags.and(AppEncryptionRequestDetails.BOTH_ADDRESSES).gt(new BN(0))) {
      this.fromAddress = new TransferDestination();
      reader.offset = this.fromAddress.fromBuffer(buffer, reader.offset);
    }
    
    if (this.flags.and(AppEncryptionRequestDetails.HAS_TO_ADDRESS).gt(new BN(0)) || 
        this.flags.and(AppEncryptionRequestDetails.BOTH_ADDRESSES).gt(new BN(0))) {
      this.toAddress = new TransferDestination();
      reader.offset = this.toAddress.fromBuffer(buffer, reader.offset);
    }

    return reader.offset;
  }

  toJSON(): AppEncryptionRequestDetailsJson {
    // Set flags before serialization
    this.setFlags();
    
    return {
      flags: this.flags.toNumber(),
      encryptToKey: this.encryptToKey,
      derivationnumber: this.derivationNumber.toNumber(),
      optionalderivationnumber: this.optionalDerivationNumber?.toNumber(),
      fromaddress: this.fromAddress?.toJson(),
      toaddress: this.toAddress?.toJson()
    };
  }

  static fromJSON(json: AppEncryptionRequestDetailsJson): AppEncryptionRequestDetails {
    return new AppEncryptionRequestDetails({
      flags: new BN(json.flags),
      encryptToKey: json.encryptToKey,
      derivationNumber: new BN(json.derivationnumber),
      optionalDerivationNumber: json.optionalderivationnumber ? new BN(json.optionalderivationnumber) : undefined,
      fromAddress: json.fromaddress ? TransferDestination.fromJson(json.fromaddress) : undefined,
      toAddress: json.toaddress ? TransferDestination.fromJson(json.toaddress) : undefined
    });
  }

}
