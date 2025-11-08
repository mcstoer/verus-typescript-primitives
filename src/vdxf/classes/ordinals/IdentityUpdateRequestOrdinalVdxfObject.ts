import { VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { IdentityUpdateRequestDetails, IdentityUpdateRequestDetailsJson } from "../identity/IdentityUpdateRequestDetails";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";

export class IdentityUpdateRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: IdentityUpdateRequestDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<IdentityUpdateRequestDetails> = {
      data: new IdentityUpdateRequestDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST,
        data: request.data
      },
      IdentityUpdateRequestDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<IdentityUpdateRequestDetailsJson>): IdentityUpdateRequestOrdinalVdxfObject {
    return new IdentityUpdateRequestOrdinalVdxfObject({
      data: IdentityUpdateRequestDetails.fromJson(details.data)
    })
  }
}