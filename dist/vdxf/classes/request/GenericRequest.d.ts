import { BigNumber } from "../../../utils/types/BigNumber";
import { SignatureData, SignatureJsonDataInterface } from "../../../pbaas";
import { OrdinalVdxfObject, OrdinalVdxfObjectJson } from "../OrdinalVdxfObject";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
export interface GenericRequestInterface {
    version?: BigNumber;
    flags?: BigNumber;
    signature?: SignatureData;
    createdAt?: BigNumber;
    details: Array<OrdinalVdxfObject>;
}
export type GenericRequestJson = {
    version: string;
    flags?: string;
    signature?: SignatureJsonDataInterface;
    createdat?: string;
    details: Array<OrdinalVdxfObjectJson>;
};
export declare class GenericRequest implements SerializableEntity {
    version: BigNumber;
    flags: BigNumber;
    signature?: SignatureData;
    createdAt?: BigNumber;
    details: Array<OrdinalVdxfObject>;
    static VERSION_CURRENT: import("bn.js");
    static VERSION_FIRSTVALID: import("bn.js");
    static VERSION_LASTVALID: import("bn.js");
    static BASE_FLAGS: import("bn.js");
    static FLAG_SIGNED: import("bn.js");
    static FLAG_HAS_CREATED_AT: import("bn.js");
    static FLAG_MULTI_DETAILS: import("bn.js");
    constructor(request?: GenericRequestInterface);
    isValidVersion(): boolean;
    isSigned(): boolean;
    hasMultiDetails(): boolean;
    hasCreatedAt(): boolean;
    setSigned(): void;
    setHasMultiDetails(): void;
    setHasCreatedAt(): void;
    setFlags(): void;
    private getRawDetailsSha256;
    getDetailsHash(signedBlockheight: number): Buffer<ArrayBufferLike>;
    getDetails(index?: number): OrdinalVdxfObject;
    private getDetailsBufferLength;
    private getDetailsBuffer;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toString(): string;
    toWalletDeeplinkUri(): string;
    static fromWalletDeeplinkUri(uri: string): GenericRequest;
    toQrString(): string;
    static fromQrString(qrstring: string): GenericRequest;
    toJson(): GenericRequestJson;
}
