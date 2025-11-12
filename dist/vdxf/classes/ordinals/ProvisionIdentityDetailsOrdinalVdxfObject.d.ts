import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { ProvisionIdentityDetails, ProvisionIdentityDetailsJson } from "../requestobjects/ProvisionIdentityDetails";
export declare class ProvisionIdentityDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: ProvisionIdentityDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<ProvisionIdentityDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<ProvisionIdentityDetailsJson>): ProvisionIdentityDetailsOrdinalVdxfObject;
}
