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
  LoginResponseDetails, 
  LoginResponseDetailsJson, 
  ProvisionIdentityDetails, 
  ProvisionIdentityDetailsJson, 
  UserDataRequestDetails,
  UserDataRequestDetailsJson,
  UserSpecificDataPacketDetails,
  UserSpecificDataPacketDetailsJson,
  VerusPayInvoiceDetails 
} from "../../vdxf/classes";
import { VerusPayInvoiceDetailsJson } from "../../vdxf/classes/payment/VerusPayInvoiceDetails";
import { DataDescriptorResponse, DataDescriptorResponseJson } from "../../vdxf/classes/response/DataDescriptorResponse";

export type OrdinalVdxfObjectReservedData = 
  DataDescriptor | 
  VerusPayInvoiceDetails | 
  IdentityUpdateRequestDetails | 
  IdentityUpdateResponseDetails | 
  LoginRequestDetails | 
  LoginResponseDetails |
  ProvisionIdentityDetails |
  AppEncryptionRequestDetails |
  DataDescriptorResponse |
  UserDataRequestDetails |
  UserSpecificDataPacketDetails;

export type OrdinalVdxfObjectReservedDataJson = 
  DataDescriptorJson | 
  VerusPayInvoiceDetailsJson | 
  IdentityUpdateRequestDetailsJson | 
  IdentityUpdateResponseDetailsJson | 
  LoginRequestDetailsJson | 
  LoginResponseDetailsJson |
  ProvisionIdentityDetailsJson |
  AppEncryptionRequestDetailsJson |
  DataDescriptorResponseJson |
  UserDataRequestDetailsJson |
  UserSpecificDataPacketDetailsJson;

