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
  VerusPayInvoiceDetails,
  AppEncryptionResponseDetails,
  AppEncryptionResponseDetailsJson 
} from "../../vdxf/classes";
import { VerusPayInvoiceDetailsJson } from "../../vdxf/classes/payment/VerusPayInvoiceDetails";
import { DataPacketResponse, DataResponseJson } from "../../vdxf/classes/datapacket/DataPacketResponse";

export type OrdinalVdxfObjectReservedData = 
  DataDescriptor | 
  VerusPayInvoiceDetails | 
  IdentityUpdateRequestDetails | 
  IdentityUpdateResponseDetails | 
  LoginRequestDetails | 
  LoginResponseDetails |
  ProvisionIdentityDetails |
  AppEncryptionRequestDetails |
  DataPacketResponse |
  UserDataRequestDetails |
  UserSpecificDataPacketDetails |
  AppEncryptionResponseDetails;

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
  UserSpecificDataPacketDetailsJson |
  AppEncryptionResponseDetailsJson;

