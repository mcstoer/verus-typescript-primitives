/**
 * InformationRequest - Class for handling application requests for specific user information/data
 *
 * This class is used when an application is requesting specific information or data from the user's
 * identity or data stores. The request includes:
 * - Search data keys (VDXF keys) to identify the specific data being requested
 * - Optional specific keys within the data object for partial data requests
 * - Signer information to identify wanted signer of the data
 * - Optional statement for boundhashes in the signature
 *
 * The user's wallet can use these parameters to locate the signed object information and present
 * it to the user for approval before sharing with the requesting application. This enables
 * selective disclosure of personal information while maintaining user privacy and control.
 *
 * Flags determine the type and scope of the request:
 * - FULL_DATA vs PARTIAL_DATA: Whether complete objects or specific fields are requested
 * - COLLECTION: Whether multiple data objects are being requested
 * - HAS_STATEMENT: Whether the request includes an attestation statement
 * - ATTESTATION/CLAIM/CREDENTIAL: Type of verification being requested
 */
import { BigNumber } from '../../../utils/types/BigNumber';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { CompactAddressObject, CompactAddressObjectJson } from '../CompactAddressObject';
export interface UserDataRequestInterface {
    version?: BigNumber;
    flags: BigNumber;
    searchDataKey: Array<{
        [key: string]: string;
    }>;
    signer?: CompactAddressObject;
    requestedKeys?: string[];
    requestID?: string;
}
export interface UserDataRequestJson {
    version: number;
    flags: number;
    searchdatakey: Array<{
        [key: string]: string;
    }>;
    signer?: CompactAddressObjectJson;
    requestedkeys?: string[];
    requestid?: string;
}
export declare class UserDataRequestDetails implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static FULL_DATA: import("bn.js");
    static PARTIAL_DATA: import("bn.js");
    static COLLECTION: import("bn.js");
    static ATTESTATION: import("bn.js");
    static CLAIM: import("bn.js");
    static CREDENTIAL: import("bn.js");
    static HAS_SIGNER: import("bn.js");
    static HAS_REQUESTED_KEYS: import("bn.js");
    static HAS_REQUEST_ID: import("bn.js");
    version: BigNumber;
    flags: BigNumber;
    searchDataKey: Array<{
        [key: string]: string;
    }>;
    signer?: CompactAddressObject;
    requestedKeys?: string[];
    requestID?: string;
    constructor(data?: UserDataRequestInterface);
    calcFlags(): BigNumber;
    setFlags(): void;
    hasSigner(): boolean;
    hasRequestedKeys(): boolean;
    hasRequestID(): boolean;
    /**
     * Checks if exactly one data type flag is set (FULL_DATA, PARTIAL_DATA, or COLLECTION)
     * @returns True if exactly one data type flag is set
     */
    hasDataTypeSet(): boolean;
    /**
     * Checks if exactly one request type flag is set (ATTESTATION, CLAIM, or CREDENTIAL)
     * @returns True if exactly one request type flag is set
     */
    hasRequestTypeSet(): boolean;
    isValid(): boolean;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): UserDataRequestJson;
    static fromJson(json: UserDataRequestJson): UserDataRequestDetails;
}
