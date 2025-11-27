import { SerializableEntity } from '../utils/types/SerializableEntity';
export declare class SaplingExtendedSpendingKey implements SerializableEntity {
    depth: number;
    parentFVKTag: Buffer;
    childIndex: Buffer;
    chainCode: Buffer;
    ask: Buffer;
    nsk: Buffer;
    ovk: Buffer;
    dk: Buffer;
    constructor(data?: {
        depth?: number;
        parentFVKTag?: Buffer;
        childIndex?: Buffer;
        chainCode?: Buffer;
        ask?: Buffer;
        nsk?: Buffer;
        ovk?: Buffer;
        dk?: Buffer;
    });
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    static fromKeyString(key: string): SaplingExtendedSpendingKey;
    toKeyString(testnet?: boolean): string;
}
