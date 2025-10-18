
/**
 * CompactIdentityObject - Class representing a compact identity object with serialization and deserialization methods.
 *
 * This class allows for the representation of an identity either by its fully qualified name (FQN)
 * or by its byte representation (identityId and systemId). The object can be serialized to and deserialized from a buffer.
 *

 */

import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;

import { SerializableEntity } from '../../../utils/types/SerializableEntity';

import varuint from '../../../utils/varuint';



export class CompactIdentityObject implements SerializableEntity {

  id: string;

  constructor(data?: CompactIdentityObject) {
    this.id = data?.id || '';
  }

  isHexAddress(): boolean {
    return this.id.length === 40 && this.id.match(/^[0-9a-fA-F]+$/) !== null;
  }

  getByteLength(): number {
    let length = 0;

    if (this.isHexAddress()) {
      length += 40; // identityuint160 + systemuint160
    } else {
      length += varuint.encodingLength(Buffer.from(this.id!, 'utf8').byteLength)
        + Buffer.from(this.id!, 'utf8').byteLength;
    }

    return length;
  }
  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    if (this.isHexAddress()) {
      writer.writeSlice(Buffer.from(this.id!));
    }
    else {
      writer.writeVarSlice(Buffer.from(this.id!, 'utf8'));
    }
   
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);
    if (buffer.length - reader.offset === 40) {  
        let id;        
        try {
          id = reader.readSlice(40);
          this.id = id.toString('hex');

        } catch (e) {
            this.id = id.toString('utf8');
        }

    } else {
        this.id = reader.readVarSlice().toString('utf8');
    }
    return reader.offset;
  }
 
  toJson(): any {
    return {
      id: this.id,
    };
  }
  static fromJson(json: any): CompactIdentityObject {
    const instance = new CompactIdentityObject();
    instance.id = json.id;
    return instance;
  }
}

