import { OrdinalVdxfObjectReservedData } from "../../../constants/ordinals/types";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObject, OrdinalVdxfObjectDataClass, OrdinalVdxfObjectInterfaceTemplate } from "./OrdinalVdxfObject";

export class SerializableEntityOrdinalVdxfObject extends OrdinalVdxfObject implements SerializableDataEntity {
  data: OrdinalVdxfObjectReservedData;
  entity: OrdinalVdxfObjectDataClass;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<OrdinalVdxfObjectReservedData>,
    entity: OrdinalVdxfObjectDataClass
  ) {
    if (!request || !request.type) throw new Error("Expected request with data and type")

    super({
      type: request.type
    });

    this.entity = entity;
    this.data = request.data ? request.data : new entity();
  }

  getDataByteLength(): number {
    return this.data.getByteLength()
  }

  toDataBuffer(): Buffer {
    return this.data.toBuffer();
  }

  fromDataBuffer(buffer: Buffer): void {
    this.data = new this.entity();
    this.data.fromBuffer(buffer);
  }
}