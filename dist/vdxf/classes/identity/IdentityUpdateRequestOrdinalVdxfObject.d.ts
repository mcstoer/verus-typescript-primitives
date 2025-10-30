import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate, SerializableEntityOrdinalVdxfObject } from "../OrdinalVdxfObject";
import { IdentityUpdateRequestDetails, IdentityUpdateRequestDetailsJson } from "./IdentityUpdateRequestDetails";
export declare class IdentityUpdateRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: IdentityUpdateRequestDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<IdentityUpdateRequestDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<IdentityUpdateRequestDetailsJson>): IdentityUpdateRequestOrdinalVdxfObject;
}
