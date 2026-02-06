import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { ProvisionIdentityDetails, ProvisionIdentityDetailsJson } from "../provisioning/ProvisionIdentityDetails";
export declare class ProvisionIdentityDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: ProvisionIdentityDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<ProvisionIdentityDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<ProvisionIdentityDetailsJson>): ProvisionIdentityDetailsOrdinalVDXFObject;
}
