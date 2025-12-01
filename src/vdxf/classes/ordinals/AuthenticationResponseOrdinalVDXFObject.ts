import { VDXF_ORDINAL_AUTHENTICATION_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AuthenticationResponseDetails, AuthenticationResponseDetailsJson } from "../login/AuthenticationResponseDetails";

export class AuthenticationResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: AuthenticationResponseDetails;

  constructor(
    response: OrdinalVdxfObjectInterfaceTemplate<AuthenticationResponseDetails> = {
      data: new AuthenticationResponseDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_AUTHENTICATION_RESPONSE,
        data: response.data
      },
      AuthenticationResponseDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<AuthenticationResponseDetailsJson>): AuthenticationResponseOrdinalVdxfObject {
    return new AuthenticationResponseOrdinalVdxfObject({
      data: AuthenticationResponseDetails.fromJson(details.data)
    })
  }
}