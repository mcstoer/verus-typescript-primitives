import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { AuthenticationResponseDetails, AuthenticationResponseDetailsJson } from "../login/AuthenticationResponseDetails";
export declare class AuthenticationResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: AuthenticationResponseDetails;
    constructor(response?: OrdinalVDXFObjectInterfaceTemplate<AuthenticationResponseDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<AuthenticationResponseDetailsJson>): AuthenticationResponseOrdinalVDXFObject;
}
