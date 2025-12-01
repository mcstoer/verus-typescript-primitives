import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AuthenticationRequestDetails, AuthenticationRequestDetailsJson } from "../login/AuthenticationRequestDetails";
export declare class AuthenticationRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: AuthenticationRequestDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<AuthenticationRequestDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<AuthenticationRequestDetailsJson>): AuthenticationRequestOrdinalVdxfObject;
}
