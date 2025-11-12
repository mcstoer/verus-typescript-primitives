/**
 * CompactIdentityObject - Class representing an id in the smallest possible format
 *
 * This class is used to represent an identity or address in a compact format, allowing for efficient
 * storage and transmission. The compact id can be represented either as a fully qualified name (FQN)
 * or as an identity address (iaddress). The class includes methods for serialization, deserialization,
 * and validation of the compact id object.
 */
import { BigNumber } from '../../utils/types/BigNumber';
import { SerializableEntity } from '../../utils/types/SerializableEntity';
export interface CompactIdAddressObjectJson {
    version: number;
    type: number;
    address: string;
    rootsystemname: string;
}
export interface CompactIdAddressObjectInterface {
    version?: BigNumber;
    type: BigNumber;
    address: string;
    rootSystemName?: string;
}
export declare class CompactIdAddressObject implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static IS_FQN: import("bn.js");
    static IS_IDENTITYID: import("bn.js");
    version: BigNumber;
    type: BigNumber;
    address: string;
    rootSystemName: string;
    constructor(data?: CompactIdAddressObjectInterface);
    isFQN(): boolean;
    isIaddress(): boolean;
    isValid(): boolean;
    toIAddress(): string;
    static fromIAddress(iaddr: string): CompactIdAddressObject;
    setAddressTransferType(): void;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): CompactIdAddressObjectJson;
    static fromJson(json: any): CompactIdAddressObject;
}
