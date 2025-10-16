
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


export interface RequestUserDataJson {
  version: number;
  flags: BigNumber;
  searchDatakey: {[key: string]: string};   // ID object of the specific information requested
  signer: string;
  requestedkeys?: string[]; // Specific keys within the data object being requested
  statement?: string;  
}


export class RequestUserData implements SerializableEntity {

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);
  
  static FULL_DATA = new BN(1);
  static PARTIAL_DATA = new BN(2);
  static COLLECTION = new BN(4);
  static HAS_STATEMENT = new BN(8);

  static ATTESTATION = new BN(16);
  static CLAIM = new BN(32);
  static CREDENTIAL = new BN(64);

  version: BigNumber;
  flags: BigNumber;
  searchDataKey: {[key: string]: string};
  signer: string;
  requestedKeys?: string[];
  statement?: string;  

  constructor(data?: RequestUserData) {
    this.version = data?.version || RequestUserData.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0);
    this.searchDataKey = data?.searchDataKey || {};
    this.signer = data?.signer || '';
    this.requestedKeys = data?.requestedKeys || [];
    this.statement = data?.statement;
  }

  setFlags(): void {
    this.flags = new BN(0);    
   
    if (this.statement && this.statement.length > 0) {
      this.flags = this.flags.or(RequestUserData.HAS_STATEMENT);
    }
  }

  isValid(): boolean {
    let valid = this.version.gte(RequestUserData.FIRST_VERSION) && this.version.lte(RequestUserData.LAST_VERSION);
    valid &&= (this.flags.gte(new BN(0)));
    valid &&= (Object.keys(this.searchDataKey).length > 0);
    valid &&= (this.signer.length > 0);
    return valid;
  }

  getByteLength(): number {
    let length = 0;
    length += varint.encodingLength(this.flags);

    // Serialize searchDataKey object as JSON string
    const searchDataKeyJson = Object.values(this.searchDataKey)[0];
    length += 20  // VDXF key length
    length += varuint.encodingLength(Buffer.byteLength(searchDataKeyJson, 'utf8'));
    length += Buffer.byteLength(searchDataKeyJson, 'utf8');
    
    // Add signer length
    length += varuint.encodingLength(Buffer.byteLength(this.signer, 'utf8'));
    length += Buffer.byteLength(this.signer, 'utf8');
    
    length += varuint.encodingLength(this.requestedKeys ? this.requestedKeys.length : 0);
    if (this.requestedKeys) {
      for (const key of this.requestedKeys) {    
        length += 20  // VDXF key length 
      }
    }
    
    // Add statement length if present
    if (this.statement && this.statement.length > 0) {
      length += varuint.encodingLength(Buffer.byteLength(this.statement, 'utf8'));
      length += Buffer.byteLength(this.statement, 'utf8');
    }
    
    return length;
  }

  toBuffer(): Buffer {
    // Set flags before serialization
    this.setFlags();
    
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
    writer.writeVarInt(this.flags);
    
    // Write searchDataKey - write VDXF key and value
    const firstKey = Object.keys(this.searchDataKey)[0];
    const firstValue = this.searchDataKey[firstKey];
    writer.writeSlice(Buffer.from(firstKey, 'hex')); // 20-byte VDXF key
    writer.writeVarSlice(Buffer.from(firstValue, 'utf8'));
    
    // Write signer
    writer.writeVarSlice(Buffer.from(this.signer, 'utf8'));
    
    writer.writeCompactSize(this.requestedKeys ? this.requestedKeys.length : 0);
    if (this.requestedKeys) {
      for (const key of this.requestedKeys) {
        writer.writeSlice(Buffer.from(key, 'hex')); // 20-byte VDXF key
      }
    }
    
    // Write statement if flag is set
    if (this.flags.and(RequestUserData.HAS_STATEMENT).gt(new BN(0))) {
      writer.writeVarSlice(Buffer.from(this.statement, 'utf8'));
    }
    
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);
    this.flags = reader.readVarInt();
    
    // Read searchDataKey - read VDXF key and value
    const vdxfKey = reader.readSlice(20).toString('hex'); // 20-byte VDXF key
    const value = reader.readVarSlice().toString('utf8');
    this.searchDataKey = { [vdxfKey]: value };
    
    // Read signer
    this.signer = reader.readVarSlice().toString('utf8');
    
    this.requestedKeys = [];
    const requestedKeysLength = reader.readCompactSize();
    for (let i = 0; i < requestedKeysLength; i++) {
      this.requestedKeys.push(reader.readSlice(20).toString('hex')); // 20-byte VDXF key
    }
    
    // Read statement if flag is set
    if (this.flags.and(RequestUserData.HAS_STATEMENT).gt(new BN(0))) {
      this.statement = reader.readVarSlice().toString('utf8');
    }
    
    return reader.offset;
  }

  toJSON(): RequestUserDataJson {
    // Set flags before serialization
    this.setFlags();
    
    return {
      version: this.version.toNumber(),
      flags: this.flags,
      searchDatakey: this.searchDataKey,
      signer: this.signer,
      requestedkeys: this.requestedKeys,
      statement: this.statement
    };
  }

  fromJSON(json: RequestUserDataJson): void {
    this.version = new BN(json.version);
    this.flags = json.flags;
    this.searchDataKey = json.searchDatakey;
    this.signer = json.signer;
    this.requestedKeys = json.requestedkeys || [];
    this.statement = json.statement;
  }
}
