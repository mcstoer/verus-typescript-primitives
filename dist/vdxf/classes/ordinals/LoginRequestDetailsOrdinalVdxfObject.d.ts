import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { LoginRequestDetails, LoginRequestDetailsJson } from "../login/LoginRequestDetails";
export declare class LoginRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: LoginRequestDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<LoginRequestDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<LoginRequestDetailsJson>): LoginRequestOrdinalVdxfObject;
}
