import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { IdentityUpdateRequestDetails, IdentityUpdateRequestDetailsJson } from "../identity/IdentityUpdateRequestDetails";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
export declare class IdentityUpdateRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: IdentityUpdateRequestDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<IdentityUpdateRequestDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<IdentityUpdateRequestDetailsJson>): IdentityUpdateRequestOrdinalVDXFObject;
}
