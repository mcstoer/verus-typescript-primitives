import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AppEncryptionRequestDetails, AppEncryptionRequestDetailsJson } from "../requestobjects/AppEncryptionRequestDetails";
export declare class AppEncryptionRequestDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: AppEncryptionRequestDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<AppEncryptionRequestDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<AppEncryptionRequestDetailsJson>): AppEncryptionRequestDetailsOrdinalVdxfObject;
}
