import { VDXF_ORDINAL_LOGIN_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { LoginRequestDetails, LoginRequestDetailsJson } from "../login/LoginRequestDetails";

export class LoginRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: LoginRequestDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<LoginRequestDetails> = {
      data: new LoginRequestDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_LOGIN_REQUEST,
        data: request.data
      },
      LoginRequestDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<LoginRequestDetailsJson>): LoginRequestOrdinalVdxfObject {
    return new LoginRequestOrdinalVdxfObject({
      data: LoginRequestDetails.fromJson(details.data)
    })
  }
}