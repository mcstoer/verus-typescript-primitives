
/**
 * AppEncryptionRequestDetails - Class for handling application requests for encrypted derived seeds
 * 
 * This class is used when an application is requesting an encrypted derived seed from the user's master seed,
 * using specific parameters passed by the application. The request includes:
 * - App or delegated ID making the request (mandatory)
 * - A target encryption key (zaddress format) for encrypting the reply
 * - Derivation number for seed generation
 * - Optional derivation ID (defaults to Z-address from ID signing if not present)
 * - Optional request ID for tracking
 * 
 * The user's wallet can use these parameters to derive a specific seed from their master seed
 * and encrypt it using the provided encryption key, ensuring the application receives only
 * the specific derived seed it needs without exposing the master seed.
 * 
 * The RETURN_ESK flag can be set to signal that the Extended Spending Key should be returned.
 */

import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;
import { decodeSaplingAddress, toBech32 } from '../../../utils/sapling';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { CompactIAddressObject, CompactAddressObjectJson } from '../CompactAddressObject';
import varuint from '../../../utils/varuint';
import { fromBase58Check, toBase58Check } from '../../../utils/address';
import { I_ADDR_VERSION, HASH160_BYTE_LENGTH } from '../../../constants/vdxf';

export interface AppEncryptionRequestInterface {
  version?: BigNumber;
  flags: BigNumber;
  encryptToZAddress: string;
  derivationNumber: BigNumber;
  derivationID?: CompactIAddressObject;
  requestID?: string;
}

export interface AppEncryptionRequestJson {
  version: number;
  flags: number;
  encrypttozaddress: string;
  derivationnumber: number;
  derivationid?: CompactAddressObjectJson;
  requestid?: string;
}

/**
 * Checks if a string is a valid hexadecimal address
 * @param flags - Optional flags for the request
 * @flag HAS_REQUEST_ID - Indicates if a request ID is included
 * 
 * @param encryptToZAddress - The encryption key to use for encrypting to
 * @param derivationNumber - The derivation number to validate
 */

export class AppEncryptionRequestDetails implements SerializableEntity {
  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  static HAS_DERIVATION_ID = new BN(1);
  static HAS_REQUEST_ID = new BN(2);
  static RETURN_ESK = new BN(4); //flag to signal to return the Extended Spending Key

  version: BigNumber;
  flags: BigNumber;
  encryptToZAddress: string;                  // zaddress reply is encrypted to
  derivationNumber: BigNumber;
  derivationID?: CompactIAddressObject;      // Defaults to choosing the Z-address from the ID signing if not present
  requestID?: string;                         // Unique identifier for the request

  constructor(data?: AppEncryptionRequestInterface) {
    this.version = data?.version || AppEncryptionRequestDetails.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0);
    this.encryptToZAddress = data?.encryptToZAddress || '';
    this.derivationNumber = data?.derivationNumber || new BN(0);
    this.derivationID = data?.derivationID;
    this.requestID = data?.requestID;

    this.setFlags();
  }

  setFlags(): void {
    this.flags = this.calcFlags();
  }

  calcFlags(): BigNumber {
    let flags = new BN(0);

    if (this.derivationID != null) {
      flags = flags.or(AppEncryptionRequestDetails.HAS_DERIVATION_ID);
    }

    if (this.requestID != null) {
      flags = flags.or(AppEncryptionRequestDetails.HAS_REQUEST_ID);
    }

    return flags;
  }

  isValid(): boolean {
    let valid = true;
    valid &&= this.encryptToZAddress != null && this.encryptToZAddress.length > 0;
    valid &&= this.derivationNumber != null && this.derivationNumber.gte(new BN(0));

    return valid;
  }

  hasDerivationID(flags: BigNumber = this.flags): boolean {
    return flags.and(AppEncryptionRequestDetails.HAS_DERIVATION_ID).gt(new BN(0));
  }

  hasRequestID(flags: BigNumber = this.flags): boolean {
    return flags.and(AppEncryptionRequestDetails.HAS_REQUEST_ID).gt(new BN(0));
  }

  getByteLength(): number {

    const flags = this.calcFlags();

    let length = 0;

    length += varuint.encodingLength(flags.toNumber());

    // encryptToKey - zaddress encoding (43 bytes for sapling address data)
    length += 43; // Sapling address decoded data (11 + 32 bytes)

    length += varuint.encodingLength(this.derivationNumber.toNumber());

    if (this.hasDerivationID(flags)) {
      length += this.derivationID.getByteLength();
    }

    if (this.hasRequestID(flags)) {
      length += HASH160_BYTE_LENGTH;
    }

    return length;
  }

  toBuffer(): Buffer {
    const flags = this.calcFlags();
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    // Write flags
    writer.writeCompactSize(flags.toNumber());

    // Write encryptToAddress as decoded sapling address data
    const saplingData = decodeSaplingAddress(this.encryptToZAddress);
    writer.writeSlice(Buffer.concat([saplingData.d, saplingData.pk_d]));

    // Write mandatory derivation number
    writer.writeVarInt(this.derivationNumber);

    if (this.hasDerivationID(flags)) {
      writer.writeSlice(this.derivationID.toBuffer());
    }

    if (this.hasRequestID(flags)) {

      writer.writeSlice(fromBase58Check(this.requestID).hash);
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

    if (this.hasDerivationID()) {
      const derivationIDObj = new CompactIAddressObject();
      reader.offset = derivationIDObj.fromBuffer(reader.buffer, reader.offset);
      this.derivationID = derivationIDObj;
    }

    if (this.hasRequestID()) {
      this.requestID = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
    }

    return reader.offset;
  }

  toJson(): AppEncryptionRequestJson {
    // Set flags before serialization
    const flags = this.calcFlags();

    return {
      version: this.version.toNumber(),
      flags: flags.toNumber(),
      encrypttozaddress: this.encryptToZAddress,
      derivationnumber: this.derivationNumber.toNumber(),
      derivationid: this.derivationID?.toJson(),
      requestid: this.requestID
    };
  }

  static fromJson(json: AppEncryptionRequestJson): AppEncryptionRequestDetails {
    const instance = new AppEncryptionRequestDetails();
    instance.version = new BN(json.version);
    instance.flags = new BN(json.flags);
    instance.encryptToZAddress = json.encrypttozaddress;
    instance.derivationNumber = new BN(json.derivationnumber);
    
    if(instance.hasDerivationID()) {
      instance.derivationID = CompactIAddressObject.fromCompactAddressObjectJson(json?.derivationid);
    }
    
    if(instance.hasRequestID()) {
      instance.requestID = json?.requestid;
    }
    
    return instance;
  }
}
