/**
 * AppEncryptionRequestDetails - Class for handling application requests for encrypted derived seeds
 *
 * This class is used when an application is requesting an encrypted derived seed from the user's master seed,
 * using specific parameters passed by the application. The request includes:
 * - A target encryption key (zaddress format)
 * - Derivation numbers for seed generation
 * - Optional source and destination addresses for context
 *
 * The user's wallet can use these parameters to derive a specific seed from their master seed
 * and encrypt it using the provided encryption key, ensuring the application receives only
 * the specific derived seed it needs without exposing the master seed.
 */
import { BigNumber } from '../../../utils/types/BigNumber';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { CompactIdAddressObject, CompactIdAddressObjectJson } from '../CompactIdAddressObject';
export interface AppEncryptionRequestDetailsInterface {
    version?: BigNumber;
    flags: BigNumber;
    encryptToZAddress: string;
    derivationNumber: BigNumber;
    secondaryDerivationNumber?: BigNumber;
    fromAddress?: CompactIdAddressObject;
    toAddress?: CompactIdAddressObject;
}
export interface AppEncryptionRequestDetailsJson {
    version: number;
    flags: number;
    encrypttozaddress: string;
    derivationnumber: number;
    secondaryderivationnumber?: number;
    fromaddress?: CompactIdAddressObjectJson;
    toaddress?: CompactIdAddressObjectJson;
}
/**
 * Checks if a string is a valid hexadecimal address
 * @param flags - Optional flags for the request
 * @flag HAS_FROM_ADDRESS - Indicates if a from address is included
 * @flag HAS_TO_ADDRESS - Indicates if a to address is included
 * @flag HAS_OPTIONAL_SEED_DERIVATION - Indicates if an optional derivation number is included
 * @flag ADDRESSES_NOT_FQN - Indicates if addresses are in hex format rather than FQN
 *
 * @param encryptToZAddress - The encryption key to use for encrypting to
 * @param derivationNumber - The derivation number to validate
 * @param secondaryDerivationNumber - The optional derivation number to validate
 * @param fromAddress - The from address to be included in the encryption either
 * john.domain@ or [20-byte hex iaddress][20-byte hex system]
 * @param toAddress - The to address to be included in the encryption either
 * john.domain@ or [20-byte hex iaddress][20-byte hex system]
 */
export declare class AppEncryptionRequestDetails implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static HAS_FROM_ADDRESS: import("bn.js");
    static HAS_TO_ADDRESS: import("bn.js");
    static HAS_SECONDARY_SEED_DERIVATION_NUMBER: import("bn.js");
    version: BigNumber;
    flags: BigNumber;
    encryptToZAddress: string;
    derivationNumber: BigNumber;
    secondaryDerivationNumber?: BigNumber;
    fromAddress?: CompactIdAddressObject;
    toAddress?: CompactIdAddressObject;
    constructor(data?: AppEncryptionRequestDetailsInterface);
    setFlags(): void;
    calcFlags(): BigNumber;
    isValid(): boolean;
    hasSecondarySeedDerivation(flags?: BigNumber): boolean;
    hasFromAddress(flags?: BigNumber): boolean;
    hasToAddress(flags?: BigNumber): boolean;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): AppEncryptionRequestDetailsJson;
    static fromJson(json: AppEncryptionRequestDetailsJson): AppEncryptionRequestDetails;
}
