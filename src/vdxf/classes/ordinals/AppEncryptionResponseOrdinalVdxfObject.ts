import { VDXF_ORDINAL_APP_ENCRYPTION_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AppEncryptionResponseDetails, AppEncryptionResponseDetailsJson } from "../response/AppEncryptionResponseDetails";

export class AppEncryptionResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: AppEncryptionResponseDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<AppEncryptionResponseDetails> = {
      data: new AppEncryptionResponseDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_APP_ENCRYPTION_RESPONSE,
        data: request.data
      },
      AppEncryptionResponseDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<AppEncryptionResponseDetailsJson>): AppEncryptionResponseOrdinalVdxfObject {
    return new AppEncryptionResponseOrdinalVdxfObject({
      data: AppEncryptionResponseDetails.fromJson(details.data)
    })
  }
}