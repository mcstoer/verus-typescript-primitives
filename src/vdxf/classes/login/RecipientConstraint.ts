import bufferutils from "../../../utils/bufferutils";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import varuint from "../../../utils/varuint";
import { CompactAddressObjectJson, CompactIAddressObject } from "../CompactAddressObject";

export interface RecipientConstraintJson {
  type: number;
  identity: CompactAddressObjectJson;
}

export interface RecipientConstraintInterface {
  type: number;
  identity: CompactIAddressObject;
}

export class RecipientConstraint implements SerializableEntity {
  type: number;
  identity: CompactIAddressObject;

  constructor(data?: RecipientConstraintInterface) {
    this.type = data?.type ?? 0;
    this.identity = data?.identity || new CompactIAddressObject();
  }

  static fromData(data: RecipientConstraint | RecipientConstraintInterface): RecipientConstraint {
    if (data instanceof RecipientConstraint) {
      return data;
    }

    return new RecipientConstraint({
      type: data.type,
      identity: data.identity,
    });
  }

  getByteLength(): number {
    return varuint.encodingLength(this.type) + this.identity.getByteLength();
  }

  toBuffer(): Buffer {
    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeCompactSize(this.type);
    writer.writeSlice(this.identity.toBuffer());

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);

    this.type = reader.readCompactSize();
    this.identity = new CompactIAddressObject();
    reader.offset = this.identity.fromBuffer(reader.buffer, reader.offset);

    return reader.offset;
  }

  toJson(): RecipientConstraintJson {
    return {
      type: this.type,
      identity: this.identity.toJson(),
    };
  }

  static fromJson(data: RecipientConstraintJson): RecipientConstraint {
    return new RecipientConstraint({
      type: data.type,
      identity: CompactIAddressObject.fromCompactAddressObjectJson(data.identity),
    });
  }
}
