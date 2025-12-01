import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { UserSpecificDataPacketDetails, UserSpecificDataPacketDetailsJson } from "../requestobjects/UserSpecificDataPacketDetails";
export declare class UserSpecificDataPacketDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: UserSpecificDataPacketDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<UserSpecificDataPacketDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<UserSpecificDataPacketDetailsJson>): UserSpecificDataPacketDetailsOrdinalVDXFObject;
}
