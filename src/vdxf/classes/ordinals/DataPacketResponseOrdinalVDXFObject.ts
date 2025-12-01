import { VDXF_ORDINAL_DATA_RESPONSE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { DataPacketResponse, DataResponseJson } from "../datapacket/DataPacketResponse";

export class DataPacketResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: DataPacketResponse;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<DataPacketResponse> = {
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

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<DataResponseJson>): DataPacketResponseOrdinalVDXFObject {
    return new DataPacketResponseOrdinalVDXFObject({
      data: DataPacketResponse.fromJson(details.data)
    })
  }
}