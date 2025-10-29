import { BigNumber } from '../../utils/types/BigNumber';
import { SerializableEntity } from '../../utils/types/SerializableEntity';
import { CompactIdAddressObject } from './CompactIdAddressObject';
import { SignatureData } from '../../pbaas';
export interface VerifiableSignatureDataJson {
    version: number;
    flags: number;
    hashtype: number;
    systemid: string;
    identityid: string;
    vdxfkeys?: Array<string>;
    vdxfkeynames?: Array<string>;
    boundhashes?: Array<string>;
    signature: string;
}
export interface VerifiableSignatureDataInterface {
    version: BigNumber;
    flags: BigNumber;
    hashType: BigNumber;
    systemId: CompactIdAddressObject;
    identityId: CompactIdAddressObject;
    vdxfKeys?: Array<string>;
    vdxfKeyNames?: Array<string>;
    boundHashes?: Array<Buffer>;
    statements?: Array<Buffer>;
    signatureAsVch: Buffer;
}
export declare class VerifiableSignatureData implements SerializableEntity {
    version: BigNumber;
    flags: BigNumber;
    hashType: BigNumber;
    identityId: CompactIdAddressObject;
    systemId: CompactIdAddressObject;
    vdxfKeys?: Array<string>;
    vdxfKeyNames?: Array<string>;
    boundHashes?: Array<Buffer>;
    statements?: Array<Buffer>;
    signatureAsVch: Buffer;
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static TYPE_VERUSID_DEFAULT: import("bn.js");
    static FLAG_HAS_VDXF_KEYS: import("bn.js");
    static FLAG_HAS_VDXF_KEY_NAMES: import("bn.js");
    static FLAG_HAS_BOUND_HASHES: import("bn.js");
    static FLAG_HAS_STATEMENTS: import("bn.js");
    constructor(data?: VerifiableSignatureDataInterface);
    private hasFlag;
    private setFlag;
    hasVdxfKeys(): boolean;
    hasVdxfKeyNames(): boolean;
    hasBoundHashes(): boolean;
    hasStatements(): boolean;
    setHasVdxfKeys(): void;
    setHasVdxfKeyNames(): void;
    setHasBoundHashes(): void;
    setHasStatements(): void;
    setFlags(): void;
    private getBufferEncodingLength;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    getIdentityHash(height: number, sigHash: Buffer): Buffer<ArrayBufferLike>;
    toSignatureData(sigHash: Buffer): SignatureData;
    toJson(): {};
}
