import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
import { AppEncryptionResponseDetails, AppEncryptionResponseDetailsJson } from "../appencryption/AppEncryptionResponseDetails";
export declare class AppEncryptionResponseOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: AppEncryptionResponseDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<AppEncryptionResponseDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<AppEncryptionResponseDetailsJson>): AppEncryptionResponseOrdinalVDXFObject;
}
