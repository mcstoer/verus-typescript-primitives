import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
export interface IdentityMultimapRefJson {
    version: number;
    flags: number;
    vdxfkey: string;
    identityid?: string;
    startheight: number;
    endheight: number;
    datahash?: string;
    systemid?: string;
}
export declare class IdentityMultimapRef implements SerializableEntity {
    version: BigNumber;
    flags: BigNumber;
    id_ID: string;
    key: string;
    height_start: BigNumber;
    height_end: BigNumber;
    data_hash: Buffer;
    system_id: string;
    static FLAG_NO_DELETION: import("bn.js");
    static FLAG_HAS_DATAHASH: import("bn.js");
    static FLAG_HAS_SYSTEM: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static CURRENT_VERSION: import("bn.js");
    constructor(data?: any);
    setFlags(): void;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    isValid(): boolean;
    hasDataHash(): boolean;
    hasSystemID(): boolean;
    toJson(): IdentityMultimapRefJson;
    static fromJson(data: IdentityMultimapRefJson): IdentityMultimapRef;
}
