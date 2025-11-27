import { SerializableEntity } from '../utils/types/SerializableEntity';
export declare class SaplingExtendedViewingKey implements SerializableEntity {
    depth: number;
    parentFVKTag: Buffer;
    childIndex: Buffer;
    chainCode: Buffer;
    ak: Buffer;
    nk: Buffer;
    ovk: Buffer;
    dk: Buffer;
    constructor(data?: {
        depth?: number;
        parentFVKTag?: Buffer;
        childIndex?: Buffer;
        chainCode?: Buffer;
        ak?: Buffer;
        nk?: Buffer;
        ovk?: Buffer;
        dk?: Buffer;
    });
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    static fromKeyString(key: string): SaplingExtendedViewingKey;
    toKeyString(testnet?: boolean): string;
}
