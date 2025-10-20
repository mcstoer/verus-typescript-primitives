import bufferutils from "../../utils/bufferutils";
import { BN } from 'bn.js';
import { BigNumber } from "../../utils/types/BigNumber";
import { SerializableDataEntity, SerializableEntity } from "../../utils/types/SerializableEntity";
import varuint from "../../utils/varuint";
import { fromBase58Check, getDataKey, toBase58Check, toIAddress } from "../../utils/address";
import varint from "../../utils/varint";
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION, NULL_ADDRESS } from "../../constants/vdxf";
import { DataDescriptor, DataDescriptorJson } from "../../pbaas";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "./payment/VerusPayInvoiceDetails";
import { OrdinalVdxfObjectOrdinalMap } from "./OrdinalVdxfObjectOrdinalMap";
import { DATA_TYPE_OBJECT_DATADESCRIPTOR, VERUSPAY_INVOICE_DETAILS_VDXF_KEY, LOGIN_REQUEST_DETAILS_VDXF_KEY } from "../keys";
import { DEFAULT_VERUS_CHAINID, DEFAULT_VERUS_CHAINNAME } from "../../constants/pbaas";
import { LoginRequestDetails, LoginRequestDetailsJson } from "../..";

export interface OrdinalVdxfObjectInterfaceTemplate<T> {
  version?: BigNumber;
  type?: BigNumber;
  key?: string;
  data?: T;
}

export type OrdinalVdxfObjectJsonTemplate<T> = {
  version: string;
  type: string;
  vdxfkey?: string;
  data?: T;
}

export type OrdinalVdxfObjectReservedData = DataDescriptor | VerusPayInvoiceDetails | LoginRequestDetails;
export type OrdinalVdxfObjectReservedDataJson = DataDescriptorJson | VerusPayInvoiceDetailsJson | LoginRequestDetailsJson ;
export type BufferOrOrdinalVdxfObjectReservedData = Buffer | OrdinalVdxfObjectReservedData;
export type StringOrOrdinalVdxfObjectReservedDataJson = string | OrdinalVdxfObjectReservedDataJson;

export type OrdinalVdxfObjectInterface = OrdinalVdxfObjectInterfaceTemplate<BufferOrOrdinalVdxfObjectReservedData>;
export type OrdinalVdxfObjectJson = OrdinalVdxfObjectJsonTemplate<StringOrOrdinalVdxfObjectReservedDataJson>;

export type OrdinalVdxfObjectDataClass = new (...args: any[]) => OrdinalVdxfObjectReservedData;
export type OrdinalVdxfObjectClass = new (...args: any[]) => OrdinalVdxfObject; 

export const getOrdinalVdxfObjectClassForType = (type: BigNumber): OrdinalVdxfObjectClass => {
  if (type.eq(OrdinalVdxfObject.ORDINAL_DATA_DESCRIPTOR)) return DataDescriptorOrdinalVdxfObject;
  else if (type.eq(OrdinalVdxfObject.ORDINAL_VERUSPAY_INVOICE)) return VerusPayInvoiceOrdinalVdxfObject;
  else if (type.eq(OrdinalVdxfObject.ORDINAL_LOGIN_REQUEST_DETAILS)) return LoginRequestDetailsOrdinalVdxfObject;
  else if (
    type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR) || 
    type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_VDXF_ID_STRING) || 
    type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_ID_OR_CURRENCY)
  ) return GeneralTypeOrdinalVdxfObject;
  else throw new Error("Unrecognized vdxf ordinal object type");
}

export class OrdinalVdxfObject implements SerializableEntity {
  version: BigNumber;
  type: BigNumber;
  key?: string;
  data?: BufferOrOrdinalVdxfObjectReservedData;

  static VERSION_INVALID = new BN(0, 10)
  static VERSION_FIRST = new BN(1, 10)
  static VERSION_LAST = new BN(1, 10)
  static VERSION_CURRENT = new BN(1, 10)

  static ORDINAL_DATA_DESCRIPTOR = new BN(0, 10);
  static ORDINAL_VERUSPAY_INVOICE = new BN(1, 10);
  static ORDINAL_LOGIN_REQUEST_DETAILS = new BN(2, 10);

  static VDXF_OBJECT_RESERVED_BYTE_I_ADDR = new BN(102, 10);
  static VDXF_OBJECT_RESERVED_BYTE_VDXF_ID_STRING = new BN(103, 10);
  static VDXF_OBJECT_RESERVED_BYTE_ID_OR_CURRENCY = new BN(104, 10);

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<BufferOrOrdinalVdxfObjectReservedData> = {
      type: OrdinalVdxfObject.ORDINAL_DATA_DESCRIPTOR
    }
  ) {
    if (request.key) {
      this.type = OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR;
      this.key = request.key;

      if (request.data) {
        this.data = request.data;
      } else this.data = Buffer.alloc(0);
    } else if (request.type == null) {
      this.type = OrdinalVdxfObject.ORDINAL_DATA_DESCRIPTOR;
    } else {
      this.type = request.type;
    }

    if (request.version) this.version = request.version;
    else this.version = OrdinalVdxfObject.VERSION_CURRENT;
  }

  isDefinedByVdxfKey() {
    return this.type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR);
  }

  isDefinedByTextVdxfKey() {
    return this.type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_VDXF_ID_STRING);
  }

  isDefinedByCurrencyOrId() {
    return this.type.eq(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_ID_OR_CURRENCY);
  }

  isDefinedByCustomKey() {
    return this.isDefinedByCurrencyOrId() || this.isDefinedByTextVdxfKey() || this.isDefinedByVdxfKey();
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
      length += fromBase58Check(this.key).hash.length;
    } else if (this.isDefinedByTextVdxfKey() || this.isDefinedByCurrencyOrId()) {
      const utf8Key = Buffer.from(this.key, 'utf8');

      length += varuint.encodingLength(utf8Key.length);
      length += utf8Key.length;
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
      writer.writeSlice(fromBase58Check(this.key).hash);
    } else if (this.isDefinedByTextVdxfKey() || this.isDefinedByCurrencyOrId()) {
      writer.writeVarSlice(Buffer.from(this.key, 'utf8'));
    }

    writer.writeVarInt(this.version);

    writer.writeVarSlice(this.toDataBuffer());

    return writer.buffer;
  }

  fromBufferOptionalType(buffer: Buffer, offset?: number, type?: BigNumber, key?: string): number {
    if (buffer.length == 0) throw new Error("Cannot create request from empty buffer");
    
    const reader = new bufferutils.BufferReader(buffer, offset);

    if (!type) {
      this.type = new BN(reader.readCompactSize());
    } else this.type = type;

    if (!key) {
      if (this.isDefinedByVdxfKey()) {
        this.key = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);
      } else if (this.isDefinedByTextVdxfKey() || this.isDefinedByCurrencyOrId()) {
        this.key = reader.readVarSlice().toString('utf8');
      }
    } else {
      this.key = key
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
      vdxfkey: this.key,
      data: this.data ? this.isDefinedByCustomKey() ? this.data.toString('hex') : (this.data as OrdinalVdxfObjectReservedData).toJson() : undefined
    };
  }

  static createFromBuffer(
    buffer: Buffer, 
    offset?: number, 
    optimizeWithOrdinal: boolean = false, 
    rootSystemName: string = DEFAULT_VERUS_CHAINNAME
  ): { offset: number, obj: OrdinalVdxfObject } {
    if (buffer.length == 0) throw new Error("Cannot create request from empty buffer");
    
    const reader = new bufferutils.BufferReader(buffer, offset);
    let type = new BN(reader.readCompactSize());
    const rootSystemId = toIAddress(rootSystemName);

    const Entity = getOrdinalVdxfObjectClassForType(type);
    const ord = new Entity({ type });
    
    let key: string;

    if (optimizeWithOrdinal) {
      let vdxfKey: string;

      if (ord.isDefinedByVdxfKey()) {
        key = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);
        vdxfKey = key;
      } else if (ord.isDefinedByTextVdxfKey() || ord.isDefinedByCurrencyOrId()) {
        key = reader.readVarSlice().toString('utf8');

        if (ord.isDefinedByTextVdxfKey()) {
          vdxfKey = getDataKey(key, undefined, rootSystemId).id;
        } else {
          vdxfKey = toIAddress(key, rootSystemName);
        }
      }

      if (OrdinalVdxfObjectOrdinalMap.vdxfKeyHasOrdinal(vdxfKey)) {
        type = new BN(OrdinalVdxfObjectOrdinalMap.getOrdinalForVdxfKey(vdxfKey));
      }
    }

    reader.offset = ord.fromBufferOptionalType(buffer, reader.offset, type, key);

    return { offset: reader.offset, obj: ord };
  }
}

OrdinalVdxfObjectOrdinalMap.registerOrdinal(OrdinalVdxfObject.ORDINAL_DATA_DESCRIPTOR.toNumber(), DATA_TYPE_OBJECT_DATADESCRIPTOR.vdxfid);
OrdinalVdxfObjectOrdinalMap.registerOrdinal(OrdinalVdxfObject.ORDINAL_VERUSPAY_INVOICE.toNumber(), VERUSPAY_INVOICE_DETAILS_VDXF_KEY.vdxfid);
OrdinalVdxfObjectOrdinalMap.registerOrdinal(OrdinalVdxfObject.ORDINAL_LOGIN_REQUEST_DETAILS.toNumber(), LOGIN_REQUEST_DETAILS_VDXF_KEY.vdxfid);

export class GeneralTypeOrdinalVdxfObject extends OrdinalVdxfObject implements SerializableDataEntity {
  data: Buffer;
  key: string;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<Buffer> = {
      type: OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR,
      data: Buffer.alloc(0),
      key: NULL_ADDRESS
    }
  ) {
    super({
      type: request.type,
      data: request.data,
      key: request.key
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
      key: details.vdxfkey,
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
    if (!request || !request.type) throw new Error("Expected request with data and type")

    super({
      type: request.type
    });

    this.entity = entity;
    this.data = request.data ? request.data : new entity();
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
        type: OrdinalVdxfObject.ORDINAL_DATA_DESCRIPTOR,
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
        type: OrdinalVdxfObject.ORDINAL_VERUSPAY_INVOICE,
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

export class LoginRequestDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: LoginRequestDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<LoginRequestDetails> = {
      data: new LoginRequestDetails()
    }
  ) {
    super(
      {
        type: OrdinalVdxfObject.ORDINAL_LOGIN_REQUEST_DETAILS,
        data: request.data
      },
      LoginRequestDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<LoginRequestDetailsJson>): LoginRequestDetailsOrdinalVdxfObject {
    return new LoginRequestDetailsOrdinalVdxfObject({
      data: LoginRequestDetails.fromJson(details.data)
    })
  }
}