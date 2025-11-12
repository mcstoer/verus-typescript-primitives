/**
 * PersonalUserDataDetails - Class for handling personal user data transfer requests
 * 
 * This class is used when an application is requesting to transfer or receive personal
 * user data. The request includes:
 * - Data objects as DataDescriptor instances containing the user's personal data
 * - Optional statements array for additional context or transfer conditions
 * - Optional signature data for verification of the transfer
 * - Flags indicating transfer direction and optional components
 * 
 * The user's wallet can use these parameters to present the data transfer request
 * to the user, showing what personal data is being transferred, any associated
 * statements or conditions, and whether it's for the user's signature or being
 * transmitted to/from the user. This enables secure, user-controlled personal
 * data sharing with clear visibility into what data is being transferred.
 */

import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import varuint from '../../../utils/varuint';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { DataDescriptor, DataDescriptorJson } from '../../../pbaas';
import { VerifiableSignatureData, VerifiableSignatureDataJson } from '../../../vdxf/classes/VerifiableSignatureData';

export interface PersonalUserDataDetailsInterface {
  version?: BigNumber;
  flags: BigNumber;
  signableObjects: Array<DataDescriptor>;
  statements?: Array<string>;
  signature?: VerifiableSignatureData;
}

export interface PersonalUserDataDetailsJson {
  version: number;
  flags: number;
  signableobjects: Array<DataDescriptorJson>;   // Array of signable data objects
  statements?: Array<string>;
  signature?: VerifiableSignatureDataJson
}

export class PersonalUserDataDetails implements SerializableEntity {
  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  // types of data to sign
  static HAS_STATEMENTS = new BN(1);
  static HAS_SIGNATURE = new BN(2);
  static FOR_USERS_SIGNATURE = new BN(4);
  static FOR_TRANSMITTAL_TO_USER = new BN(8);
  static HAS_URL_FOR_DOWNLOAD = new BN(16);

  version: BigNumber;
  flags: BigNumber;
  signableObjects: Array<DataDescriptor>;
  statements?: Array<string>;
  signature?: VerifiableSignatureData;

  constructor(data?: PersonalUserDataDetailsInterface) {
    this.version = data?.version || PersonalUserDataDetails.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0);
    this.signableObjects = data?.signableObjects || [];
    this.statements = data?.statements || [];
    this.signature = data?.signature || undefined;

    this.setFlags();
  }

  setFlags(): void {  
    this.flags = this.calcFlags();
  }

  calcFlags(): BigNumber {
    let flags = new BN(0);
    
    if (this.statements && this.statements.length > 0) {
      flags = flags.or(PersonalUserDataDetails.HAS_STATEMENTS);
    }

    if (this.signature ) {
      flags = flags.or(PersonalUserDataDetails.HAS_SIGNATURE);
    }

    return flags;
  }

  hasStatements(): boolean {
    return this.flags.and(PersonalUserDataDetails.HAS_STATEMENTS).eq(PersonalUserDataDetails.HAS_STATEMENTS);
  }

  hasSignature(): boolean {
    return this.flags.and(PersonalUserDataDetails.HAS_SIGNATURE).eq(PersonalUserDataDetails.HAS_SIGNATURE);
  }

  isValid(): boolean {
    let valid = this.version.gte(PersonalUserDataDetails.FIRST_VERSION) &&
      this.version.lte(PersonalUserDataDetails.LAST_VERSION);

    // Check that we have signable objects
    valid &&= this.signableObjects.length > 0;
    if (this.hasStatements()) {
      valid &&= this.statements !== undefined && this.statements.length > 0;
    }

    if (this.hasSignature()) {
      valid &&= this.signature !== undefined; // TODO: && this.signature.isValid();
    }

    return valid;
  }

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.flags.toNumber());

    // Add length for signableObjects array
    length += varuint.encodingLength(this.signableObjects.length);

    for (const obj of this.signableObjects) {

      length += obj.getByteLength();
    }

    // Add signer length if present
    if (this.hasStatements()) {
      length += varuint.encodingLength(this.statements.length);
      for (const stmt of this.statements) {
        length += varuint.encodingLength(Buffer.byteLength(stmt, 'utf8'));
        length += Buffer.byteLength(stmt, 'utf8');
      }
    }
    if (this.hasSignature() && this.signature) {
      length += this.signature.getByteLength();
    }

    return length;
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeCompactSize(this.flags.toNumber());

    // Write signableObjects array
    writer.writeCompactSize(this.signableObjects.length);

    for (const obj of this.signableObjects) {
      writer.writeSlice(obj.toBuffer());
    }

    // Write statements if present    
    if (this.hasStatements()) {
      writer.writeCompactSize(this.statements.length);
      for (const stmt of this.statements) {
        writer.writeVarSlice(Buffer.from(stmt, 'utf8'));
      }
    }

    if (this.hasSignature() && this.signature) {
      writer.writeSlice(this.signature.toBuffer());
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);

    this.flags = new BN(reader.readCompactSize());

    // Read signableObjects array
    const objectCount = reader.readCompactSize();
    this.signableObjects = [];

    for (let i = 0; i < objectCount; i++) {
      const obj = new DataDescriptor();
      reader.offset = obj.fromBuffer(reader.buffer, reader.offset);
      this.signableObjects.push(obj);
    }

    // Read statements if flag is set
    if (this.hasStatements()) {
      this.statements = [];
      const statementCount = reader.readCompactSize();
      for (let i = 0; i < statementCount; i++) {
        const stmt = reader.readVarSlice().toString('utf8');
        this.statements.push(stmt);
      }
    }

    if (this.hasSignature()) {
      const signature = new VerifiableSignatureData();
      reader.offset = signature.fromBuffer(reader.buffer, reader.offset);
      this.signature = signature;
    }

    return reader.offset;
  }

  toJson(): PersonalUserDataDetailsJson {
    const flags = this.calcFlags();

    return {
      version: this.version.toNumber(),
      flags: flags.toNumber(),
      signableobjects: this.signableObjects.map(obj => obj.toJson()),
      statements: this.statements,
      signature: this.signature ? this.signature.toJson() : undefined
    };
  }

  static fromJson(json: PersonalUserDataDetailsJson): PersonalUserDataDetails {
    const instance = new PersonalUserDataDetails();
    instance.version = new BN(json.version);
    instance.flags = new BN(json.flags);

    const dataDescriptorObjects: Array<DataDescriptor> = [];

    for (const objJson of json.signableobjects) {
      const dataDescriptor = DataDescriptor.fromJson(objJson);
      dataDescriptorObjects.push(dataDescriptor);
    }
    
    instance.signableObjects = dataDescriptorObjects;
    instance.statements = json.statements || [];
    instance.signature = json.signature ? VerifiableSignatureData.fromJson(json.signature) : undefined;
    return instance;
  }
}