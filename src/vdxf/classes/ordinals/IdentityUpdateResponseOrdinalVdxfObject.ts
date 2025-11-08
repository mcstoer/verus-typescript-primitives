import { VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { IdentityUpdateResponseDetails, IdentityUpdateResponseDetailsJson } from "../identity/IdentityUpdateResponseDetails";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";

export class IdentityUpdateResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: IdentityUpdateResponseDetails;

  constructor(
    response: OrdinalVdxfObjectInterfaceTemplate<IdentityUpdateResponseDetails> = {
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

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<IdentityUpdateResponseDetailsJson>): IdentityUpdateResponseOrdinalVdxfObject {
    return new IdentityUpdateResponseOrdinalVdxfObject({
      data: IdentityUpdateResponseDetails.fromJson(details.data)
    })
  }
}