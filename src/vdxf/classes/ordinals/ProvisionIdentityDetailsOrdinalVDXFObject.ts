import { VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { ProvisionIdentityDetails, ProvisionIdentityDetailsJson } from "../requestobjects/ProvisionIdentityDetails";

export class ProvisionIdentityDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: ProvisionIdentityDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<ProvisionIdentityDetails> = {
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

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<ProvisionIdentityDetailsJson>): ProvisionIdentityDetailsOrdinalVDXFObject {
    return new ProvisionIdentityDetailsOrdinalVDXFObject({
      data: ProvisionIdentityDetails.fromJson(details.data)
    })
  }
}