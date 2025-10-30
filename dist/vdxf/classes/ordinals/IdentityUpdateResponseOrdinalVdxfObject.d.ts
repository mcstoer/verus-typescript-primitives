import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { IdentityUpdateResponseDetails, IdentityUpdateResponseDetailsJson } from "../identity/IdentityUpdateResponseDetails";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
export declare class IdentityUpdateResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: IdentityUpdateResponseDetails;
    constructor(response?: OrdinalVdxfObjectInterfaceTemplate<IdentityUpdateResponseDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<IdentityUpdateResponseDetailsJson>): IdentityUpdateResponseOrdinalVdxfObject;
}
