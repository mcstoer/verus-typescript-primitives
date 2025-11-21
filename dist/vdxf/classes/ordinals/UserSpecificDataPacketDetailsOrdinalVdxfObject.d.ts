import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { UserSpecificDataPacketDetails, UserSpecificDataPacketDetailsJson } from "../requestobjects/UserSpecificDataPacketDetails";
export declare class UserSpecificDataPacketDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: UserSpecificDataPacketDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<UserSpecificDataPacketDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<UserSpecificDataPacketDetailsJson>): UserSpecificDataPacketDetailsOrdinalVdxfObject;
}
