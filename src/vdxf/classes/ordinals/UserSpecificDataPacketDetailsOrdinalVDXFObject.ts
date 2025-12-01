import { VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { UserSpecificDataPacketDetails, UserSpecificDataPacketDetailsJson } from "../requestobjects/UserSpecificDataPacketDetails";

export class UserSpecificDataPacketDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: UserSpecificDataPacketDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<UserSpecificDataPacketDetails> = {
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

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<UserSpecificDataPacketDetailsJson>): UserSpecificDataPacketDetailsOrdinalVdxfObject {
    return new UserSpecificDataPacketDetailsOrdinalVdxfObject({
      data: UserSpecificDataPacketDetails.fromJson(details.data)
    })
  }
}
