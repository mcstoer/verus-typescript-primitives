import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import varint from '../../../utils/varint';
import varuint from '../../../utils/varuint';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;

import { SerializableEntity } from '../../../utils/types/SerializableEntity';


export enum RequestedFormatFlags{
  FULL_DATA = 1,    // Whole Credential
  PARTIAL_DATA = 2, // Particular leaf + proof + signature
  COLLECTION = 4    // Multiple FULL_DATA only
}

export enum InformationType {
  ATTESTATION = 1,
  CLAIM = 2,
  CREDENTIAL = 3
}

export interface RequestItemJson {
  version: number;
  format: RequestedFormatFlags;
  type: InformationType;
  id: {[key: string]: string};   // ID object of the specific information requested
  signer: string;
  requestedkeys?: string[];
}


export class RequestItem implements SerializableEntity {

  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);
  
  static FULL_DATA = new BN(1);
  static PARTIAL_DATA = new BN(2);
  static COLLECTION = new BN(4);

  static ATTESTATION = new BN(1);
  static CLAIM = new BN(2);
  static CREDENTIAL = new BN(3);

  version: BigNumber;
  format: BigNumber;
  type: BigNumber;
  id: {[key: string]: string};
  signer: string;
  requestedkeys?: string[];

  constructor(json?: RequestItem) {
    this.version = json?.version || RequestItem.DEFAULT_VERSION;
    this.format = json?.format || RequestItem.FULL_DATA;
    this.type = json?.type || RequestItem.ATTESTATION;
    this.id = json?.id || {};
    this.signer = json?.signer || '';
    this.requestedkeys = json?.requestedkeys || [];
  }

  isFormatValid(): boolean {
    // Allowed values: 1 (FULL), 2 (PARTIAL), 5 (FULL|COLLECTION), 6 (PARTIAL|COLLECTION)
    const f = this.format;
    return (
      f.eq(RequestItem.FULL_DATA) ||
      f.eq(RequestItem.PARTIAL_DATA) ||
      f.eq(RequestItem.FULL_DATA.or(RequestItem.COLLECTION)) ||
      f.eq(RequestItem.PARTIAL_DATA.or(RequestItem.COLLECTION))
    );
  }

  isValid(): boolean {
    let valid = this.version.gte(RequestItem.FIRST_VERSION) && this.version.lte(RequestItem.LAST_VERSION);
    valid &&= this.isFormatValid();
    valid &&= (this.type.gte(RequestItem.ATTESTATION) && this.type.lte(RequestItem.CREDENTIAL));
    return valid;
  }

  getByteLength(): number {
    let length = 0;
    length += varint.encodingLength(this.format);
    length += varint.encodingLength(this.type);
    
    // Serialize id object as JSON string
    const idJson = JSON.stringify(this.id);
    length += varuint.encodingLength(Buffer.byteLength(idJson, 'utf8'));
    length += Buffer.byteLength(idJson, 'utf8');
    
    // Add signer length
    length += varuint.encodingLength(Buffer.byteLength(this.signer, 'utf8'));
    length += Buffer.byteLength(this.signer, 'utf8');
    
    length += varuint.encodingLength(this.requestedkeys ? this.requestedkeys.length : 0);
    if (this.requestedkeys) {
      for (const key of this.requestedkeys) {    
        length += varuint.encodingLength(Buffer.byteLength(key, 'utf8'));    
        length += Buffer.byteLength(key, 'utf8');
      }
    }
    return length;
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
    writer.writeVarInt(this.format);
    writer.writeVarInt(this.type);
    
    // Serialize id object as JSON string
    const idJson = JSON.stringify(this.id);
    writer.writeVarSlice(Buffer.from(idJson, 'utf8'));
    
    // Write signer
    writer.writeVarSlice(Buffer.from(this.signer, 'utf8'));
    
    writer.writeCompactSize(this.requestedkeys ? this.requestedkeys.length : 0);
    if (this.requestedkeys) {
      for (const key of this.requestedkeys) {
        writer.writeVarSlice(Buffer.from(key, 'utf8'));
      }
    }
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);
    this.format = reader.readVarInt();
    this.type = reader.readVarInt();
    
    // Deserialize id object from JSON string
    const idJsonString = reader.readVarSlice().toString('utf8');
    this.id = JSON.parse(idJsonString);
    
    // Read signer
    this.signer = reader.readVarSlice().toString('utf8');
    
    this.requestedkeys = [];
    const requestedKeysLength = reader.readCompactSize();
    for (let i = 0; i < requestedKeysLength; i++) {
      this.requestedkeys.push(reader.readVarSlice().toString('utf8'));
    }
    return reader.offset;
  }

  toJSON(): RequestItemJson {
    return {
      version: this.version.toNumber(),
      format: this.format.toNumber(),
      type: this.type.toNumber(),
      id: this.id,
      signer: this.signer,
      requestedkeys: this.requestedkeys
    };
  }

  fromJSON(json: RequestItemJson): void {
    this.version = new BN(json.version);
    this.format = new BN(json.format);
    this.type = new BN(json.type);
    this.id = json.id;
    this.signer = json.signer;
    this.requestedkeys = json.requestedkeys || [];
  }
}
