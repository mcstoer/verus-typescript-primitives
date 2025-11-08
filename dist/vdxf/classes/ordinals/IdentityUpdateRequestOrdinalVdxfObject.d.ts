import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { IdentityUpdateRequestDetails, IdentityUpdateRequestDetailsJson } from "../identity/IdentityUpdateRequestDetails";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
export declare class IdentityUpdateRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: IdentityUpdateRequestDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<IdentityUpdateRequestDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<IdentityUpdateRequestDetailsJson>): IdentityUpdateRequestOrdinalVdxfObject;
}
