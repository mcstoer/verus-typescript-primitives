import { VDXF_ORDINAL_VERUSPAY_INVOICE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "../payment/VerusPayInvoiceDetails";
import { OrdinalVDXFObjectInterfaceTemplate, OrdinalVDXFObjectJsonTemplate } from "./OrdinalVDXFObject";
import { SerializableEntityOrdinalVDXFObject } from "./SerializableEntityOrdinalVDXFObject";

export class VerusPayInvoiceOrdinalVDXFObject extends SerializableEntityOrdinalVDXFObject implements SerializableDataEntity {
  data: VerusPayInvoiceDetails;

  constructor(
    request: OrdinalVDXFObjectInterfaceTemplate<VerusPayInvoiceDetails> = {
      data: new VerusPayInvoiceDetails()
    }
  ) {
    super(
      {
        type: VDXF_ORDINAL_VERUSPAY_INVOICE,
        data: request.data
      },
      VerusPayInvoiceDetails
    );
  }

  static fromJson(details: OrdinalVDXFObjectJsonTemplate<VerusPayInvoiceDetailsJson>): VerusPayInvoiceOrdinalVDXFObject {
    return new VerusPayInvoiceOrdinalVDXFObject({
      data: VerusPayInvoiceDetails.fromJson(details.data)
    })
  }
}