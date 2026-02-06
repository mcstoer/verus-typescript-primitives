
/**
 * InformationRequest - Class for handling application requests for specific user information/data
 * 
 * This class is used when an application is requesting specific information or data from the user's
 * identity or data stores. The request includes:
 * - Search data keys (VDXF keys) to identify the specific data being requested
 * - Optional specific keys within the data object for partial data requests
 * - Signer information to identify wanted signer of the data
 * - Optional statement for boundhashes in the signature
 * 
 * The user's wallet can use these parameters to locate the signed object information and present
 * it to the user for approval before sharing with the requesting application. This enables
 * selective disclosure of personal information while maintaining user privacy and control.
 * 
 * Flags determine the type and scope of the request:
 * - FULL_DATA vs PARTIAL_DATA: Whether complete objects or specific fields are requested
 * - COLLECTION: Whether multiple data objects are being requested
 * - HAS_STATEMENT: Whether the request includes an attestation statement
 * - ATTESTATION/CLAIM/CREDENTIAL: Type of verification being requested
 */

import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import varuint from '../../../utils/varuint';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { CompactIAddressObject, CompactAddressObjectJson } from '../CompactAddressObject';
import { fromBase58Check, toBase58Check } from '../../../utils/address';
import { I_ADDR_VERSION, HASH160_BYTE_LENGTH } from '../../../constants/vdxf';

export interface UserDataRequestInterface {
  version?: BigNumber;
  flags: BigNumber;
  searchDataKey: Array<{[key: string]: string}>; 
  signer?: CompactIAddressObject;
  requestedKeys?: string[];
  requestID?: CompactIAddressObject;
}

export interface UserDataRequestJson {
  version: number;
  flags: number;
  searchdatakey: Array<{[key: string]: string}>;   // ID object of the specific information requested
  signer?: CompactAddressObjectJson;
  requestedkeys?: string[]; // Specific keys within the data object being requested
  requestid?: CompactAddressObjectJson;
}

export class UserDataRequestDetails implements SerializableEntity {
  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);
  
  static HAS_REQUEST_ID = new BN(1);

  static FULL_DATA = new BN(2);
  static PARTIAL_DATA = new BN(4);
  static COLLECTION = new BN(8);

  static ATTESTATION = new BN(16);
  static CLAIM = new BN(32);
  static CREDENTIAL = new BN(64);

  static HAS_SIGNER = new BN(128);
  static HAS_REQUESTED_KEYS = new BN(256);

  version: BigNumber;
  flags: BigNumber;
  searchDataKey: Array<{[key: string]: string}>; 
  signer?: CompactIAddressObject;
  requestedKeys?: string[];
  requestID?: CompactIAddressObject;

  constructor(data?: UserDataRequestInterface) {
    this.version = data?.version || UserDataRequestDetails.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0);
    this.searchDataKey = data?.searchDataKey || [];
    this.signer = data?.signer;
    this.requestedKeys = data?.requestedKeys;
    this.requestID = data?.requestID;

    this.setFlags();
  }

  calcFlags(): BigNumber {
    let flags = new BN(0);
    if (this.requestedKeys && this.requestedKeys.length > 0) {
      flags = flags.or(UserDataRequestDetails.HAS_REQUESTED_KEYS);
    }
    if (this.signer) {
      flags = flags.or(UserDataRequestDetails.HAS_SIGNER);
    }
    if (this.requestID) {
      flags = flags.or(UserDataRequestDetails.HAS_REQUEST_ID);
    }

    return flags;
  }

  setFlags(): void {
    this.flags = this.calcFlags();
  }

  hasSigner(): boolean {
    return this.flags.and(UserDataRequestDetails.HAS_SIGNER).eq(UserDataRequestDetails.HAS_SIGNER);
  }

  hasRequestedKeys(): boolean {
    return this.flags.and(UserDataRequestDetails.HAS_REQUESTED_KEYS).eq(UserDataRequestDetails.HAS_REQUESTED_KEYS);
  }

  hasRequestID(): boolean {
    return this.flags.and(UserDataRequestDetails.HAS_REQUEST_ID).eq(UserDataRequestDetails.HAS_REQUEST_ID);
  }

  /**
   * Checks if exactly one data type flag is set (FULL_DATA, PARTIAL_DATA, or COLLECTION)
   * @returns True if exactly one data type flag is set
   */
  hasDataTypeSet(): boolean {
    const dataTypeFlags = UserDataRequestDetails.FULL_DATA.or(UserDataRequestDetails.PARTIAL_DATA).or(UserDataRequestDetails.COLLECTION);
    const setDataFlags = this.flags.and(dataTypeFlags);
    
    // Check if exactly one flag is set by verifying it's a power of 2
    return !setDataFlags.isZero() && setDataFlags.and(setDataFlags.sub(new BN(1))).isZero();
  }

  /**
   * Checks if exactly one request type flag is set (ATTESTATION, CLAIM, or CREDENTIAL)
   * @returns True if exactly one request type flag is set
   */
  hasRequestTypeSet(): boolean {
    const requestTypeFlags = UserDataRequestDetails.ATTESTATION.or(UserDataRequestDetails.CLAIM).or(UserDataRequestDetails.CREDENTIAL);
    const setRequestFlags = this.flags.and(requestTypeFlags);
    
    // Check if exactly one flag is set by verifying it's a power of 2
    return !setRequestFlags.isZero() && setRequestFlags.and(setRequestFlags.sub(new BN(1))).isZero();
  }

  isValid(): boolean {
    let valid = this.version.gte(UserDataRequestDetails.FIRST_VERSION) && this.version.lte(UserDataRequestDetails.LAST_VERSION);
    
    // Check that exactly one data type flag is set
    valid &&= this.hasDataTypeSet();
    
    // Check that exactly one request type flag is set
    valid &&= this.hasRequestTypeSet();
    
    // Check that searchDataKey is present
    valid &&= Object.keys(this.searchDataKey).length > 0;

    return valid;
  }

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.flags.toNumber());
    length += varuint.encodingLength(this.searchDataKey.length);

    for (const item of this.searchDataKey) {
      const key = Object.keys(item)[0];
      const value = item[key];
      length += HASH160_BYTE_LENGTH;
      length += varuint.encodingLength(Buffer.byteLength(value, 'utf8'));
      length += Buffer.byteLength(value, 'utf8');
    }

    if (this.hasSigner()) {
      length += this.signer.getByteLength();
    }

    if (this.hasRequestedKeys()) {
      length += varuint.encodingLength(this.requestedKeys ? this.requestedKeys.length : 0);
      if (this.requestedKeys) {
        for (const key of this.requestedKeys) {    
          length += HASH160_BYTE_LENGTH;
        }
      }
    }

    if (this.hasRequestID()) {
      length += this.requestID.getByteLength(); 
    }
    
    return length;
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
    writer.writeCompactSize(this.flags.toNumber());

    writer.writeCompactSize(this.searchDataKey.length);

    for (const item of this.searchDataKey) {
      const key = Object.keys(item)[0];
      const value = item[key];
      writer.writeSlice(fromBase58Check(key).hash); // 20-byte VDXF key
      writer.writeVarSlice(Buffer.from(value, 'utf8'));
    }

    if (this.hasSigner()) {
      writer.writeSlice(this.signer.toBuffer());
    }

    if(this.hasRequestedKeys()) {
      writer.writeCompactSize(this.requestedKeys.length);
        for (const key of this.requestedKeys) {
          writer.writeSlice(fromBase58Check(key).hash); // 20-byte VDXF key
        }    
    }

    if (this.hasRequestID()) {
      writer.writeSlice(this.requestID.toBuffer());
    }
      
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);
    this.flags = new BN(reader.readCompactSize());
    
    const searchDataKeyLength = reader.readCompactSize();    
    this.searchDataKey = [];

    for (let i = 0; i < searchDataKeyLength; i++) {
      const keyHash = reader.readSlice(HASH160_BYTE_LENGTH); // 20-byte VDXF key
      const valueBuffer = reader.readVarSlice();
      const value = valueBuffer.toString('utf8');
      const key = toBase58Check(keyHash, I_ADDR_VERSION);
      this.searchDataKey.push({ [key]: value });
    }
    
    if (this.hasSigner()) {
      const signer = new CompactIAddressObject();

      reader.offset = signer.fromBuffer(reader.buffer, reader.offset);
      this.signer = signer;
    }

    if (this.hasRequestedKeys()) {
      const requestedKeysLength = reader.readCompactSize();
      this.requestedKeys = [];
      for (let i = 0; i < requestedKeysLength; i++) {
        const keyHash = reader.readSlice(20); // 20-byte VDXF key
        const key = toBase58Check(keyHash, I_ADDR_VERSION);
        this.requestedKeys.push(key);
      }
    }

    if (this.hasRequestID()) {
      const requestID = new CompactIAddressObject();

      reader.offset = requestID.fromBuffer(reader.buffer, reader.offset);
      this.requestID = requestID;
    }

    return reader.offset;
  }

  toJson(): UserDataRequestJson {
    const flags = this.calcFlags();

    return {
      version: this.version.toNumber(),
      flags: flags.toNumber(),
      searchdatakey: this.searchDataKey,
      signer: this.signer?.toJson(),
      requestedkeys: this.requestedKeys,
      requestid: this.requestID?.toJson(),
    };
  }

  static fromJson(json: UserDataRequestJson) {
    const requestData = new UserDataRequestDetails();
    requestData.version = new BN(json.version);
    requestData.flags = new BN(json.flags);
    requestData.searchDataKey = json.searchdatakey;
    requestData.signer = json.signer ? CompactIAddressObject.fromCompactAddressObjectJson(json.signer) : undefined;
    requestData.requestedKeys = json.requestedkeys;
    requestData.requestID = json.requestid ? CompactIAddressObject.fromCompactAddressObjectJson(json.requestid) : undefined;

    return requestData;
  }
}
