import { OrdinalVDXFObjectReservedData } from "../../../constants/ordinals/types";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObject, OrdinalVDXFObjectDataClass, OrdinalVDXFObjectInterfaceTemplate } from "./OrdinalVDXFObject";
export declare class SerializableEntityOrdinalVDXFObject extends OrdinalVDXFObject implements SerializableDataEntity {
    data: OrdinalVDXFObjectReservedData;
    entity: OrdinalVDXFObjectDataClass;
    constructor(request: OrdinalVDXFObjectInterfaceTemplate<OrdinalVDXFObjectReservedData>, entity: OrdinalVDXFObjectDataClass);
    getDataByteLength(): number;
    toDataBuffer(): Buffer;
    fromDataBuffer(buffer: Buffer): void;
}
