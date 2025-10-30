import { DATA_TYPE_OBJECT_DATADESCRIPTOR, IDENTITY_UPDATE_REQUEST_DETAILS_VDXF_KEY, IDENTITY_UPDATE_RESPONSE_DETAILS_VDXF_KEY, VERUSPAY_INVOICE_DETAILS_VDXF_KEY } from "../../vdxf";
import { DataDescriptorOrdinalVdxfObject } from "../../vdxf/classes/ordinals/DataDescriptorOrdinalVdxfObject";
import { IdentityUpdateRequestOrdinalVdxfObject } from "../../vdxf/classes/ordinals/IdentityUpdateRequestOrdinalVdxfObject";
import { IdentityUpdateResponseOrdinalVdxfObject } from "../../vdxf/classes/ordinals/IdentityUpdateResponseOrdinalVdxfObject";
import { OrdinalVdxfObjectOrdinalMap } from "../../vdxf/classes/ordinals/OrdinalVdxfObjectOrdinalMap";
import { VerusPayInvoiceOrdinalVdxfObject } from "../../vdxf/classes/ordinals/VerusPayInvoiceOrdinalVdxfObject";
import { VDXF_ORDINAL_DATA_DESCRIPTOR, VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST, VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE, VDXF_ORDINAL_VERUSPAY_INVOICE } from "./ordinals";

export const registerOrdinals = () => {
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_DATA_DESCRIPTOR.toNumber(), DATA_TYPE_OBJECT_DATADESCRIPTOR.vdxfid, DataDescriptorOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_VERUSPAY_INVOICE.toNumber(), VERUSPAY_INVOICE_DETAILS_VDXF_KEY.vdxfid, VerusPayInvoiceOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST.toNumber(), IDENTITY_UPDATE_REQUEST_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateRequestOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE.toNumber(), IDENTITY_UPDATE_RESPONSE_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateResponseOrdinalVdxfObject, false);
}