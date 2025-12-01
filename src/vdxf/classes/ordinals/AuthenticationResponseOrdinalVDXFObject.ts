import { VDXF_ORDINAL_AUTHENTICATION_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { AuthenticationResponseDetails, AuthenticationResponseDetailsJson } from "../login/AuthenticationResponseDetails";

export class AuthenticationResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: AuthenticationResponseDetails;

  constructor(
    response: OrdinalVDXFObjectInterfaceTemplate<AuthenticationResponseDetails> = {
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

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<AuthenticationResponseDetailsJson>): AuthenticationResponseOrdinalVDXFObject {
    return new AuthenticationResponseOrdinalVDXFObject({
      data: AuthenticationResponseDetails.fromJson(details.data)
    })
  }
}