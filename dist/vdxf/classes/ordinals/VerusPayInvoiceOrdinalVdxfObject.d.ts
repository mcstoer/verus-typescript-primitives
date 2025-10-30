import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "../payment/VerusPayInvoiceDetails";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
export declare class VerusPayInvoiceOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: VerusPayInvoiceDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<VerusPayInvoiceDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<VerusPayInvoiceDetailsJson>): VerusPayInvoiceOrdinalVdxfObject;
}
