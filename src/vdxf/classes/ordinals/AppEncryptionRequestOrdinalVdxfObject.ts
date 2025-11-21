import { VDXF_ORDINAL_APP_ENCRYPTION_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AppEncryptionRequestDetails, AppEncryptionRequestJson } from "../requestobjects/AppEncryptionRequestDetails";

export class AppEncryptionRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: AppEncryptionRequestDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<AppEncryptionRequestDetails> = {
      data: new AppEncryptionRequestDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_APP_ENCRYPTION_REQUEST,
        data: request.data
      },
      AppEncryptionRequestDetails
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<AppEncryptionRequestJson>): AppEncryptionRequestOrdinalVdxfObject {
    return new AppEncryptionRequestOrdinalVdxfObject({
      data: AppEncryptionRequestDetails.fromJson(details.data)
    })
  }
}