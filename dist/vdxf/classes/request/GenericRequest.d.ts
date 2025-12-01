import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { GenericEnvelope, GenericEnvelopeInterface, GenericEnvelopeJson } from "../envelope/GenericEnvelope";
import { SaplingPaymentAddress } from '../../../pbaas/SaplingPaymentAddress';
export type GenericRequestJson = GenericEnvelopeJson & {
    encryptresponsetoaddress?: string;
};
export type GenericRequestInterface = GenericEnvelopeInterface & {
    encryptResponseToAddress?: SaplingPaymentAddress;
};
export declare class GenericRequest extends GenericEnvelope implements SerializableEntity {
    encryptResponseToAddress?: SaplingPaymentAddress;
    static VERSION_CURRENT: import("bn.js");
    static VERSION_FIRSTVALID: import("bn.js");
    static VERSION_LASTVALID: import("bn.js");
    static BASE_FLAGS: import("bn.js");
    static FLAG_SIGNED: import("bn.js");
    static FLAG_HAS_CREATED_AT: import("bn.js");
    static FLAG_MULTI_DETAILS: import("bn.js");
    static FLAG_IS_TESTNET: import("bn.js");
    static FLAG_HAS_SALT: import("bn.js");
    static FLAG_HAS_ENCRYPT_RESPONSE_TO_ADDRESS: import("bn.js");
    constructor(envelope?: GenericRequestInterface);
    hasEncryptResponseToAddress(): boolean;
    setHasEncryptResponseToAddress(): void;
    setFlags(): void;
    getByteLengthOptionalSig(includeSig?: boolean): number;
    toBufferOptionalSig(includeSig?: boolean): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): GenericRequestJson;
    static fromWalletDeeplinkUri(uri: string): GenericRequest;
    static fromQrString(qrstring: string): GenericRequest;
    toWalletDeeplinkUri(): string;
    toQrString(): string;
}
