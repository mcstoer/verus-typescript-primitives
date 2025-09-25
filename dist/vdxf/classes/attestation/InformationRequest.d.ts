import { BigNumber } from '../../../utils/types/BigNumber';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
export declare enum RequestedFormatFlags {
    FULL_DATA = 1,// Whole Credential
    PARTIAL_DATA = 2,// Particular leaf + proof + signature
    COLLECTION = 4
}
export declare enum InformationType {
    ATTESTATION = 1,
    CLAIM = 2,
    CREDENTIAL = 3
}
export interface RequestItemJson {
    version: number;
    format: RequestedFormatFlags;
    type: InformationType;
    id: {
        [key: string]: string;
    };
    signer: string;
    requestedkeys?: string[];
}
export interface IdentityInformationRequestJson {
    version: number;
    items: RequestItemJson[];
}
export declare class RequestItem implements SerializableEntity {
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
    version: BigNumber;
    format: BigNumber;
    type: BigNumber;
    id: {
        [key: string]: string;
    };
    signer: string;
    requestedkeys?: string[];
    constructor(json?: RequestItem);
    isFormatValid(): boolean;
    isValid(): boolean;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJSON(): RequestItemJson;
    fromJSON(json: RequestItemJson): void;
}
export declare class RequestInformation implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    version: BigNumber;
    items: RequestItem[];
    constructor(data: RequestInformation);
    isValid(): boolean;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJSON(): IdentityInformationRequestJson;
    fromJSON(json: IdentityInformationRequestJson): void;
}
