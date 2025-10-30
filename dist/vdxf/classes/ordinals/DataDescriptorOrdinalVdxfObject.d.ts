import { DataDescriptor, DataDescriptorJson } from "../../../pbaas";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
export declare class DataDescriptorOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: DataDescriptor;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<DataDescriptor>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataDescriptorJson>): DataDescriptorOrdinalVdxfObject;
}
