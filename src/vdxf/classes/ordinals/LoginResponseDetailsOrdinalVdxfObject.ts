import { VDXF_ORDINAL_LOGIN_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { LoginResponseDetails, LoginResponseDetailsJson } from "../login/LoginResponseDetails";

export class LoginResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: LoginResponseDetails;

  constructor(
    response: OrdinalVdxfObjectInterfaceTemplate<LoginResponseDetails> = {
      data: new LoginResponseDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_LOGIN_RESPONSE,
        data: response.data
      },
      LoginResponseDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<LoginResponseDetailsJson>): LoginResponseOrdinalVdxfObject {
    return new LoginResponseOrdinalVdxfObject({
      data: LoginResponseDetails.fromJson(details.data)
    })
  }
}