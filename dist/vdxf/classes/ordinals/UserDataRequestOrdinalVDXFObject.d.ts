import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { UserDataRequestDetails, UserDataRequestJson } from "../data/UserDataRequestDetails";
export declare class UserDataRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: UserDataRequestDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<UserDataRequestDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<UserDataRequestJson>): UserDataRequestOrdinalVDXFObject;
}
