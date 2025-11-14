import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { LoginResponseDetails, LoginResponseDetailsJson } from "../login/LoginResponseDetails";
export declare class LoginResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: LoginResponseDetails;
    constructor(response?: OrdinalVdxfObjectInterfaceTemplate<LoginResponseDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<LoginResponseDetailsJson>): LoginResponseOrdinalVdxfObject;
}
