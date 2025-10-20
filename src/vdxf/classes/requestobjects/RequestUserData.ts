
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
import varint from '../../../utils/varint';
import varuint from '../../../utils/varuint';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { CompactIdAddressObject, CompactIdAddressObjectJson } from '../CompactIdAddressObject';
import { fromBase58Check, toBase58Check } from '../../../utils/address';

export interface RequestUserDataInterface {
  version?: BigNumber;
  flags: BigNumber;
  searchDataKey: Array<{[key: string]: string}>; 
  signer?: CompactIdAddressObject;
  requestedKeys?: string[];
}

export interface RequestUserDataJson {
  version: number;
  flags: number;
  searchdatakey: Array<{[key: string]: string}>;   // ID object of the specific information requested
  signer?: CompactIdAddressObjectJson;
  requestedkeys?: string[]; // Specific keys within the data object being requested
}

export class RequestUserData implements SerializableEntity {

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);
  
  static FULL_DATA = new BN(1);
  static PARTIAL_DATA = new BN(2);
  static COLLECTION = new BN(4);

  static ATTESTATION = new BN(8);
  static CLAIM = new BN(16);
  static CREDENTIAL = new BN(32);

  static HAS_SIGNER = new BN(64);
  static HAS_REQUESTED_KEYS = new BN(128);

  version: BigNumber;
  flags: BigNumber;
  searchDataKey: Array<{[key: string]: string}>; 
  signer?: CompactIdAddressObject;
  requestedKeys?: string[];

  constructor(data?: RequestUserDataInterface) {
    this.version = data?.version || RequestUserData.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0);
    this.searchDataKey = data?.searchDataKey || [];
    this.signer = data?.signer;
    this.requestedKeys = data?.requestedKeys;

  }

  setFlags(): void {
    // Initialize flags if not already a BigNumber
    if (!BN.isBN(this.flags)) {
      this.flags = new BN(0);
    }

    if (this.requestedKeys && this.requestedKeys.length > 0) {
      this.flags = this.flags.or(RequestUserData.HAS_REQUESTED_KEYS);
    }

    if (this.signer) {
      this.flags = this.flags.or(RequestUserData.HAS_SIGNER);
    }
  }

  hasSigner(): boolean {
    return this.flags.and(RequestUserData.HAS_SIGNER).eq(RequestUserData.HAS_SIGNER);
  }

  hasRequestedKeys(): boolean {
    return this.flags.and(RequestUserData.HAS_REQUESTED_KEYS).eq(RequestUserData.HAS_REQUESTED_KEYS);
  }

  /**
   * Checks if exactly one data type flag is set (FULL_DATA, PARTIAL_DATA, or COLLECTION)
   * @returns True if exactly one data type flag is set
   */
  hasDataTypeSet(): boolean {
    const dataTypeFlags = RequestUserData.FULL_DATA.or(RequestUserData.PARTIAL_DATA).or(RequestUserData.COLLECTION);
    const setDataFlags = this.flags.and(dataTypeFlags);
    
    // Check if exactly one flag is set by verifying it's a power of 2
    return !setDataFlags.isZero() && setDataFlags.and(setDataFlags.sub(new BN(1))).isZero();
  }

  /**
   * Checks if exactly one request type flag is set (ATTESTATION, CLAIM, or CREDENTIAL)
   * @returns True if exactly one request type flag is set
   */
  hasRequestTypeSet(): boolean {
    const requestTypeFlags = RequestUserData.ATTESTATION.or(RequestUserData.CLAIM).or(RequestUserData.CREDENTIAL);
    const setRequestFlags = this.flags.and(requestTypeFlags);
    
    // Check if exactly one flag is set by verifying it's a power of 2
    return !setRequestFlags.isZero() && setRequestFlags.and(setRequestFlags.sub(new BN(1))).isZero();
  }

  isValid(): boolean {
    let valid = this.version.gte(RequestUserData.FIRST_VERSION) && this.version.lte(RequestUserData.LAST_VERSION);
    
    // Check that exactly one data type flag is set
    valid &&= this.hasDataTypeSet();
    
    // Check that exactly one request type flag is set
    valid &&= this.hasRequestTypeSet();
    
    // Check that searchDataKey is present
    valid &&= Object.keys(this.searchDataKey).length > 0;

    return valid;
  }

  getByteLength(): number {
    
    this.setFlags();
    let length = 0;
    
    length += varint.encodingLength(this.flags);
    length += varuint.encodingLength(this.searchDataKey.length);

    for (const item of this.searchDataKey) {
      const key = Object.keys(item)[0];
      const value = item[key];
      length += 20  // VDXF key length
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
          length += 20  // VDXF key length 
        }
      }
    }
    
    return length;
  }

  toBuffer(): Buffer {
    // Set flags before serialization
    this.setFlags();
    
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
    writer.writeVarInt(this.flags);

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
    
      
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);
    this.flags = reader.readVarInt();
    
    const searchDataKeyLength = reader.readCompactSize();    
    this.searchDataKey = [];

    for (let i = 0; i < searchDataKeyLength; i++) {
      const keyHash = reader.readSlice(20); // 20-byte VDXF key
      const valueBuffer = reader.readVarSlice();
      const value = valueBuffer.toString('utf8');
      const key = toBase58Check(keyHash, 102);
      this.searchDataKey.push({ [key]: value });
    }
    
    if (this.hasSigner()) {
      const signer = new CompactIdAddressObject();

      reader.offset = signer.fromBuffer(reader.buffer, reader.offset);
      this.signer = signer;
    }

    if (this.hasRequestedKeys()) {
      const requestedKeysLength = reader.readCompactSize();
      this.requestedKeys = [];
      for (let i = 0; i < requestedKeysLength; i++) {
        const keyHash = reader.readSlice(20); // 20-byte VDXF key
        const key = toBase58Check(keyHash, 102);
        this.requestedKeys.push(key);
      }
    }

    return reader.offset;
  }

  toJSON(): RequestUserDataJson {
    // Set flags before serialization
    this.setFlags();

    return {
      version: this.version.toNumber(),
      flags: this.flags.toNumber(),
      searchdatakey: this.searchDataKey,
      signer: this.signer.toJson(),
      requestedkeys: this.requestedKeys
    };
  }

  static fromJson(json: RequestUserDataJson) {

    const requestData = new RequestUserData();
    requestData.version = new BN(json.version);
    requestData.flags = new BN(json.flags);
    requestData.searchDataKey = json.searchdatakey;
    requestData.signer = json.signer ? CompactIdAddressObject.fromJson(json.signer) : undefined;
    requestData.requestedKeys = json.requestedkeys;

    return requestData;
  }

}
