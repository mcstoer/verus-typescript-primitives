import { OrdinalVDXFObjectReservedData } from "../../../constants/ordinals/types";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObject, OrdinalVDXFObjectDataClass, OrdinalVDXFObjectInterfaceTemplate } from "./OrdinalVDXFObject";

export class SerializableEntityOrdinalVDXFObject extends OrdinalVDXFObject implements SerializableDataEntity {
  data: OrdinalVDXFObjectReservedData;
  entity: OrdinalVDXFObjectDataClass;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<OrdinalVDXFObjectReservedData>,
    entity: OrdinalVDXFObjectDataClass
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