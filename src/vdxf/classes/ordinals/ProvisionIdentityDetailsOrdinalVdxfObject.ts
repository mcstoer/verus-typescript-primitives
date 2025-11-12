import { VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { ProvisionIdentityDetails, ProvisionIdentityDetailsJson } from "../requestobjects/ProvisionIdentityDetails";

export class ProvisionIdentityDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: ProvisionIdentityDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<ProvisionIdentityDetails> = {
      data: new ProvisionIdentityDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS,
        data: request.data
      },
      ProvisionIdentityDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<ProvisionIdentityDetailsJson>): ProvisionIdentityDetailsOrdinalVdxfObject {
    return new ProvisionIdentityDetailsOrdinalVdxfObject({
      data: ProvisionIdentityDetails.fromJson(details.data)
    })
  }
}