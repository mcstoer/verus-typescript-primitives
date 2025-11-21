import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { DataPacketResponse, DataResponseJson } from "../datapacket/DataPacketResponse";
export declare class DataPacketResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: DataPacketResponse;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<DataPacketResponse>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataResponseJson>): DataPacketResponseOrdinalVdxfObject;
}
