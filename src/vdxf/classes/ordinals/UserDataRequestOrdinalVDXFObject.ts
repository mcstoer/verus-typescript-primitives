import { VDXF_ORDINAL_USER_DATA_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { UserDataRequestDetails, UserDataRequestJson } from "../requestobjects/UserDataRequestDetails";

export class UserDataRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: UserDataRequestDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<UserDataRequestDetails> = {
      data: new UserDataRequestDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_USER_DATA_REQUEST,
        data: request.data
      },
      UserDataRequestDetails
    );
  }

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<UserDataRequestJson>): UserDataRequestOrdinalVDXFObject {
    return new UserDataRequestOrdinalVDXFObject({
      data: UserDataRequestDetails.fromJson(details.data)
    })
  }
}
