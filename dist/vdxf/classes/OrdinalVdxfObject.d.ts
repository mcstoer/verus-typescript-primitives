import { BigNumber } from "../../utils/types/BigNumber";
import { SerializableDataEntity, SerializableEntity } from "../../utils/types/SerializableEntity";
import { DataDescriptor, DataDescriptorJson } from "../../pbaas";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "./payment/VerusPayInvoiceDetails";
import { OrdinalVdxfObjectReservedData, OrdinalVdxfObjectReservedDataJson } from "../../constants/ordinals/helpers";
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
};
export type BufferOrOrdinalVdxfObjectReservedData = Buffer | OrdinalVdxfObjectReservedData;
export type StringOrOrdinalVdxfObjectReservedDataJson = string | OrdinalVdxfObjectReservedDataJson;
export type OrdinalVdxfObjectInterface = OrdinalVdxfObjectInterfaceTemplate<BufferOrOrdinalVdxfObjectReservedData>;
export type OrdinalVdxfObjectJson = OrdinalVdxfObjectJsonTemplate<StringOrOrdinalVdxfObjectReservedDataJson>;
export type OrdinalVdxfObjectDataClass = new (...args: any[]) => OrdinalVdxfObjectReservedData;
export type OrdinalVdxfObjectClass = new (...args: any[]) => OrdinalVdxfObject;
export declare class OrdinalVdxfObject implements SerializableEntity {
    version: BigNumber;
    type: BigNumber;
    key?: string;
    data?: BufferOrOrdinalVdxfObjectReservedData;
    static VERSION_INVALID: import("bn.js");
    static VERSION_FIRST: import("bn.js");
    static VERSION_LAST: import("bn.js");
    static VERSION_CURRENT: import("bn.js");
    static VDXF_OBJECT_RESERVED_BYTE_I_ADDR: import("bn.js");
    static VDXF_OBJECT_RESERVED_BYTE_VDXF_ID_STRING: import("bn.js");
    static VDXF_OBJECT_RESERVED_BYTE_ID_OR_CURRENCY: import("bn.js");
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<BufferOrOrdinalVdxfObjectReservedData>);
    isDefinedByVdxfKey(): boolean;
    isDefinedByTextVdxfKey(): boolean;
    isDefinedByCurrencyOrId(): boolean;
    isDefinedByCustomKey(): boolean;
    getDataByteLength(): number;
    toDataBuffer(): Buffer;
    fromDataBuffer(buffer: Buffer): void;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBufferOptionalType(buffer: Buffer, offset?: number, type?: BigNumber, key?: string): number;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): OrdinalVdxfObjectJson;
    static createFromBuffer(buffer: Buffer, offset?: number, optimizeWithOrdinal?: boolean, rootSystemName?: string): {
        offset: number;
        obj: OrdinalVdxfObject;
    };
}
export declare class GeneralTypeOrdinalVdxfObject extends OrdinalVdxfObject implements SerializableDataEntity {
    data: Buffer;
    key: string;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<Buffer>);
    getDataByteLength(): number;
    toDataBuffer(): Buffer;
    fromDataBuffer(buffer: Buffer): void;
    static fromJson(details: OrdinalVdxfObjectJson): GeneralTypeOrdinalVdxfObject;
}
export declare class SerializableEntityOrdinalVdxfObject extends OrdinalVdxfObject implements SerializableDataEntity {
    data: OrdinalVdxfObjectReservedData;
    entity: OrdinalVdxfObjectDataClass;
    constructor(request: OrdinalVdxfObjectInterfaceTemplate<OrdinalVdxfObjectReservedData>, entity: OrdinalVdxfObjectDataClass);
    getDataByteLength(): number;
    toDataBuffer(): Buffer;
    fromDataBuffer(buffer: Buffer): void;
}
export declare class DataDescriptorOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: DataDescriptor;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<DataDescriptor>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataDescriptorJson>): DataDescriptorOrdinalVdxfObject;
}
export declare class VerusPayInvoiceOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: VerusPayInvoiceDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<VerusPayInvoiceDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<VerusPayInvoiceDetailsJson>): VerusPayInvoiceOrdinalVdxfObject;
}
