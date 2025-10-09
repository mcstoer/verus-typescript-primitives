import bufferutils from "../../utils/bufferutils";
import { BN } from 'bn.js';
import { BigNumber } from "../../utils/types/BigNumber";
import { SerializableDataEntity, SerializableEntity } from "../../utils/types/SerializableEntity";
import varuint from "../../utils/varuint";
import { fromBase58Check, toBase58Check } from "../../utils/address";
import varint from "../../utils/varint";
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION, NULL_ADDRESS } from "../../constants/vdxf";
import { DataDescriptor, DataDescriptorJson } from "../../pbaas";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "./payment/VerusPayInvoiceDetails";

export interface OrdinalVdxfObjectInterfaceTemplate<T> {
  version?: BigNumber;
  type?: BigNumber;
  vdxfKey?: string;
  data?: T;
}

export type OrdinalVdxfObjectJsonTemplate<T> = {
  version: string;
  type: string;
  vdxfKey?: string;
  data?: T;
}

export type OrdinalVdxfObjectReservedData = DataDescriptor | VerusPayInvoiceDetails;
export type OrdinalVdxfObjectReservedDataJson = DataDescriptorJson | VerusPayInvoiceDetailsJson;
export type BufferOrOrdinalVdxfObjectReservedData = Buffer | OrdinalVdxfObjectReservedData;
export type StringOrOrdinalVdxfObjectReservedDataJson = string | OrdinalVdxfObjectReservedDataJson;

export type OrdinalVdxfObjectInterface = OrdinalVdxfObjectInterfaceTemplate<BufferOrOrdinalVdxfObjectReservedData>;
export type OrdinalVdxfObjectJson = OrdinalVdxfObjectJsonTemplate<StringOrOrdinalVdxfObjectReservedDataJson>;

export type OrdinalVdxfObjectDataClass = new (...args: any[]) => OrdinalVdxfObjectReservedData;
export type OrdinalVdxfObjectClass = new (...args: any[]) => OrdinalVdxfObject; 

export const getOrdinalVdxfObjectClassForType = (type: BigNumber): OrdinalVdxfObjectClass => {
  if (type.eq(OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR)) return DataDescriptorOrdinalVdxfObject;
  else if (type.eq(OrdinalVdxfObject.TYPE_INVOICE)) return VerusPayInvoiceOrdinalVdxfObject;
  else if (type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE)) return GeneralTypeOrdinalVdxfObject;
  else throw new Error("Unrecognized vdxf ordinal object type");
}

export class OrdinalVdxfObject implements SerializableEntity {
  version: BigNumber;
  type: BigNumber;
  vdxfKey?: string;
  data?: BufferOrOrdinalVdxfObjectReservedData;

  static VERSION_INVALID = new BN(0, 10)
  static VERSION_FIRST = new BN(1, 10)
  static VERSION_LAST = new BN(1, 10)
  static VERSION_CURRENT = new BN(1, 10)

  static TYPE_DATA_DESCRIPTOR = new BN(0, 10);
  static TYPE_INVOICE = new BN(1, 10);

  static VDXF_OBJECT_RESERVED_BYTE = new BN(102, 10);

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<BufferOrOrdinalVdxfObjectReservedData> = {
      type: OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR
    }
  ) {
    if (request.vdxfKey) {
      this.type = OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE;
      this.vdxfKey = request.vdxfKey;

      if (request.data) {
        this.data = request.data;
      } else this.data = Buffer.alloc(0);
    } else if (request.type == null) {
      this.type = OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR;
    } else {
      this.type = request.type;
    }

    if (request.version) this.version = request.version;
    else this.version = OrdinalVdxfObject.VERSION_CURRENT;
  }

  isDefinedByVdxfKey() {
    return this.type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE);
  }

  getDataByteLength(): number {
    return 0;
  }

  toDataBuffer(): Buffer {
    return Buffer.alloc(0);
  }

  fromDataBuffer(buffer: Buffer): void {}

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.type.toNumber());

    if (this.isDefinedByVdxfKey()) {
      length += fromBase58Check(this.vdxfKey).hash.length;
    }

    length += varint.encodingLength(this.version);

    const dataLength = this.getDataByteLength();

    length += varuint.encodingLength(dataLength);
    length += dataLength;

    return length;
  }

  toBuffer(): Buffer {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.getByteLength())
    );

    writer.writeCompactSize(this.type.toNumber());

    if (this.isDefinedByVdxfKey()) {
      writer.writeSlice(fromBase58Check(this.vdxfKey).hash);
    }

    writer.writeVarInt(this.version);

    writer.writeVarSlice(this.toDataBuffer());

    return writer.buffer;
  }

  fromBufferOptionalType(buffer: Buffer, offset?: number, type?: BigNumber): number {
    if (buffer.length == 0) throw new Error("Cannot create request from empty buffer");
    
    const reader = new bufferutils.BufferReader(buffer, offset);

    if (!type) {
      this.type = new BN(reader.readCompactSize());
    } else this.type = type;

    if (this.isDefinedByVdxfKey()) {
      this.vdxfKey = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);
    }

    this.version = reader.readVarInt();
    const dataBuf = reader.readVarSlice();
    
    this.fromDataBuffer(dataBuf);

    return reader.offset;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    return this.fromBufferOptionalType(buffer, offset);
  }

  toJson(): OrdinalVdxfObjectJson {
    return {
      type: this.type ? this.type.toString() : undefined,
      version: this.version ? this.version.toString() : undefined,
      vdxfKey: this.vdxfKey,
      data: this.data ? this.isDefinedByVdxfKey() ? this.data.toString('hex') : (this.data as OrdinalVdxfObjectReservedData).toJson() : undefined
    };
  }

  static createFromBuffer(buffer: Buffer, offset?: number): { offset: number, obj: OrdinalVdxfObject } {
    if (buffer.length == 0) throw new Error("Cannot create request from empty buffer");
    
    const reader = new bufferutils.BufferReader(buffer, offset);
    const type = new BN(reader.readCompactSize());

    const Entity = getOrdinalVdxfObjectClassForType(type);
    const ord = new Entity();

    reader.offset = ord.fromBufferOptionalType(buffer, reader.offset, type);

    return { offset: reader.offset, obj: ord };
  }
}

export class GeneralTypeOrdinalVdxfObject extends OrdinalVdxfObject implements SerializableDataEntity {
  data: Buffer;
  vdxfKey: string;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<Buffer> = {
      data: Buffer.alloc(0),
      vdxfKey: NULL_ADDRESS
    }
  ) {
    super({
      type: OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE,
      data: request.data,
      vdxfKey: request.vdxfKey
    })
  }

  getDataByteLength(): number {
    return this.data.length;
  }

  toDataBuffer(): Buffer {
    return this.data;
  }

  fromDataBuffer(buffer: Buffer): void {
    this.data = Buffer.from(buffer)
  }

  static fromJson(details: OrdinalVdxfObjectJson): GeneralTypeOrdinalVdxfObject {
    return new GeneralTypeOrdinalVdxfObject({
      vdxfKey: details.vdxfKey,
      data: details.data ? Buffer.from(details.data as string, 'hex') : undefined
    });
  }
}

export class SerializableEntityOrdinalVdxfObject extends OrdinalVdxfObject implements SerializableDataEntity {
  data: OrdinalVdxfObjectReservedData;
  entity: OrdinalVdxfObjectDataClass;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<OrdinalVdxfObjectReservedData>,
    entity: OrdinalVdxfObjectDataClass
  ) {
    if (!request || !request.type || !request.data) throw new Error("Expected request with data and type")

    super({
      type: request.type
    });

    this.entity = entity;
    this.data = request.data;
  }

  getDataByteLength(): number {
    return this.data.getByteLength()
  }

  toDataBuffer(): Buffer {
    return this.data.toBuffer();
  }

  fromDataBuffer(buffer: Buffer): void {
    this.data = new this.entity();
    this.data.fromBuffer(buffer);
  }
}

export class DataDescriptorOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: DataDescriptor;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<DataDescriptor> = {
      data: new DataDescriptor()
    }
  ) {
    super(
      {
        type: OrdinalVdxfObject.TYPE_DATA_DESCRIPTOR,
        data: request.data
      },
      DataDescriptor
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataDescriptorJson>): DataDescriptorOrdinalVdxfObject {
    return new DataDescriptorOrdinalVdxfObject({
      data: DataDescriptor.fromJson(details.data)
    })
  }
}

export class VerusPayInvoiceOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: VerusPayInvoiceDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<VerusPayInvoiceDetails> = {
      data: new VerusPayInvoiceDetails()
    }
  ) {
    super(
      {
        type: OrdinalVdxfObject.TYPE_INVOICE,
        data: request.data
      },
      VerusPayInvoiceDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<VerusPayInvoiceDetailsJson>): VerusPayInvoiceOrdinalVdxfObject {
    return new VerusPayInvoiceOrdinalVdxfObject({
      data: VerusPayInvoiceDetails.fromJson(details.data)
    })
  }
}