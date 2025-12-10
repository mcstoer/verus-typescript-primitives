import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { GenericEnvelope, GenericEnvelopeInterface, GenericEnvelopeJson } from "../envelope/GenericEnvelope";
import { SaplingPaymentAddress } from '../../../pbaas/SaplingPaymentAddress';
import { ResponseURI, ResponseURIJson } from '../ResponseURI';
export type GenericRequestJson = GenericEnvelopeJson & {
    responseuris?: Array<ResponseURIJson>;
    encryptresponsetoaddress?: string;
};
export type GenericRequestInterface = GenericEnvelopeInterface & {
    responseURIs?: Array<ResponseURI>;
    encryptResponseToAddress?: SaplingPaymentAddress;
};
export declare class GenericRequest extends GenericEnvelope implements SerializableEntity {
    responseURIs?: Array<ResponseURI>;
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
    static FLAG_HAS_APP_OR_DELEGATED_ID: import("bn.js");
    static FLAG_HAS_RESPONSE_URIS: import("bn.js");
    static FLAG_HAS_ENCRYPT_RESPONSE_TO_ADDRESS: import("bn.js");
    constructor(envelope?: GenericRequestInterface);
    hasResponseURIs(): boolean;
    hasEncryptResponseToAddress(): boolean;
    setHasResponseURIs(): void;
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
