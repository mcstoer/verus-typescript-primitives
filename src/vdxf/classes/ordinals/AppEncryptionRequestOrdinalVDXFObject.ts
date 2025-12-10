import { VDXF_ORDINAL_APP_ENCRYPTION_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { AppEncryptionRequestDetails, AppEncryptionRequestJson } from "../appencryption/AppEncryptionRequestDetails";

export class AppEncryptionRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: AppEncryptionRequestDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<AppEncryptionRequestDetails> = {
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

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<AppEncryptionRequestJson>): AppEncryptionRequestOrdinalVDXFObject {
    return new AppEncryptionRequestOrdinalVDXFObject({
      data: AppEncryptionRequestDetails.fromJson(details.data)
    })
  }
}