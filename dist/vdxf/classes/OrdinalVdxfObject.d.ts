import { BigNumber } from "../../utils/types/BigNumber";
import { SerializableDataEntity, SerializableEntity } from "../../utils/types/SerializableEntity";
import { DataDescriptor, DataDescriptorJson } from "../../pbaas";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "./payment/VerusPayInvoiceDetails";
export interface OrdinalVdxfObjectInterfaceTemplate<T> {
    version?: BigNumber;
    type?: BigNumber;
    vdxfkey?: string;
    data?: T;
}
export type OrdinalVdxfObjectJsonTemplate<T> = {
    version: string;
    type: string;
    vdxfkey?: string;
    data?: T;
};
export type OrdinalVdxfObjectReservedData = DataDescriptor | VerusPayInvoiceDetails;
export type OrdinalVdxfObjectReservedDataJson = DataDescriptorJson | VerusPayInvoiceDetailsJson;
export type BufferOrOrdinalVdxfObjectReservedData = Buffer | OrdinalVdxfObjectReservedData;
export type StringOrOrdinalVdxfObjectReservedDataJson = string | OrdinalVdxfObjectReservedDataJson;
export type OrdinalVdxfObjectInterface = OrdinalVdxfObjectInterfaceTemplate<BufferOrOrdinalVdxfObjectReservedData>;
export type OrdinalVdxfObjectJson = OrdinalVdxfObjectJsonTemplate<StringOrOrdinalVdxfObjectReservedDataJson>;
export type OrdinalVdxfObjectDataClass = new (...args: any[]) => OrdinalVdxfObjectReservedData;
export type OrdinalVdxfObjectClass = new (...args: any[]) => OrdinalVdxfObject;
export declare const getOrdinalVdxfObjectClassForType: (type: BigNumber) => OrdinalVdxfObjectClass;
export declare class OrdinalVdxfObject implements SerializableEntity {
    version: BigNumber;
    type: BigNumber;
    vdxfkey?: string;
    data?: BufferOrOrdinalVdxfObjectReservedData;
    static VERSION_INVALID: import("bn.js");
    static VERSION_FIRST: import("bn.js");
    static VERSION_LAST: import("bn.js");
    static VERSION_CURRENT: import("bn.js");
    static TYPE_DATA_DESCRIPTOR: import("bn.js");
    static TYPE_INVOICE: import("bn.js");
    static VDXF_OBJECT_RESERVED_BYTE: import("bn.js");
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<BufferOrOrdinalVdxfObjectReservedData>);
    isDefinedByVdxfKey(): boolean;
    getDataByteLength(): number;
    toDataBuffer(): Buffer;
    fromDataBuffer(buffer: Buffer): void;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBufferOptionalType(buffer: Buffer, offset?: number, type?: BigNumber): number;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): OrdinalVdxfObjectJson;
    static createFromBuffer(buffer: Buffer, offset?: number): {
        offset: number;
        obj: OrdinalVdxfObject;
    };
}
export declare class GeneralTypeOrdinalVdxfObject extends OrdinalVdxfObject implements SerializableDataEntity {
    data: Buffer;
    vdxfkey: string;
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
