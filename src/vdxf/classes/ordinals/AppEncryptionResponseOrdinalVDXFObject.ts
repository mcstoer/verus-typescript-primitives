import { VDXF_ORDINAL_APP_ENCRYPTION_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { AppEncryptionResponseDetails, AppEncryptionResponseDetailsJson } from "../response/AppEncryptionResponseDetails";

export class AppEncryptionResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: AppEncryptionResponseDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<AppEncryptionResponseDetails> = {
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

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<AppEncryptionResponseDetailsJson>): AppEncryptionResponseOrdinalVDXFObject {
    return new AppEncryptionResponseOrdinalVDXFObject({
      data: AppEncryptionResponseDetails.fromJson(details.data)
    })
  }
}