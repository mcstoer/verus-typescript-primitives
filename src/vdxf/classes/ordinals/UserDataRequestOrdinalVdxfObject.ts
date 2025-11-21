import { VDXF_ORDINAL_USER_DATA_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { UserDataRequestDetails, UserDataRequestJson } from "../requestobjects/UserDataRequestDetails";

export class UserDataRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: UserDataRequestDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<UserDataRequestDetails> = {
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

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<UserDataRequestJson>): UserDataRequestOrdinalVdxfObject {
    return new UserDataRequestOrdinalVdxfObject({
      data: UserDataRequestDetails.fromJson(details.data)
    })
  }
}
