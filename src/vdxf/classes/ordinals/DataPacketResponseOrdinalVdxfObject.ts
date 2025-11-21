import { VDXF_ORDINAL_DATA_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { DataPacketResponse, DataResponseJson } from "../datapacket/DataPacketResponse";

export class DataPacketResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: DataPacketResponse;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<DataPacketResponse> = {
      data: new DataPacketResponse()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_DATA_RESPONSE,
        data: request.data
      },
      DataPacketResponse
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataResponseJson>): DataPacketResponseOrdinalVdxfObject {
    return new DataPacketResponseOrdinalVdxfObject({
      data: DataPacketResponse.fromJson(details.data)
    })
  }
}