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
export type CompactAddressIVariant = "COMPACT_ADDR_I_VARIANT";
export type CompactAddressXVariant = "COMPACT_ADDR_X_VARIANT";
export type CompactAddressVariantName = CompactAddressIVariant | CompactAddressXVariant;
export type CompactAddressVariantAllowedType<T extends CompactAddressVariantName> = T extends CompactAddressIVariant ? `${1 | 2}` : T extends CompactAddressXVariant ? `${1 | 3}` : never;
export declare class CompactAddressObject<V extends CompactAddressVariantName = CompactAddressIVariant> implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static TYPE_FQN: import("bn.js");
    static TYPE_I_ADDRESS: import("bn.js");
    static TYPE_X_ADDRESS: import("bn.js");
    version: BigNumber;
    type: CompactAddressVariantAllowedType<V>;
    address: string;
    rootSystemName: string;
    nameSpace: string;
    constructor(data?: CompactAddressObjectInterface);
    get BNType(): import("bn.js");
    set setType(type: BigNumber);
    isFQN(): boolean;
    isIaddress(): boolean;
    isXaddress(): boolean;
    isValid(): boolean;
    toIAddress(): string;
    toXAddress(): string;
    static fromIAddress(iaddr: string): CompactAddressObject<CompactAddressIVariant>;
    static fromXAddress(xaddr: string, nameSpace?: string): CompactAddressObject<CompactAddressXVariant>;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): CompactAddressObjectJson;
    static fromJson<V extends CompactAddressVariantName>(json: any): CompactAddressObject<V>;
}
export declare class CompactXAddressObject extends CompactAddressObject<CompactAddressXVariant> {
    static fromAddress(xaddr: string, nameSpace?: string): CompactXAddressObject;
    toAddress(): string;
}
