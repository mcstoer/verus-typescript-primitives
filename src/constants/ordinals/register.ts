import { APP_ENCRYPTION_REQUEST_VDXF_KEY, APP_ENCRYPTION_RESPONSE_VDXF_KEY, DATA_RESPONSE_VDXF_KEY, DATA_TYPE_OBJECT_DATADESCRIPTOR, IDENTITY_UPDATE_REQUEST_DETAILS_VDXF_KEY, IDENTITY_UPDATE_RESPONSE_DETAILS_VDXF_KEY, AUTHENTICATION_REQUEST_DETAILS_VDXF_KEY, AUTHENTICATION_RESPONSE_DETAILS_VDXF_KEY, PROVISION_IDENTITY_DETAILS_VDXF_KEY, USER_DATA_REQUEST_VDXF_KEY, USER_SPECIFIC_DATA_PACKET_VDXF_KEY, VERUSPAY_INVOICE_DETAILS_VDXF_KEY } from "../../vdxf";
import { AppEncryptionRequestOrdinalVDXFObject } from "../../vdxf/classes/ordinals/AppEncryptionRequestOrdinalVDXFObject";
import { DataDescriptorOrdinalVDXFObject } from "../../vdxf/classes/ordinals/DataDescriptorOrdinalVDXFObject";
import { DataPacketResponseOrdinalVDXFObject } from "../../vdxf/classes/ordinals/DataPacketResponseOrdinalVDXFObject";
import { UserDataRequestOrdinalVDXFObject } from "../../vdxf/classes/ordinals/UserDataRequestOrdinalVDXFObject";
import { UserSpecificDataPacketDetailsOrdinalVDXFObject } from "../../vdxf/classes/ordinals/UserSpecificDataPacketDetailsOrdinalVDXFObject";
import { IdentityUpdateRequestOrdinalVDXFObject } from "../../vdxf/classes/ordinals/IdentityUpdateRequestOrdinalVDXFObject";
import { IdentityUpdateResponseOrdinalVDXFObject } from "../../vdxf/classes/ordinals/IdentityUpdateResponseOrdinalVDXFObject";
import { AuthenticationRequestOrdinalVDXFObject } from "../../vdxf/classes/ordinals/AuthenticationRequestOrdinalVDXFObject";
import { AuthenticationResponseOrdinalVDXFObject } from "../../vdxf/classes/ordinals/AuthenticationResponseOrdinalVDXFObject";
import { OrdinalVDXFObjectOrdinalMap } from "../../vdxf/classes/ordinals/OrdinalVDXFObjectOrdinalMap";
import { ProvisionIdentityDetailsOrdinalVDXFObject } from "../../vdxf/classes/ordinals/ProvisionIdentityDetailsOrdinalVDXFObject";
import { VerusPayInvoiceOrdinalVDXFObject } from "../../vdxf/classes/ordinals/VerusPayInvoiceOrdinalVDXFObject";
import { VDXF_ORDINAL_APP_ENCRYPTION_REQUEST, VDXF_ORDINAL_APP_ENCRYPTION_RESPONSE, VDXF_ORDINAL_DATA_DESCRIPTOR, VDXF_ORDINAL_DATA_RESPONSE, VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST, VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE, VDXF_ORDINAL_AUTHENTICATION_REQUEST, VDXF_ORDINAL_AUTHENTICATION_RESPONSE, VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS, VDXF_ORDINAL_USER_DATA_REQUEST, VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET, VDXF_ORDINAL_VERUSPAY_INVOICE } from "./ordinals";
import { AppEncryptionResponseOrdinalVDXFObject } from "../../vdxf/classes/ordinals/AppEncryptionResponseOrdinalVDXFObject";

export const registerOrdinals = () => {
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_DATA_DESCRIPTOR.toNumber(), DATA_TYPE_OBJECT_DATADESCRIPTOR.vdxfid, DataDescriptorOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_VERUSPAY_INVOICE.toNumber(), VERUSPAY_INVOICE_DETAILS_VDXF_KEY.vdxfid, VerusPayInvoiceOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_AUTHENTICATION_REQUEST.toNumber(), AUTHENTICATION_REQUEST_DETAILS_VDXF_KEY.vdxfid, AuthenticationRequestOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_AUTHENTICATION_RESPONSE.toNumber(), AUTHENTICATION_RESPONSE_DETAILS_VDXF_KEY.vdxfid, AuthenticationResponseOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST.toNumber(), IDENTITY_UPDATE_REQUEST_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateRequestOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE.toNumber(), IDENTITY_UPDATE_RESPONSE_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateResponseOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS.toNumber(), PROVISION_IDENTITY_DETAILS_VDXF_KEY.vdxfid, ProvisionIdentityDetailsOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_APP_ENCRYPTION_REQUEST.toNumber(), APP_ENCRYPTION_REQUEST_VDXF_KEY.vdxfid, AppEncryptionRequestOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_DATA_RESPONSE.toNumber(), DATA_RESPONSE_VDXF_KEY.vdxfid, DataPacketResponseOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_USER_DATA_REQUEST.toNumber(), USER_DATA_REQUEST_VDXF_KEY.vdxfid, UserDataRequestOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET.toNumber(), USER_SPECIFIC_DATA_PACKET_VDXF_KEY.vdxfid, UserSpecificDataPacketDetailsOrdinalVDXFObject, false);
  OrdinalVDXFObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_APP_ENCRYPTION_RESPONSE.toNumber(), APP_ENCRYPTION_RESPONSE_VDXF_KEY.vdxfid, AppEncryptionResponseOrdinalVDXFObject, false);
}