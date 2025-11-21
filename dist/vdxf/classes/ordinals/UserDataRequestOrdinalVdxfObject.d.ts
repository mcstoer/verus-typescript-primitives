import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { UserDataRequestDetails, UserDataRequestJson } from "../requestobjects/UserDataRequestDetails";
export declare class UserDataRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: UserDataRequestDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<UserDataRequestDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<UserDataRequestJson>): UserDataRequestOrdinalVdxfObject;
}
