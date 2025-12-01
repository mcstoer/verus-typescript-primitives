import { VDXF_ORDINAL_AUTHENTICATION_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { AuthenticationRequestDetails, AuthenticationRequestDetailsJson } from "../login/AuthenticationRequestDetails";

export class AuthenticationRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: AuthenticationRequestDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<AuthenticationRequestDetails> = {
      data: new AuthenticationRequestDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_AUTHENTICATION_REQUEST,
        data: request.data
      },
      AuthenticationRequestDetails
    );
  }

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<AuthenticationRequestDetailsJson>): AuthenticationRequestOrdinalVDXFObject {
    return new AuthenticationRequestOrdinalVDXFObject({
      data: AuthenticationRequestDetails.fromJson(details.data)
    })
  }
}