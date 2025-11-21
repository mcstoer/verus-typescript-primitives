import { VDXF_ORDINAL_APP_ENCRYPTION_REQUEST } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AppEncryptionRequest, AppEncryptionRequestJson } from "../requestobjects/AppEncryptionRequest";

export class AppEncryptionRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: AppEncryptionRequest;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<AppEncryptionRequest> = {
      data: new AppEncryptionRequest()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_APP_ENCRYPTION_REQUEST,
        data: request.data
      },
      AppEncryptionRequest
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<AppEncryptionRequestJson>): AppEncryptionRequestOrdinalVdxfObject {
    return new AppEncryptionRequestOrdinalVdxfObject({
      data: AppEncryptionRequest.fromJson(details.data)
    })
  }
}