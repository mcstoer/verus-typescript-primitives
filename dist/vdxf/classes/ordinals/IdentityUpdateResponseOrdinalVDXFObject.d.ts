import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { IdentityUpdateResponseDetails, IdentityUpdateResponseDetailsJson } from "../identity/IdentityUpdateResponseDetails";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
export declare class IdentityUpdateResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: IdentityUpdateResponseDetails;
    constructor(response?: OrdinalVDXFObjectInterfaceTemplate<IdentityUpdateResponseDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<IdentityUpdateResponseDetailsJson>): IdentityUpdateResponseOrdinalVDXFObject;
}
