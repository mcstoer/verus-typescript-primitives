import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "../payment/VerusPayInvoiceDetails";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";
export declare class VerusPayInvoiceDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
    data: VerusPayInvoiceDetails;
    constructor(request?: OrdinalVDXFObjectInterfaceTemplate<VerusPayInvoiceDetails>);
    static fromJson(details: OrdinalVDXFObjectJsonTemplate<VerusPayInvoiceDetailsJson>): VerusPayInvoiceDetailsOrdinalVDXFObject;
}
