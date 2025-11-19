import { VDXF_ORDINAL_DATA_DESCRIPTOR_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AppEncryptionRequestDetails, AppEncryptionRequestDetailsJson } from "../requestobjects/AppEncryptionRequestDetails";
import { DataDescriptorResponse, DataDescriptorResponseJson } from "../response/DataDescriptorResponse";

export class DataDescriptorResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: DataDescriptorResponse;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<DataDescriptorResponse> = {
      data: new DataDescriptorResponse()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_DATA_DESCRIPTOR_RESPONSE,
        data: request.data
      },
      DataDescriptorResponse
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataDescriptorResponseJson>): DataDescriptorResponseOrdinalVdxfObject {
    return new DataDescriptorResponseOrdinalVdxfObject({
      data: DataDescriptorResponse.fromJson(details.data)
    })
  }
}