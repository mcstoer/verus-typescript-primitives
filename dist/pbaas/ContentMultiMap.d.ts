import { VdxfUniValue, VdxfUniValueJson } from './VdxfUniValue';
import { SerializableEntity } from '../utils/types/SerializableEntity';
export type ContentMultiMapPrimitive = VdxfUniValue | Buffer;
export type ContentMultiMapPrimitiveJson = VdxfUniValueJson | string;
export type ContentMultiMapJsonValue = ContentMultiMapPrimitiveJson | Array<ContentMultiMapPrimitiveJson>;
export type ContentMultiMapJson = {
    [key: string]: ContentMultiMapJsonValue;
};
export type KvValueArrayItem = Buffer | ContentMultiMapJson;
export declare function isKvValueArrayItemVdxfUniValueJson(x: ContentMultiMapJsonValue): x is VdxfUniValueJson;
export type KvContent = Map<string, Array<ContentMultiMapPrimitive>>;
export declare class ContentMultiMap implements SerializableEntity {
    kv_content: KvContent;
    constructor(data?: {
        kv_content: KvContent;
    });
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number, parseVdxfObjects?: boolean): number;
    static fromJson(obj: {
        [key: string]: ContentMultiMapJsonValue;
    }): ContentMultiMap;
    toJson(): ContentMultiMapJson;
}
