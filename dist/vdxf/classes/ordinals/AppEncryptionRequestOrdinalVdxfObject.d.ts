import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AppEncryptionRequestDetails, AppEncryptionRequestJson } from "../requestobjects/AppEncryptionRequestDetails";
export declare class AppEncryptionRequestOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: AppEncryptionRequestDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<AppEncryptionRequestDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<AppEncryptionRequestJson>): AppEncryptionRequestOrdinalVdxfObject;
}
