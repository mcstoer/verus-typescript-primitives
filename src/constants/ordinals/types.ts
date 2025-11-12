import { DataDescriptor, DataDescriptorJson } from "../../pbaas";
import { 
  AppEncryptionRequestDetails, 
  AppEncryptionRequestDetailsJson, 
  IdentityUpdateRequestDetails, 
  IdentityUpdateRequestDetailsJson, 
  IdentityUpdateResponseDetails, 
  IdentityUpdateResponseDetailsJson, 
  LoginRequestDetails, 
  LoginRequestDetailsJson, 
  ProvisionIdentityDetails, 
  ProvisionIdentityDetailsJson, 
  VerusPayInvoiceDetails 
} from "../../vdxf/classes";
import { VerusPayInvoiceDetailsJson } from "../../vdxf/classes/payment/VerusPayInvoiceDetails";

export type OrdinalVdxfObjectReservedData = 
  DataDescriptor | 
  VerusPayInvoiceDetails | 
  IdentityUpdateRequestDetails | 
  IdentityUpdateResponseDetails | 
  LoginRequestDetails | 
  ProvisionIdentityDetails |
  AppEncryptionRequestDetails;

export type OrdinalVdxfObjectReservedDataJson = 
  DataDescriptorJson | 
  VerusPayInvoiceDetailsJson | 
  IdentityUpdateRequestDetailsJson | 
  IdentityUpdateResponseDetailsJson | 
  LoginRequestDetailsJson | 
  ProvisionIdentityDetailsJson |
  AppEncryptionRequestDetailsJson;

