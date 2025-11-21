import { APP_ENCRYPTION_REQUEST_VDXF_KEY, DATA_RESPONSE_VDXF_KEY, DATA_TYPE_OBJECT_DATADESCRIPTOR, IDENTITY_UPDATE_REQUEST_DETAILS_VDXF_KEY, IDENTITY_UPDATE_RESPONSE_DETAILS_VDXF_KEY, LOGIN_REQUEST_DETAILS_VDXF_KEY, LOGIN_RESPONSE_DETAILS_VDXF_KEY, PROVISION_IDENTITY_DETAILS_VDXF_KEY, USER_DATA_REQUEST_VDXF_KEY, USER_SPECIFIC_DATA_PACKET_VDXF_KEY, VERUSPAY_INVOICE_DETAILS_VDXF_KEY } from "../../vdxf";
import { AppEncryptionRequestOrdinalVdxfObject } from "../../vdxf/classes/ordinals/AppEncryptionRequestOrdinalVdxfObject";
import { DataDescriptorOrdinalVdxfObject } from "../../vdxf/classes/ordinals/DataDescriptorOrdinalVdxfObject";
import { DataPacketResponseOrdinalVdxfObject } from "../../vdxf/classes/ordinals/DataPacketResponseOrdinalVdxfObject";
import { UserDataRequestOrdinalVdxfObject } from "../../vdxf/classes/ordinals/UserDataRequestOrdinalVdxfObject";
import { UserSpecificDataPacketDetailsOrdinalVdxfObject } from "../../vdxf/classes/ordinals/UserSpecificDataPacketDetailsOrdinalVdxfObject";
import { IdentityUpdateRequestOrdinalVdxfObject } from "../../vdxf/classes/ordinals/IdentityUpdateRequestOrdinalVdxfObject";
import { IdentityUpdateResponseOrdinalVdxfObject } from "../../vdxf/classes/ordinals/IdentityUpdateResponseOrdinalVdxfObject";
import { LoginRequestOrdinalVdxfObject } from "../../vdxf/classes/ordinals/LoginRequestDetailsOrdinalVdxfObject";
import { LoginResponseOrdinalVdxfObject } from "../../vdxf/classes/ordinals/LoginResponseDetailsOrdinalVdxfObject";
import { OrdinalVdxfObjectOrdinalMap } from "../../vdxf/classes/ordinals/OrdinalVdxfObjectOrdinalMap";
import { ProvisionIdentityDetailsOrdinalVdxfObject } from "../../vdxf/classes/ordinals/ProvisionIdentityDetailsOrdinalVdxfObject";
import { VerusPayInvoiceOrdinalVdxfObject } from "../../vdxf/classes/ordinals/VerusPayInvoiceOrdinalVdxfObject";
import { VDXF_ORDINAL_APP_ENCRYPTION_REQUEST, VDXF_ORDINAL_DATA_DESCRIPTOR, VDXF_ORDINAL_DATA_RESPONSE, VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST, VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE, VDXF_ORDINAL_LOGIN_REQUEST, VDXF_ORDINAL_LOGIN_RESPONSE, VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS, VDXF_ORDINAL_USER_DATA_REQUEST, VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET, VDXF_ORDINAL_VERUSPAY_INVOICE } from "./ordinals";

export const registerOrdinals = () => {
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_DATA_DESCRIPTOR.toNumber(), DATA_TYPE_OBJECT_DATADESCRIPTOR.vdxfid, DataDescriptorOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_VERUSPAY_INVOICE.toNumber(), VERUSPAY_INVOICE_DETAILS_VDXF_KEY.vdxfid, VerusPayInvoiceOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_LOGIN_REQUEST.toNumber(), LOGIN_REQUEST_DETAILS_VDXF_KEY.vdxfid, LoginRequestOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_LOGIN_RESPONSE.toNumber(), LOGIN_RESPONSE_DETAILS_VDXF_KEY.vdxfid, LoginResponseOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST.toNumber(), IDENTITY_UPDATE_REQUEST_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateRequestOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE.toNumber(), IDENTITY_UPDATE_RESPONSE_DETAILS_VDXF_KEY.vdxfid, IdentityUpdateResponseOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS.toNumber(), PROVISION_IDENTITY_DETAILS_VDXF_KEY.vdxfid, ProvisionIdentityDetailsOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_APP_ENCRYPTION_REQUEST.toNumber(), APP_ENCRYPTION_REQUEST_VDXF_KEY.vdxfid, AppEncryptionRequestOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_DATA_RESPONSE.toNumber(), DATA_RESPONSE_VDXF_KEY.vdxfid, DataPacketResponseOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_USER_DATA_REQUEST.toNumber(), USER_DATA_REQUEST_VDXF_KEY.vdxfid, UserDataRequestOrdinalVdxfObject, false);
  OrdinalVdxfObjectOrdinalMap.registerOrdinal(VDXF_ORDINAL_USER_SPECIFIC_DATA_PACKET.toNumber(), USER_SPECIFIC_DATA_PACKET_VDXF_KEY.vdxfid, UserSpecificDataPacketDetailsOrdinalVdxfObject, false);
}