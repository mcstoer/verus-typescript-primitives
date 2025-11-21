import { VDXF_ORDINAL_DATA_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { DataResponse, DataResponseJson } from "../response/DataResponse";

export class DataResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: DataResponse;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<DataResponse> = {
      data: new DataResponse()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_DATA_RESPONSE,
        data: request.data
      },
      DataResponse
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataResponseJson>): DataResponseOrdinalVdxfObject {
    return new DataResponseOrdinalVdxfObject({
      data: DataResponse.fromJson(details.data)
    })
  }
}