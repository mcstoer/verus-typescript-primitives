import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { AuthenticationRequestDetails, AuthenticationRequestDetailsJson } from "../login/AuthenticationRequestDetails";
export declare class AuthenticationRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: AuthenticationRequestDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<AuthenticationRequestDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<AuthenticationRequestDetailsJson>): AuthenticationRequestOrdinalVDXFObject;
}
