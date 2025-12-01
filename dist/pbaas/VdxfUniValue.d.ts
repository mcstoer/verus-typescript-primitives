import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
import { CurrencyValueMap } from './CurrencyValueMap';
import { Rating, RatingJson } from './Rating';
import { TransferDestination, TransferDestinationJson } from './TransferDestination';
import { ContentMultiMapRemove, ContentMultiMapRemoveJson } from './ContentMultiMapRemove';
import { CrossChainDataRef, CrossChainDataRefJson } from './CrossChainDataRef';
import { SignatureData, SignatureJsonDataInterface } from './SignatureData';
import { DataDescriptor, DataDescriptorJson } from './DataDescriptor';
import { MMRDescriptor, MMRDescriptorJson } from './MMRDescriptor';
import { Credential } from './Credential';
import { URLRef } from './URLRef';
import { IdentityMultimapRef } from './IdentityMultimapRef';
export declare const VDXF_UNI_VALUE_VERSION_INVALID: import("bn.js");
export declare const VDXF_UNI_VALUE_VERSION_CURRENT: import("bn.js");
export type VdxfUniType = string | Buffer | BigNumber | CurrencyValueMap | Rating | TransferDestination | ContentMultiMapRemove | CrossChainDataRef | SignatureData | DataDescriptor | MMRDescriptor | URLRef | IdentityMultimapRef | Credential;
export interface VdxfUniValueInterface {
    [key: string]: string | number | RatingJson | TransferDestinationJson | ContentMultiMapRemoveJson | CrossChainDataRefJson | SignatureJsonDataInterface | DataDescriptorJson | MMRDescriptorJson | VdxfUniValueInterface;
    serializedhex?: string;
    serializedbase64?: string;
    message?: string;
}
export type VdxfUniValueJson = string | VdxfUniValueInterface;
export type VdxfUniValueJsonArray = Array<VdxfUniValueJson>;
export type JsonSerializableObject = CurrencyValueMap | Rating | TransferDestination | ContentMultiMapRemove | CrossChainDataRef | SignatureData | DataDescriptor | MMRDescriptor | Credential;
export declare class VdxfUniValue implements SerializableEntity {
    values: Array<{
        [key: string]: VdxfUniType;
    }>;
    version: BigNumber;
    constructor(data?: {
        values: Array<{
            [key: string]: VdxfUniType;
        }>;
        version?: BigNumber;
    });
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    static fromJson(obj: any): VdxfUniValue;
    toJson(): VdxfUniValueJsonArray | VdxfUniValueJson;
}
