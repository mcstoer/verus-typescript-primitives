import { BigNumber } from "../../../utils/types/BigNumber";
import { SerializableDataEntity, SerializableEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectReservedData, OrdinalVdxfObjectReservedDataJson } from "../../../constants/ordinals/types";
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
export declare const getOrdinalVdxfObjectClassForType: (type: BigNumber) => OrdinalVdxfObjectClass;
export declare class OrdinalVdxfObject implements SerializableEntity {
    version: BigNumber;
    type: BigNumber;
    key?: string;
    data?: BufferOrOrdinalVdxfObjectReservedData;
    static VERSION_INVALID: import("bn.js");
    static VERSION_FIRST: import("bn.js");
    static VERSION_LAST: import("bn.js");
    static VERSION_CURRENT: import("bn.js");
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
