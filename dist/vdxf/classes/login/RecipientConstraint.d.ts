import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { CompactAddressObjectJson, CompactIAddressObject } from "../CompactAddressObject";
export interface RecipientConstraintJson {
    type: number;
    identity: CompactAddressObjectJson;
}
export interface RecipientConstraintInterface {
    type: number;
    identity: CompactIAddressObject;
}
export declare class RecipientConstraint implements SerializableEntity {
    type: number;
    identity: CompactIAddressObject;
    constructor(data?: RecipientConstraintInterface);
    static fromData(data: RecipientConstraint | RecipientConstraintInterface): RecipientConstraint;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): RecipientConstraintJson;
    static fromJson(data: RecipientConstraintJson): RecipientConstraint;
}
