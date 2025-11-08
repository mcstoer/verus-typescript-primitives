import { OrdinalVdxfObjectReservedData } from "../../../constants/ordinals/types";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObject, OrdinalVdxfObjectDataClass, OrdinalVdxfObjectInterfaceTemplate } from "./OrdinalVdxfObject";
export declare class SerializableEntityOrdinalVdxfObject extends OrdinalVdxfObject implements SerializableDataEntity {
    data: OrdinalVdxfObjectReservedData;
    entity: OrdinalVdxfObjectDataClass;
    constructor(request: OrdinalVdxfObjectInterfaceTemplate<OrdinalVdxfObjectReservedData>, entity: OrdinalVdxfObjectDataClass);
    getDataByteLength(): number;
    toDataBuffer(): Buffer;
    fromDataBuffer(buffer: Buffer): void;
}
