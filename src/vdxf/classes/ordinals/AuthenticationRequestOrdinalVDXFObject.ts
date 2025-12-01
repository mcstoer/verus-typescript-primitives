import { VDXF_ORDINAL_AUTHENTICATION_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AuthenticationRequestDetails, AuthenticationRequestDetailsJson } from "../login/AuthenticationRequestDetails";

export class AuthenticationRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: AuthenticationRequestDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<AuthenticationRequestDetails> = {
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

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<AuthenticationRequestDetailsJson>): AuthenticationRequestOrdinalVdxfObject {
    return new AuthenticationRequestOrdinalVdxfObject({
      data: AuthenticationRequestDetails.fromJson(details.data)
    })
  }
}