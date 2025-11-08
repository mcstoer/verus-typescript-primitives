import { DataDescriptor, DataDescriptorJson } from "../../pbaas";
import { IdentityUpdateRequestDetails, IdentityUpdateRequestDetailsJson, IdentityUpdateResponseDetails, IdentityUpdateResponseDetailsJson, VerusPayInvoiceDetails } from "../../vdxf/classes";
import { VerusPayInvoiceDetailsJson } from "../../vdxf/classes/payment/VerusPayInvoiceDetails";
export type OrdinalVdxfObjectReservedData = DataDescriptor | VerusPayInvoiceDetails | IdentityUpdateRequestDetails | IdentityUpdateResponseDetails;
export type OrdinalVdxfObjectReservedDataJson = DataDescriptorJson | VerusPayInvoiceDetailsJson | IdentityUpdateRequestDetailsJson | IdentityUpdateResponseDetailsJson;
