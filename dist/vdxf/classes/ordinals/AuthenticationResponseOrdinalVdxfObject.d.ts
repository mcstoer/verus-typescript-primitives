import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AuthenticationResponseDetails, AuthenticationResponseDetailsJson } from "../login/AuthenticationResponseDetails";
export declare class AuthenticationResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: AuthenticationResponseDetails;
    constructor(response?: OrdinalVdxfObjectInterfaceTemplate<AuthenticationResponseDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<AuthenticationResponseDetailsJson>): AuthenticationResponseOrdinalVdxfObject;
}
