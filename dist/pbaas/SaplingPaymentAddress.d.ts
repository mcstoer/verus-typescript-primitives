import { SerializableEntity } from '../utils/types/SerializableEntity';
export declare class SaplingPaymentAddress implements SerializableEntity {
    d: Buffer;
    pk_d: Buffer;
    constructor(data?: {
        d: Buffer;
        pk_d: Buffer;
    });
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    static fromAddressString(address: string): SaplingPaymentAddress;
    toAddressString(): string;
}
