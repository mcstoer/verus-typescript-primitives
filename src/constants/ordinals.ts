import { BN } from "bn.js";
import { DataDescriptor, DataDescriptorJson } from "../pbaas";
import { IdentityUpdateDetailsJson, IdentityUpdateRequestDetails, VerusPayInvoiceDetails } from "../vdxf/classes";
import { VerusPayInvoiceDetailsJson } from "../vdxf/classes/payment/VerusPayInvoiceDetails";
import { OrdinalVdxfObjectOrdinalMap } from "../vdxf/classes/OrdinalVdxfObjectOrdinalMap";
import { DATA_TYPE_OBJECT_DATADESCRIPTOR, VERUSPAY_INVOICE_DETAILS_VDXF_KEY } from "../vdxf";

export type OrdinalVdxfObjectReservedData = DataDescriptor | VerusPayInvoiceDetails | IdentityUpdateRequestDetails;
export type OrdinalVdxfObjectReservedDataJson = DataDescriptorJson | VerusPayInvoiceDetailsJson | IdentityUpdateDetailsJson;

export const VDXF_ORDINAL_DATA_DESCRIPTOR = new BN(0, 10);
export const VDXF_ORDINAL_VERUSPAY_INVOICE = new BN(1, 10);
export const VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST = new BN(3, 10);

OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_DATA_DESCRIPTOR.toNumber(), DATA_TYPE_OBJECT_DATADESCRIPTOR.vdxfid);
OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_VERUSPAY_INVOICE.toNumber(), VERUSPAY_INVOICE_DETAILS_VDXF_KEY.vdxfid);