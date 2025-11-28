/**
 * CompactIdentityObject - Class representing an id in the smallest possible format
 *
 * This class is used to represent an identity or address in a compact format, allowing for efficient
 * storage and transmission. The compact id can be represented either as a fully qualified name (FQN)
 * or as an identity address (iaddress) or as an x address (tag/index). The class includes methods for serialization, deserialization,
 * and validation of the compact id object.
 */
import { BigNumber } from '../../utils/types/BigNumber';
import { SerializableEntity } from '../../utils/types/SerializableEntity';
export interface CompactAddressObjectJson {
    version: number;
    type: number;
    address: string;
    rootsystemname: string;
    namespace?: string;
}
export interface CompactAddressObjectInterface {
    version?: BigNumber;
    type: BigNumber;
    address: string;
    rootSystemName?: string;
    nameSpace?: string;
}
export declare class CompactAddressObject implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static IS_FQN: import("bn.js");
    static IS_IDENTITYID: import("bn.js");
    static IS_X_ADDRESS: import("bn.js");
    version: BigNumber;
    type: BigNumber;
    address: string;
    rootSystemName: string;
    nameSpace: string;
    allowedTypes: Array<string>;
    constructor(data?: CompactAddressObjectInterface, allowedTypes?: Array<string>);
    isFQN(): boolean;
    isIaddress(): boolean;
    isXaddress(): boolean;
    isValid(): boolean;
    checkValidity(): void;
    toIAddress(): string;
    toXAddress(): string;
    static fromIAddress(iaddr: string): CompactAddressObject;
    static fromXAddress(xaddr: string, nameSpace?: string): CompactAddressObject;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): CompactAddressObjectJson;
    static fromJson(json: any): CompactAddressObject;
}
