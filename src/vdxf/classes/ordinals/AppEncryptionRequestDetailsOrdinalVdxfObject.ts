import { VDXF_ORDINAL_APP_ENCRYPTION_REQUEST_DETAILS } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AppEncryptionRequestDetails, AppEncryptionRequestDetailsJson } from "../requestobjects/AppEncryptionRequestDetails";

export class AppEncryptionRequestDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: AppEncryptionRequestDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<AppEncryptionRequestDetails> = {
      data: new AppEncryptionRequestDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_APP_ENCRYPTION_REQUEST_DETAILS,
        data: request.data
      },
      AppEncryptionRequestDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<AppEncryptionRequestDetailsJson>): AppEncryptionRequestDetailsOrdinalVdxfObject {
    return new AppEncryptionRequestDetailsOrdinalVdxfObject({
      data: AppEncryptionRequestDetails.fromJson(details.data)
    })
  }
}