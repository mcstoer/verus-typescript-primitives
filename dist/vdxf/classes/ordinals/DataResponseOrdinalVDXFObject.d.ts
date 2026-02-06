import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { DataResponseDetails, DataResponseDetailsJson } from "../datapacket/DataResponseDetails";
export declare class DataResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: DataResponseDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<DataResponseDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<DataResponseDetailsJson>): DataResponseOrdinalVDXFObject;
}
