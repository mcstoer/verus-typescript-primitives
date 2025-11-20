import { BigNumber } from '../../../utils/types/BigNumber';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
export type LoginResponseDetailsJson = {
    flags: string;
    requestid: string;
};
export declare class LoginResponseDetails implements SerializableEntity {
    flags?: BigNumber;
    requestID?: string;
    constructor(data?: {
        flags?: BigNumber;
        requestID?: string;
    });
    toSha256(): Buffer<ArrayBufferLike>;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): LoginResponseDetailsJson;
    static fromJson(json: LoginResponseDetailsJson): LoginResponseDetails;
}
