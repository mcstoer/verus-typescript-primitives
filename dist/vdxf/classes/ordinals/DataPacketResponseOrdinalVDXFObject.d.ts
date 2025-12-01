import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { DataPacketResponse, DataResponseJson } from "../datapacket/DataPacketResponse";
export declare class DataPacketResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: DataPacketResponse;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<DataPacketResponse>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<DataResponseJson>): DataPacketResponseOrdinalVDXFObject;
}
