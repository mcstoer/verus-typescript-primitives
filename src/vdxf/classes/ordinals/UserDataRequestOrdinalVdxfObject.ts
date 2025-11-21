import { VDXF_ORDINAL_USER_DATA_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { UserDataRequest, UserDataRequestJson } from "../requestobjects/UserDataRequest";

export class UserDataRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: UserDataRequest;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<UserDataRequest> = {
      data: new UserDataRequest()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_USER_DATA_REQUEST,
        data: request.data
      },
      UserDataRequest
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<UserDataRequestJson>): UserDataRequestOrdinalVdxfObject {
    return new UserDataRequestOrdinalVdxfObject({
      data: UserDataRequest.fromJson(details.data)
    })
  }
}
