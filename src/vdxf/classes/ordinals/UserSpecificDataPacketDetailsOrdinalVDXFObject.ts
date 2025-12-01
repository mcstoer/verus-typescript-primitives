import { VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { UserSpecificDataPacketDetails, UserSpecificDataPacketDetailsJson } from "../requestobjects/UserSpecificDataPacketDetails";

export class UserSpecificDataPacketDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: UserSpecificDataPacketDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<UserSpecificDataPacketDetails> = {
      data: new UserSpecificDataPacketDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET,
        data: request.data
      },
      UserSpecificDataPacketDetails
    );
  }

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<UserSpecificDataPacketDetailsJson>): UserSpecificDataPacketDetailsOrdinalVDXFObject {
    return new UserSpecificDataPacketDetailsOrdinalVDXFObject({
      data: UserSpecificDataPacketDetails.fromJson(details.data)
    })
  }
}
