import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { GenericEnvelope, GenericEnvelopeInterface, GenericEnvelopeJson } from "../envelope/GenericEnvelope";
import { BigNumber } from '../../../utils/types/BigNumber';
export type GenericResponseJson = GenericEnvelopeJson & {
    requesthash?: string;
    requesthashtype?: number;
};
export type GenericResponseInterface = GenericEnvelopeInterface & {
    requestHash?: Buffer;
    requestHashType?: BigNumber;
};
export declare class GenericResponse extends GenericEnvelope implements SerializableEntity {
    requestHash?: Buffer;
    requestHashType?: BigNumber;
    static VERSION_CURRENT: import("bn.js");
    static VERSION_FIRSTVALID: import("bn.js");
    static VERSION_LASTVALID: import("bn.js");
    static BASE_FLAGS: import("bn.js");
    static FLAG_SIGNED: import("bn.js");
    static FLAG_HAS_CREATED_AT: import("bn.js");
    static FLAG_MULTI_DETAILS: import("bn.js");
    static FLAG_IS_TESTNET: import("bn.js");
    static FLAG_HAS_SALT: import("bn.js");
    static FLAG_HAS_REQUEST_HASH: import("bn.js");
    constructor(envelope?: GenericResponseInterface);
    hasRequestHash(): boolean;
    setHasRequestHash(): void;
    setFlags(): void;
    getByteLengthOptionalSig(includeSig?: boolean): number;
    protected toBufferOptionalSig(includeSig?: boolean): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): GenericResponseJson;
}
