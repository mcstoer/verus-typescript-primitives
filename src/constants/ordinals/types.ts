import { DataDescriptor, DataDescriptorJson } from "../../pbaas";
import { 
  AppEncryptionRequestDetails, 
  AppEncryptionRequestJson, 
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
  UserDataRequestJson,
  UserSpecificDataPacketDetails,
  UserSpecificDataPacketDetailsJson,
  VerusPayInvoiceDetails 
} from "../../vdxf/classes";
import { VerusPayInvoiceDetailsJson } from "../../vdxf/classes/payment/VerusPayInvoiceDetails";
import { DataResponse, DataResponseJson } from "../../vdxf/classes/response/DataResponse";

export type OrdinalVdxfObjectReservedData = 
  DataDescriptor | 
  VerusPayInvoiceDetails | 
  IdentityUpdateRequestDetails | 
  IdentityUpdateResponseDetails | 
  LoginRequestDetails | 
  LoginResponseDetails |
  ProvisionIdentityDetails |
  AppEncryptionRequestDetails |
  DataResponse |
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
  AppEncryptionRequestJson |
  DataResponseJson |
  UserDataRequestJson |
  UserSpecificDataPacketDetailsJson;

