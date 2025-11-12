/**
 * PersonalUserDataDetails - Class for handling personal user data transfer requests
 *
 * This class is used when an application is requesting to transfer or receive personal
 * user data. The request includes:
 * - Data objects as DataDescriptor instances containing the user's personal data
 * - Optional statements array for additional context or transfer conditions
 * - Optional signature data for verification of the transfer
 * - Flags indicating transfer direction and optional components
 *
 * The user's wallet can use these parameters to present the data transfer request
 * to the user, showing what personal data is being transferred, any associated
 * statements or conditions, and whether it's for the user's signature or being
 * transmitted to/from the user. This enables secure, user-controlled personal
 * data sharing with clear visibility into what data is being transferred.
 */
import { BigNumber } from '../../../utils/types/BigNumber';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { DataDescriptor, DataDescriptorJson } from '../../../pbaas';
import { VerifiableSignatureData, VerifiableSignatureDataJson } from '../../../vdxf/classes/VerifiableSignatureData';
export interface PersonalUserDataDetailsInterface {
    version?: BigNumber;
    flags: BigNumber;
    signableObjects: Array<DataDescriptor>;
    statements?: Array<string>;
    signature?: VerifiableSignatureData;
}
export interface PersonalUserDataDetailsJson {
    version: number;
    flags: number;
    signableobjects: Array<DataDescriptorJson>;
    statements?: Array<string>;
    signature?: VerifiableSignatureDataJson;
}
export declare class PersonalUserDataDetails implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static HAS_STATEMENTS: import("bn.js");
    static HAS_SIGNATURE: import("bn.js");
    static FOR_USERS_SIGNATURE: import("bn.js");
    static FOR_TRANSMITTAL_TO_USER: import("bn.js");
    static HAS_URL_FOR_DOWNLOAD: import("bn.js");
    version: BigNumber;
    flags: BigNumber;
    signableObjects: Array<DataDescriptor>;
    statements?: Array<string>;
    signature?: VerifiableSignatureData;
    constructor(data?: PersonalUserDataDetailsInterface);
    setFlags(): void;
    calcFlags(): BigNumber;
    hasStatements(): boolean;
    hasSignature(): boolean;
    isValid(): boolean;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): PersonalUserDataDetailsJson;
    static fromJson(json: PersonalUserDataDetailsJson): PersonalUserDataDetails;
}
