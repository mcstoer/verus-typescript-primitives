/**
 * AuthenticationRequestDetails - Class for handling application login and authentication requests
 *
 * This class is used when an application is requesting authentication or login from the user,
 * including specific recipientConstraints and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Response URIs for post-authentication redirects
 * - Optional expiry time for the authentication session
 *
 * The user's wallet can use these parameters to present a clear authentication request
 * to the user, showing exactly what recipientConstraints are being requested and where they will
 * be redirected after successful authentication. This enables secure, user-controlled
 * authentication flows with granular permission management.
 */
import { BigNumber } from "../../../utils/types/BigNumber";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { CompactAddressObject, CompactAddressObjectJson } from "../CompactAddressObject";
import { ResponseURI, ResponseURIJson } from "../ResponseURI";
export interface AuthenticationRequestDetailsInterface {
    version?: BigNumber;
    flags?: BigNumber;
    requestID: string;
    recipientConstraints?: Array<RecipientConstraint>;
    responseURIs?: Array<ResponseURI>;
    expiryTime?: BigNumber;
}
export interface RecipientConstraintJson {
    type: number;
    identity: CompactAddressObjectJson;
}
export interface RecipientConstraint {
    type: number;
    identity: CompactAddressObject;
}
export interface AuthenticationRequestDetailsJson {
    version: number;
    requestid: string;
    flags: number;
    recipientConstraints?: Array<RecipientConstraintJson>;
    responseURIs?: Array<ResponseURIJson>;
    expirytime?: number;
}
export declare class AuthenticationRequestDetails implements SerializableEntity {
    version: BigNumber;
    flags?: BigNumber;
    requestID: string;
    recipientConstraints?: Array<RecipientConstraint>;
    responseURIs?: Array<ResponseURI>;
    expiryTime?: BigNumber;
    static DEFAULT_VERSION: import("bn.js");
    static VERSION_FIRSTVALID: import("bn.js");
    static VERSION_LASTVALID: import("bn.js");
    static FLAG_HAS_RECIPIENT_CONSTRAINTS: import("bn.js");
    static FLAG_HAS_RESPONSE_URIS: import("bn.js");
    static FLAG_HAS_EXPIRY_TIME: import("bn.js");
    static REQUIRED_ID: number;
    static REQUIRED_SYSTEM: number;
    static REQUIRED_PARENT: number;
    constructor(request?: AuthenticationRequestDetailsInterface);
    hasRecipentConstraints(): boolean;
    hasResponseURIs(): boolean;
    hasExpiryTime(): boolean;
    calcFlags(flags?: BigNumber): BigNumber;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): AuthenticationRequestDetailsJson;
    static fromJson(data: AuthenticationRequestDetailsJson): AuthenticationRequestDetails;
    setFlags(): void;
    isValid(): boolean;
}
