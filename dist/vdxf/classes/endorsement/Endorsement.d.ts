import { BigNumber } from '../../../utils/types/BigNumber';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { VdxfUniValue } from '../../../pbaas/VdxfUniValue';
import { SignatureData, SignatureJsonDataInterface } from '../../../pbaas/SignatureData';
import { VDXFKeyInterface } from '../../keys';
export declare const ENDORSEMENT: VDXFKeyInterface;
export declare const ENDORSEMENT_SKILL: VDXFKeyInterface;
export declare const ENDORSEMENT_QUALIFICATION: VDXFKeyInterface;
export declare const ENDORSEMENT_REFERENCE: VDXFKeyInterface;
export declare const ENDORSEMENT_PROJECT: VDXFKeyInterface;
export interface EndorsementJson {
    version: number;
    flags?: number;
    endorsee: string;
    message?: string;
    reference: string;
    metadata?: any;
    signature?: SignatureJsonDataInterface;
    txid?: string;
}
export declare class Endorsement implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static VERSION_FIRST: import("bn.js");
    static VERSION_LAST: import("bn.js");
    static VERSION_CURRENT: import("bn.js");
    static FLAGS_HAS_METADATA: import("bn.js");
    static FLAGS_HAS_SIGNATURE: import("bn.js");
    static FLAGS_HAS_TXID: import("bn.js");
    static FLAGS_HAS_MESSAGE: import("bn.js");
    version: BigNumber;
    flags: BigNumber;
    endorsee: string;
    message: string;
    reference: Buffer;
    txid: Buffer;
    metaData: VdxfUniValue | null;
    signature: SignatureData | null;
    constructor(data?: {
        version?: BigNumber;
        flags?: BigNumber;
        endorsee?: string;
        message?: string;
        reference?: Buffer;
        metaData?: VdxfUniValue | null;
        signature?: SignatureData | null;
        txid?: Buffer;
    });
    getByteLength(): number;
    setFlags(): void;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toIdentityUpdateJson(type: VDXFKeyInterface): {
        [key: string]: {
            [key: string]: [string];
        };
    };
    createHash(name: any): Buffer<ArrayBufferLike>;
    toJson(): {
        version: string;
        flags: string;
        endorsee: string;
        message: string;
        reference: string;
    };
    static fromJson(json: EndorsementJson): Endorsement;
}
