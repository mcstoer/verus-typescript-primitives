import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { DataPacketRequestDetails, DataPacketRequestDetailsJson } from "../data/DataPacketRequestDetails";
export declare class DataPacketRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: DataPacketRequestDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<DataPacketRequestDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<DataPacketRequestDetailsJson>): DataPacketRequestOrdinalVDXFObject;
}
