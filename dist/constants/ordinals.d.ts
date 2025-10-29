import { DataDescriptor, DataDescriptorJson } from "../pbaas";
import { IdentityUpdateDetailsJson, IdentityUpdateRequestDetails, VerusPayInvoiceDetails } from "../vdxf/classes";
import { VerusPayInvoiceDetailsJson } from "../vdxf/classes/payment/VerusPayInvoiceDetails";
export type OrdinalVdxfObjectReservedData = DataDescriptor | VerusPayInvoiceDetails | IdentityUpdateRequestDetails;
export type OrdinalVdxfObjectReservedDataJson = DataDescriptorJson | VerusPayInvoiceDetailsJson | IdentityUpdateDetailsJson;
export declare const VDXF_ORDINAL_DATA_DESCRIPTOR: import("bn.js");
export declare const VDXF_ORDINAL_VERUSPAY_INVOICE: import("bn.js");
export declare const VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST: import("bn.js");
