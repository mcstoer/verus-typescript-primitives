import { BigNumber } from '../../../utils/types/BigNumber';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
export type IdentityUpdateResponseDetailsJson = {
    flags: string;
    requestid: string;
    createdat: string;
    txid?: string;
    salt?: string;
};
export declare class IdentityUpdateResponseDetails implements SerializableEntity {
    flags?: BigNumber;
    requestID?: BigNumber;
    createdAt?: BigNumber;
    txid?: Buffer;
    salt?: Buffer;
    static IDENTITY_UPDATE_RESPONSE_VALID: import("bn.js");
    static IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID: import("bn.js");
    static IDENTITY_UPDATE_RESPONSE_CONTAINS_SALT: import("bn.js");
    constructor(data?: {
        flags?: BigNumber;
        requestID?: BigNumber;
        createdAt?: BigNumber;
        txid?: Buffer;
        salt?: Buffer;
    });
    containsTxid(): boolean;
    containsSalt(): boolean;
    toggleContainsTxid(): void;
    toggleContainsSalt(): void;
    toSha256(): Buffer<ArrayBufferLike>;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): IdentityUpdateResponseDetailsJson;
    static fromJson(json: IdentityUpdateResponseDetailsJson): IdentityUpdateResponseDetails;
}
