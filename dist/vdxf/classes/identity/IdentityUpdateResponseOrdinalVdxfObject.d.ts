import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate, SerializableEntityOrdinalVdxfObject } from "../OrdinalVdxfObject";
import { IdentityUpdateResponseDetails, IdentityUpdateResponseDetailsJson } from "./IdentityUpdateResponseDetails";
export declare class IdentityUpdateResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: IdentityUpdateResponseDetails;
    constructor(response?: OrdinalVdxfObjectInterfaceTemplate<IdentityUpdateResponseDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<IdentityUpdateResponseDetailsJson>): IdentityUpdateResponseOrdinalVdxfObject;
}
