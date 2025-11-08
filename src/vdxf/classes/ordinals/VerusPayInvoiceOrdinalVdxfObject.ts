import { VDXF_ORDINAL_VERUSPAY_INVOICE } from "../../../constants/ordinals/ordinals";
import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "../payment/VerusPayInvoiceDetails";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";

export class VerusPayInvoiceOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
  data: VerusPayInvoiceDetails;

  constructor(
    request: OrdinalVdxfObjectInterfaceTemplate<VerusPayInvoiceDetails> = {
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

  static fromJson(details: OrdinalVdxfObjectJsonTemplate<VerusPayInvoiceDetailsJson>): VerusPayInvoiceOrdinalVdxfObject {
    return new VerusPayInvoiceOrdinalVdxfObject({
      data: VerusPayInvoiceDetails.fromJson(details.data)
    })
  }
}