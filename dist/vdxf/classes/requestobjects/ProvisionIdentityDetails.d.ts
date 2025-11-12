/**
 * ProvisioningIdentity - Class for handling identity provisioning requests
 *
 * This class is used when an application is requesting the provisioning or creation of a new identity
 * within the Verus blockchain ecosystem. The request includes:
 * - System ID (e.g., VRSC@) defining the blockchain system
 * - Parent ID (e.g., Token@) defining the parent namespace
 * - Identity ID (e.g., john.VRSC@) defining the full identity to be provisioned
 * - Flags indicating which components are present and required
 *
 * The user's wallet can use these parameters to understand the complete identity hierarchy
 * and present a clear provisioning request to the user, showing the system context,
 * parent namespace, and the specific identity being created. This enables secure,
 * user-controlled identity provisioning with proper namespace management.
 */
import { BigNumber } from "../../../utils/types/BigNumber";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { CompactIdAddressObject, CompactIdAddressObjectJson } from "../CompactIdAddressObject";
export interface ProvisionIdentityDetailsInterface {
    version?: BigNumber;
    flags: BigNumber;
    systemID?: CompactIdAddressObject;
    parentID?: CompactIdAddressObject;
    identityID?: CompactIdAddressObject;
}
export interface ProvisionIdentityDetailsJson {
    version?: number;
    flags: number;
    systemid?: CompactIdAddressObjectJson;
    parentid?: CompactIdAddressObjectJson;
    identityid?: CompactIdAddressObjectJson;
}
export declare class ProvisionIdentityDetails implements SerializableEntity {
    version: BigNumber;
    flags: BigNumber;
    systemID?: CompactIdAddressObject;
    parentID?: CompactIdAddressObject;
    identityID?: CompactIdAddressObject;
    static DEFAULT_VERSION: import("bn.js");
    static VERSION_FIRSTVALID: import("bn.js");
    static VERSION_LASTVALID: import("bn.js");
    static FLAG_HAS_SYSTEMID: import("bn.js");
    static FLAG_HAS_PARENTID: import("bn.js");
    static FLAG_IS_A_DEFINED_NAME_TO_PROVISION: import("bn.js");
    constructor(data?: ProvisionIdentityDetailsInterface);
    hasSystemId(): boolean;
    hasParentId(): boolean;
    hasIdentityId(): boolean;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): ProvisionIdentityDetailsJson;
    static fromJson(data: any): ProvisionIdentityDetails;
    calcFlags(): BigNumber;
    setFlags(): void;
    isValid(): boolean;
}
