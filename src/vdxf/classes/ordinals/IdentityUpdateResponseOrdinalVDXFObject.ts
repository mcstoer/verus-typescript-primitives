import { VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { IdentityUpdateResponseDetails, IdentityUpdateResponseDetailsJson } from "../identity/IdentityUpdateResponseDetails";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";

export class IdentityUpdateResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: IdentityUpdateResponseDetails;

  constructor(
    response: OrdinalVDXFObjectInterfaceTemplate<IdentityUpdateResponseDetails> = {
      data: new IdentityUpdateResponseDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE,
        data: response.data
      },
      IdentityUpdateResponseDetails
    );
  }

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<IdentityUpdateResponseDetailsJson>): IdentityUpdateResponseOrdinalVDXFObject {
    return new IdentityUpdateResponseOrdinalVDXFObject({
      data: IdentityUpdateResponseDetails.fromJson(details.data)
    })
  }
}