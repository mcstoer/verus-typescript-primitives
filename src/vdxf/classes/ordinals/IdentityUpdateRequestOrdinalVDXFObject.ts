import { IDENTITY_UPDATE_REQUEST_VDXF_ORDINAL } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { IdentityUpdateRequestDetails, IdentityUpdateRequestDetailsJson } from "../identity/IdentityUpdateRequestDetails";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";

export class IdentityUpdateRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: IdentityUpdateRequestDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<IdentityUpdateRequestDetails> = {
      data: new IdentityUpdateRequestDetails()
    }
  ) {
    super(
      {
        type: IDENTITY_UPDATE_REQUEST_VDXF_ORDINAL,
        data: request.data
      },
      IdentityUpdateRequestDetails
    );
  }

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<IdentityUpdateRequestDetailsJson>): IdentityUpdateRequestOrdinalVDXFObject {
    return new IdentityUpdateRequestOrdinalVDXFObject({
      data: IdentityUpdateRequestDetails.fromJson(details.data)
    })
  }
}