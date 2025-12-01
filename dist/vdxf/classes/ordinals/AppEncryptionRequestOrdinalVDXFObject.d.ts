import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { AppEncryptionRequestDetails, AppEncryptionRequestJson } from "../requestobjects/AppEncryptionRequestDetails";
export declare class AppEncryptionRequestOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: AppEncryptionRequestDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<AppEncryptionRequestDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<AppEncryptionRequestJson>): AppEncryptionRequestOrdinalVDXFObject;
}
