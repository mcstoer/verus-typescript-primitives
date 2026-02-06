import { VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "../payment/VerusPayInvoiceDetails";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";

export class VerusPayInvoiceDetailsOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: VerusPayInvoiceDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<VerusPayInvoiceDetails> = {
      data: new VerusPayInvoiceDetails()
    }
  ) {
    super(
      {
        type: VERUSPAY_INVOICE_DETAILS_VDXF_ORDINAL,
        data: request.data
      },
      VerusPayInvoiceDetails
    );
  }

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<VerusPayInvoiceDetailsJson>): VerusPayInvoiceDetailsOrdinalVDXFObject {
    return new VerusPayInvoiceDetailsOrdinalVDXFObject({
      data: VerusPayInvoiceDetails.fromJson(details.data)
    })
  }
}