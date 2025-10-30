import { DataDescriptor, DataDescriptorJson } from "../../pbaas";
import { IdentityUpdateDetailsJson, IdentityUpdateRequestDetails, IdentityUpdateResponseDetails, IdentityUpdateResponseDetailsJson, VerusPayInvoiceDetails } from "../../vdxf/classes";
import { VerusPayInvoiceDetailsJson } from "../../vdxf/classes/payment/VerusPayInvoiceDetails";
import { OrdinalVdxfObjectClass } from "../../vdxf/classes/OrdinalVdxfObject";
import { BigNumber } from "../../utils/types/BigNumber";
export type OrdinalVdxfObjectReservedData = DataDescriptor | VerusPayInvoiceDetails | IdentityUpdateRequestDetails | IdentityUpdateResponseDetails;
export type OrdinalVdxfObjectReservedDataJson = DataDescriptorJson | VerusPayInvoiceDetailsJson | IdentityUpdateDetailsJson | IdentityUpdateResponseDetailsJson;
export declare const registerOrdinals: () => void;
export declare const getOrdinalVdxfObjectClassForType: (type: BigNumber) => OrdinalVdxfObjectClass;
