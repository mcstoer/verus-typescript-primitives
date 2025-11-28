/**
 * LoginRequestDetails - Class for handling application login and authentication requests
 *
 * This class is used when an application is requesting authentication or login from the user,
 * including specific recipientConstraints and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Callback URIs for post-authentication redirects
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
export interface LoginRequestDetailsInterface {
    version?: BigNumber;
    flags?: BigNumber;
    requestID: string;
    recipientConstraints?: Array<RecipientConstraint>;
    callbackURIs?: Array<callbackURIs>;
    expiryTime?: BigNumber;
}
export interface RecipientConstraintJson {
    type: number;
    identity: CompactAddressObjectJson;
}
export interface callbackURIsJson {
    type: number;
    uri: string;
}
export interface RecipientConstraint {
    type: number;
    identity: CompactAddressObject;
}
export interface callbackURIs {
    type: number;
    uri: string;
}
export interface LoginRequestDetailsJson {
    version: number;
    requestid: string;
    flags: number;
    recipientConstraints?: Array<RecipientConstraintJson>;
    callbackURIs?: Array<callbackURIsJson>;
    expirytime?: number;
}
export declare class LoginRequestDetails implements SerializableEntity {
    version: BigNumber;
    flags?: BigNumber;
    requestID: string;
    recipientConstraints?: Array<RecipientConstraint>;
    callbackURIs?: Array<callbackURIs>;
    expiryTime?: BigNumber;
    static DEFAULT_VERSION: import("bn.js");
    static VERSION_FIRSTVALID: import("bn.js");
    static VERSION_LASTVALID: import("bn.js");
    static FLAG_HAS_RECIPIENT_CONSTRAINTS: import("bn.js");
    static FLAG_HAS_CALLBACK_URI: import("bn.js");
    static FLAG_HAS_EXPIRY_TIME: import("bn.js");
    static REQUIRED_ID: number;
    static REQUIRED_SYSTEM: number;
    static REQUIRED_PARENT: number;
    static TYPE_WEBHOOK: number;
    static TYPE_REDIRECT: number;
    constructor(request?: LoginRequestDetailsInterface);
    hasRecipentConstraints(): boolean;
    hascallbackURIs(): boolean;
    hasExpiryTime(): boolean;
    calcFlags(flags?: BigNumber): BigNumber;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): LoginRequestDetailsJson;
    static fromJson(data: LoginRequestDetailsJson): LoginRequestDetails;
    setFlags(): void;
    isValid(): boolean;
}
