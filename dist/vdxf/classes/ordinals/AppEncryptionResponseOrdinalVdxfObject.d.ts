import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { AppEncryptionResponseDetails, AppEncryptionResponseDetailsJson } from "../response/AppEncryptionResponseDetails";
export declare class AppEncryptionResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: AppEncryptionResponseDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<AppEncryptionResponseDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<AppEncryptionResponseDetailsJson>): AppEncryptionResponseOrdinalVdxfObject;
}
