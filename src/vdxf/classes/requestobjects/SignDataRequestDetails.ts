/**
 * SignDataRequestDetails - Class for handling application requests for data signing
 * 
 * This class is used when an application is requesting the user to sign specific data objects
 * or documents. The request includes:
 * - Signable objects containing the data to be signed
 * - Optional signer identity specification
 * - Search data keys to identify specific data objects
 * - Optional requested keys for partial data signing
 * 
 * The user's wallet can use these parameters to present the data to be signed to the user,
 * allowing them to review the content before providing their digital signature. This enables
 * secure, user-controlled document and data signing with clear visibility into what is
 * being signed and by which identity.
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
import { DataDescriptor, MMRDescriptor } from '../../../pbaas';

export interface SignDataRequestDetailsJson {
  version: number;
  flags: number;
  signableobjects: Array<{[key: string]: string}>;   // Array of signable data objects
  signer?: CompactIdAddressObjectJson;
}

export type SignRequestSignableObjects = Credential | MMRDescriptor | DataDescriptor | string;

export class SignDataRequestDetails implements SerializableEntity {

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);
  
  // types of data to sign
  static CREDENTIAL = new BN(1);
  static MMR_DESCRIPTOR = new BN(2);
  static DATA_DESCRIPTOR = new BN(4);
  static JSON_DATA = new BN(8);

  // flags for optional data
  static HAS_SIGNER = new BN(8);

  version: BigNumber;
  flags: BigNumber;
  signableObjects: Array<SignRequestSignableObjects>;
  requestedSigner?: CompactIdAddressObject;

  constructor(data?: SignDataRequestDetails) {
    this.version = data?.version || SignDataRequestDetails.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0);
    this.signableObjects = data?.signableObjects || [];
    this.signer = data?.signer; 
  }

  setFlags(): void {
    // Initialize flags if not already a BigNumber
    if (!BN.isBN(this.flags)) {
      this.flags = new BN(0);
    }

  }

  hasSigner(): boolean {
    return this.flags.and(SignDataRequestDetails.HAS_SIGNER).eq(SignDataRequestDetails.HAS_SIGNER);
  }

  /**
   * Checks if exactly one data type flag is set (FULL_DATA, PARTIAL_DATA, or COLLECTION)
   * @returns True if exactly one data type flag is set
   */
  hasDataTypeSet(): boolean {
    const dataTypeFlags = SignDataRequestDetails.FULL_DATA
      .or(SignDataRequestDetails.PARTIAL_DATA)
      .or(SignDataRequestDetails.COLLECTION);
    const setDataFlags = this.flags.and(dataTypeFlags);
    
    // Check if exactly one flag is set by verifying it's a power of 2
    return !setDataFlags.isZero() && setDataFlags.and(setDataFlags.sub(new BN(1))).isZero();
  }

  isValid(): boolean {
    let valid = this.version.gte(SignDataRequestDetails.FIRST_VERSION) && 
                this.version.lte(SignDataRequestDetails.LAST_VERSION);
    
    // Check that exactly one data type flag is set
    valid &&= this.hasDataTypeSet();
    
    // Check that we have signable objects
    valid &&= this.signableObjects.length > 0;

    return valid;
  }

  getByteLength(): number {
    this.setFlags();
    let length = 0;

    length += varint.encodingLength(this.flags);

    // Add length for signableObjects array
    length += varuint.encodingLength(this.signableObjects.length);
    
    for (const obj of this.signableObjects) {
      // Each object: VDXF key (20 bytes) + value length + value
      const firstKey = Object.keys(obj)[0];
      const firstValue = obj[firstKey];
      length += 20; // VDXF key length
      length += varuint.encodingLength(Buffer.byteLength(firstValue, 'utf8'));
      length += Buffer.byteLength(firstValue, 'utf8');
    }

    // Add signer length if present
    if (this.hasSigner() && this.signer) {
      length += this.signer.getByteLength();
    }

    return length;
  }

  toBuffer(): Buffer {
    this.setFlags();
    
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
    
    writer.writeVarInt(this.flags);

    // Write signableObjects array
    writer.writeCompactSize(this.signableObjects.length);
    
    for (const obj of this.signableObjects) {
      const firstKey = Object.keys(obj)[0];
      const firstValue = obj[firstKey];
      writer.writeSlice(Buffer.from(firstKey, 'hex')); // 20-byte VDXF key
      writer.writeVarSlice(Buffer.from(firstValue, 'utf8'));
    }

    // Write signer if present
    if (this.hasSigner() && this.signer) {
      writer.writeSlice(this.signer.toBuffer());
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);
    
    this.flags = reader.readVarInt();

    // Read signableObjects array
    const objectCount = reader.readCompactSize();
    this.signableObjects = [];
    
    for (let i = 0; i < objectCount; i++) {
      const vdxfKey = reader.readSlice(20).toString('hex'); // 20-byte VDXF key
      const value = reader.readVarSlice().toString('utf8');
      this.signableObjects.push({ [vdxfKey]: value });
    }

    // Read signer if flag is set
    if (this.hasSigner()) {
      this.signer = new CompactIdAddressObject();
      reader.offset = this.signer.fromBuffer(buffer, reader.offset);
    }

    return reader.offset;
  }

  toJSON(): SignDataRequestDetailsJson {
    this.setFlags();
    
    return {
      version: this.version.toNumber(),
      flags: this.flags.toNumber(),
      signableobjects: this.signableObjects,
      signer: this.signer?.toJson()
    };
  }

  static fromJSON(json: SignDataRequestDetailsJson): SignDataRequestDetails {
    const instance = new SignDataRequestDetails();
    instance.version = new BN(json.version);
    instance.flags = new BN(json.flags);
    instance.signableObjects = json.signableobjects || [];
    instance.signer = json.signer ? CompactIdAddressObject.fromJson(json.signer) : undefined;
    return instance;
  }
}