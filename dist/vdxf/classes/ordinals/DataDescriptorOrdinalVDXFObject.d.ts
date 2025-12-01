import { DataDescriptor, DataDescriptorJson } from "../../../pbaas";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
export declare class DataDescriptorOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: DataDescriptor;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<DataDescriptor>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<DataDescriptorJson>): DataDescriptorOrdinalVDXFObject;
}
