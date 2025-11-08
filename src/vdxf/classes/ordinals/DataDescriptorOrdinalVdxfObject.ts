import { VDXF_ORDINAL_DATA_DESCRIPTOR } from "../../../constants/ordinals/ordinals";
import { DataDescriptor, DataDescriptorJson } from "../../../pbaas";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";

export class DataDescriptorOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: DataDescriptor;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<DataDescriptor> = {
      data: new DataDescriptor()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_DATA_DESCRIPTOR,
        data: request.data
      },
      DataDescriptor
    );
  }

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataDescriptorJson>): DataDescriptorOrdinalVdxfObject {
    return new DataDescriptorOrdinalVdxfObject({
      data: DataDescriptor.fromJson(details.data)
    })
  }
}