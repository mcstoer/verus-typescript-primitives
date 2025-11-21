import { BN } from 'bn.js';
import {
  AppEncryptionRequestOrdinalVdxfObject,
  GeneralTypeOrdinalVdxfObject,
  getOrdinalVdxfObjectClassForType,
  IdentityUpdateRequestOrdinalVdxfObject,
  IdentityUpdateResponseOrdinalVdxfObject,
  LoginRequestOrdinalVdxfObject,
  LoginResponseOrdinalVdxfObject,
  OrdinalVdxfObject,
  UserDataRequestOrdinalVdxfObject,
  UserSpecificDataPacketDetailsOrdinalVdxfObject,
  DataResponseOrdinalVdxfObject
} from '../../vdxf/classes/ordinals';
import {
  DataDescriptorOrdinalVdxfObject
} from '../../vdxf/classes/ordinals/DataDescriptorOrdinalVdxfObject';
import { DataDescriptor, DEST_PKH, TransferDestination } from '../../pbaas';
import { 
  AppEncryptionRequest, 
  CompactIdAddressObject, 
  IdentityUpdateRequestDetails, 
  IdentityUpdateResponseDetails, 
  LoginRequestDetails, 
  LoginResponseDetails, 
  ProvisionIdentityDetails, 
  ResponseUri, 
  VerusPayInvoiceDetails,
  UserDataRequest,
  UserSpecificDataPacketDetails
} from '../../vdxf/classes';
import { DEFAULT_VERUS_CHAINID } from '../../constants/pbaas';
import { fromBase58Check } from '../../utils/address';
import { VDXF_OBJECT_RESERVED_BYTE_I_ADDR, VDXF_ORDINAL_APP_ENCRYPTION_REQUEST_DETAILS, VDXF_ORDINAL_DATA_DESCRIPTOR, VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST, VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE, VDXF_ORDINAL_LOGIN_REQUEST, VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS, VDXF_ORDINAL_VERUSPAY_INVOICE } from '../../constants/ordinals/ordinals';
import { VerusPayInvoiceOrdinalVdxfObject } from '../../vdxf/classes/ordinals/VerusPayInvoiceOrdinalVdxfObject';
import { TEST_CHALLENGE_ID, TEST_CLI_ID_UPDATE_REQUEST_JSON_HEX, TEST_CREATEDAT, TEST_EXPIRYHEIGHT, TEST_IDENTITY_ID_1, TEST_IDENTITY_ID_2, TEST_IDENTITY_ID_3, TEST_REQUESTID, TEST_SALT, TEST_SYSTEMID, TEST_TXID } from '../constants/fixtures';
import { ProvisionIdentityDetailsOrdinalVdxfObject } from '../../vdxf/classes/ordinals/ProvisionIdentityDetailsOrdinalVdxfObject';
import { BigNumber } from '../../utils/types/BigNumber';
import { DataResponse } from '../../vdxf/classes/response/DataResponse';
import { VerifiableSignatureData } from '../../vdxf/classes/VerifiableSignatureData';

// Helper function to create TransferDestination from address string
function createCompactIdAddressObject(type: BigNumber, address: string): CompactIdAddressObject {
  const obj = new CompactIdAddressObject();
  obj.type = type;
  obj.address = address;
  return obj;
}

describe('OrdinalVdxfObject and subclasses round-trip serialization', () => {
  function roundTripBuffer<T extends OrdinalVdxfObject>(obj: T): T {
    const buf = obj.toBuffer();
    // Use the factory createFromBuffer so the correct subclass is used
    const { obj: parsed } = OrdinalVdxfObject.createFromBuffer(buf);

    // Type assertion
    const parsedTyped = parsed as T;

    expect(parsedTyped.toBuffer().toString('hex')).toBe(buf.toString('hex'));

    return parsedTyped;
  }

  function roundTripJson<T extends OrdinalVdxfObject>(obj: T): T {
    const json = obj.toJson();
    // Depending on subclass, call static fromJson
    let newObj: OrdinalVdxfObject;
    if (obj instanceof DataDescriptorOrdinalVdxfObject) {
      newObj = DataDescriptorOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof VerusPayInvoiceOrdinalVdxfObject) {
      newObj = VerusPayInvoiceOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof GeneralTypeOrdinalVdxfObject) {
      newObj = GeneralTypeOrdinalVdxfObject.fromJson(json);
    } else if (obj instanceof IdentityUpdateRequestOrdinalVdxfObject) {
      newObj = IdentityUpdateRequestOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof IdentityUpdateResponseOrdinalVdxfObject) {
      newObj = IdentityUpdateResponseOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof LoginRequestOrdinalVdxfObject) {
      newObj = LoginRequestOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof LoginResponseOrdinalVdxfObject) {
      newObj = LoginResponseOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof ProvisionIdentityDetailsOrdinalVdxfObject) {
      newObj = ProvisionIdentityDetailsOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof AppEncryptionRequestOrdinalVdxfObject) {
      newObj = AppEncryptionRequestOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof DataResponseOrdinalVdxfObject) {
      newObj = DataResponseOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof UserDataRequestOrdinalVdxfObject) {
      newObj = UserDataRequestOrdinalVdxfObject.fromJson(json as any);
    } else if (obj instanceof UserSpecificDataPacketDetailsOrdinalVdxfObject) {
      newObj = UserSpecificDataPacketDetailsOrdinalVdxfObject.fromJson(json as any);
    } else {
      throw new Error("Unrecognized type")
    }

    return newObj as T;
  }

  it('should serialize / deserialize a GeneralTypeOrdinalVdxfObject (opaque buffer) via buffer', () => {
    const sample = Buffer.from('deadbeef', 'hex');
    const obj = new GeneralTypeOrdinalVdxfObject({ data: sample, key: DEFAULT_VERUS_CHAINID });

    // check some properties
    expect(obj.isDefinedByVdxfKey()).toBe(true);
    expect(obj.data).toEqual(sample);
    expect(obj.key).toEqual(DEFAULT_VERUS_CHAINID);

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(GeneralTypeOrdinalVdxfObject);
    expect((round as GeneralTypeOrdinalVdxfObject).data).toEqual(sample);
    expect(((round as GeneralTypeOrdinalVdxfObject).key)).toEqual(DEFAULT_VERUS_CHAINID);

    // Their JSON should match hex
    const j = obj.toJson();
    expect(j.data).toEqual(sample.toString('hex'));
    const roundJ = roundTripJson<GeneralTypeOrdinalVdxfObject>(obj);
    expect(roundJ).toBeInstanceOf(GeneralTypeOrdinalVdxfObject);
    expect((roundJ as GeneralTypeOrdinalVdxfObject).data).toEqual(sample);
    expect(((roundJ as GeneralTypeOrdinalVdxfObject).key)).toEqual(DEFAULT_VERUS_CHAINID);
  });

  it('should serialize / deserialize a DataDescriptorOrdinalVdxfObject via buffer', () => {
    // Create a DataDescriptor with some fields
    const dd = DataDescriptor.fromJson({
      version: 1,
      "flags": 2,
      "objectdata": {
        "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
          "version": 1,
          "flags": 96,
          "mimetype": "text/plain",
          "objectdata": {
            "message": "Something 1"
          },
          "label": "label 1"
        }
      },
      "salt": "4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2"
    });
    
    // Force flags, etc.
    dd.SetFlags();

    const obj = new DataDescriptorOrdinalVdxfObject({ data: dd });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(DataDescriptorOrdinalVdxfObject);
    const dd2 = (round as DataDescriptorOrdinalVdxfObject).data;
    expect(dd2.version.toString()).toEqual(dd.version.toString());
    expect(dd2.flags.toString()).toEqual(dd.flags.toString());
    expect(dd2.objectdata).toEqual(dd.objectdata);
    expect(dd2.label).toEqual(dd.label);
    expect(dd2.mimeType).toEqual(dd.mimeType);

    // Now JSON round trip
    const json = obj.toJson();

    // The JSON data field should be the DataDescriptor JSON
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(DataDescriptorOrdinalVdxfObject);
    const dd3 = (roundJ as DataDescriptorOrdinalVdxfObject).data;
    expect(dd3.version.toString()).toBe(dd.version.toString());
    expect(dd3.flags.toString()).toBe(dd.flags.toString());
    expect(dd3.objectdata).toEqual(dd.objectdata);
    expect(dd3.label).toBe(dd.label);
    expect(dd3.mimeType).toBe(dd.mimeType);
  });

  it('should serialize / deserialize a VerusPayInvoiceOrdinalVdxfObject via buffer', () => {
    // Create a VerusPayInvoiceDetails with some fields
    const details = new VerusPayInvoiceDetails({
      amount: new BN(10000000000, 10),
      destination: new TransferDestination({
        type: DEST_PKH,
        destination_bytes: fromBase58Check("R9J8E2no2HVjQmzX6Ntes2ShSGcn7WiRcx").hash
      }),
      requestedcurrencyid: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"
    })

    details.amount = new BN(12345);
    details.requestedcurrencyid = DEFAULT_VERUS_CHAINID;

    const obj = new VerusPayInvoiceOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(VerusPayInvoiceOrdinalVdxfObject);
    const d2 = (round as VerusPayInvoiceOrdinalVdxfObject).data;
    expect(d2.requestedcurrencyid).toEqual(details.requestedcurrencyid);
    expect(d2.amount.toString()).toEqual(details.amount.toString());

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(VerusPayInvoiceOrdinalVdxfObject);
    const d3 = (roundJ as VerusPayInvoiceOrdinalVdxfObject).data;
    expect(d3.requestedcurrencyid).toEqual(details.requestedcurrencyid);
    expect(d3.amount.toString()).toEqual(details.amount.toString());
  });

  it('should serialize / deserialize a IdentityUpdateRequestOrdinalVdxfObject via buffer', () => {
    const details = IdentityUpdateRequestDetails.fromCLIJson(
      TEST_CLI_ID_UPDATE_REQUEST_JSON_HEX,
      {
        systemid: TEST_SYSTEMID.toAddress() as string,
        requestid: TEST_REQUESTID.toString(),
        createdat: TEST_CREATEDAT.toString(),
        expiryheight: TEST_EXPIRYHEIGHT.toString(),
        responseuris: [
          ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_REDIRECT).toJson(),
          ResponseUri.fromUriString("http:/127.0.0.1:8000", ResponseUri.TYPE_POST).toJson()
        ],
        txid: TEST_TXID
      }
    );

    const obj = new IdentityUpdateRequestOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(IdentityUpdateRequestOrdinalVdxfObject);

    const d2 = (round as IdentityUpdateRequestOrdinalVdxfObject).data;
    expect(d2.systemID!.toAddress()).toEqual(details.systemID!.toAddress());
    expect(d2.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d2.createdAt!.toNumber()).toEqual(details.createdAt!.toNumber());
    expect(d2.expiryHeight!.toString()).toEqual(details.expiryHeight!.toString());
    expect(d2.txid!.toString('hex')).toEqual(details.txid!.toString('hex'));

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(IdentityUpdateRequestOrdinalVdxfObject);

    const d3 = (roundJ as IdentityUpdateRequestOrdinalVdxfObject).data;
    expect(d3.systemID!.toAddress()).toEqual(details.systemID!.toAddress());
    expect(d3.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d3.createdAt!.toNumber()).toEqual(details.createdAt!.toNumber());
    expect(d3.expiryHeight!.toString()).toEqual(details.expiryHeight!.toString());
    expect(d3.txid!.toString('hex')).toEqual(details.txid!.toString('hex'));
  });

  it('should serialize / deserialize a IdentityUpdateResponseOrdinalVdxfObject via buffer', () => {
    const details = new IdentityUpdateResponseDetails({
      requestID: TEST_REQUESTID,
      createdAt: TEST_CREATEDAT,
      txid: Buffer.from(TEST_TXID, 'hex').reverse()
    });

    const obj = new IdentityUpdateResponseOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(IdentityUpdateResponseOrdinalVdxfObject);

    const d2 = (round as IdentityUpdateResponseOrdinalVdxfObject).data;
    expect(d2.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d2.createdAt!.toNumber()).toEqual(details.createdAt!.toNumber());
    expect(d2.txid!.toString('hex')).toEqual(details.txid!.toString('hex'));

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(IdentityUpdateResponseOrdinalVdxfObject);

    const d3 = (roundJ as IdentityUpdateResponseOrdinalVdxfObject).data;
    expect(d3.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d3.createdAt!.toNumber()).toEqual(details.createdAt!.toNumber());
    expect(d3.txid!.toString('hex')).toEqual(details.txid!.toString('hex'));
  });

  it('should serialize / deserialize a LoginRequestOrdinalVdxfObject via buffer', () => {
    const details = new LoginRequestDetails({
      requestID: TEST_CHALLENGE_ID,
      recipientConstraints: [
        { type: LoginRequestDetails.REQUIRED_ID, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_1, rootSystemName: "VRSC" }) },
        { type: LoginRequestDetails.REQUIRED_SYSTEM, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_2, rootSystemName: "VRSC" }) },
        { type: LoginRequestDetails.REQUIRED_PARENT, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_3, rootSystemName: "VRSC" }) }
      ],
      callbackURIs: [{
        type: LoginRequestDetails.TYPE_WEBHOOK,
        uri: "https://example.com/callback"
      }],
      expiryTime: new BN(2938475938457)
    });

    const obj = new LoginRequestOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(LoginRequestOrdinalVdxfObject);

    const d2 = (round as LoginRequestOrdinalVdxfObject).data;
    expect(d2.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d2.expiryTime!.toNumber()).toEqual(details.expiryTime!.toNumber());

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(LoginRequestOrdinalVdxfObject);

    const d3 = (roundJ as LoginRequestOrdinalVdxfObject).data;
    expect(d3.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d3.expiryTime!.toNumber()).toEqual(details.expiryTime!.toNumber());
  });

  it('should serialize / deserialize a LoginResponseOrdinalVdxfObject via buffer', () => {
    const details = new LoginResponseDetails({
      requestID: TEST_CHALLENGE_ID,
      createdAt: new BN(2938475938457)
    });

    const obj = new LoginResponseOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(LoginResponseOrdinalVdxfObject);

    const d2 = (round as LoginResponseOrdinalVdxfObject).data;
    expect(d2.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d2.createdAt!.toNumber()).toEqual(details.createdAt!.toNumber());

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(LoginResponseOrdinalVdxfObject);

    const d3 = (roundJ as LoginResponseOrdinalVdxfObject).data;
    expect(d3.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d3.createdAt!.toNumber()).toEqual(details.createdAt!.toNumber());
  });

  it('should serialize / deserialize a ProvisionIdentityDetailsOrdinalVdxfObject', () => {
    const details = new ProvisionIdentityDetails({
      version: new BN(1, 10),
      flags: ProvisionIdentityDetails.FLAG_HAS_SYSTEMID.or(ProvisionIdentityDetails.FLAG_HAS_PARENTID),
      systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_1, rootSystemName: "VRSC" }),
      parentID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_2, rootSystemName: "VRSC" })
    })

    const obj = new ProvisionIdentityDetailsOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(ProvisionIdentityDetailsOrdinalVdxfObject);

    const d2 = (round as ProvisionIdentityDetailsOrdinalVdxfObject).data;
    expect(d2.systemID!.toIAddress()).toEqual(details.systemID!.toIAddress());
    expect(d2.parentID!.toIAddress()).toEqual(details.parentID!.toIAddress());

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(ProvisionIdentityDetailsOrdinalVdxfObject);

    const d3 = (roundJ as ProvisionIdentityDetailsOrdinalVdxfObject).data;
    expect(d3.systemID!.toIAddress()).toEqual(details.systemID!.toIAddress());
    expect(d3.parentID!.toIAddress()).toEqual(details.parentID!.toIAddress());
  });

  it('should serialize / deserialize an AppEncryptionRequestOrdinalVdxfObject', () => {
    const details = new AppEncryptionRequest({
      version: AppEncryptionRequest.DEFAULT_VERSION,
      flags: AppEncryptionRequest.HAS_SECONDARY_SEED_DERIVATION_NUMBER
        .or(AppEncryptionRequest.HAS_FROM_ADDRESS)
        .or(AppEncryptionRequest.HAS_TO_ADDRESS),
      encryptToZAddress: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(42),
      secondaryDerivationNumber: new BN(234),
      fromAddress: createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW"),
      toAddress: createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X"),
      requestID: "iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ"
    });

    const obj = new AppEncryptionRequestOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(AppEncryptionRequestOrdinalVdxfObject);

    const d2 = (round as AppEncryptionRequestOrdinalVdxfObject).data;
    expect(d2.encryptToZAddress!).toEqual(details.encryptToZAddress);
    expect(d2.derivationNumber!.toString()).toEqual(details.derivationNumber!.toString());
    expect(d2.secondaryDerivationNumber!.toString()).toEqual(details.secondaryDerivationNumber!.toString());
    expect(d2.fromAddress!.toIAddress()).toEqual(details.fromAddress!.toIAddress());
    expect(d2.toAddress!.toIAddress()).toEqual(details.toAddress!.toIAddress());
    expect(d2.requestID).toEqual(details.requestID);

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(AppEncryptionRequestOrdinalVdxfObject);

    const d3 = (roundJ as AppEncryptionRequestOrdinalVdxfObject).data;
    expect(d3.encryptToZAddress!).toEqual(details.encryptToZAddress);
    expect(d3.derivationNumber!.toString()).toEqual(details.derivationNumber!.toString());
    expect(d3.secondaryDerivationNumber!.toString()).toEqual(details.secondaryDerivationNumber!.toString());
    expect(d3.fromAddress!.toIAddress()).toEqual(details.fromAddress!.toIAddress());
    expect(d3.toAddress!.toIAddress()).toEqual(details.toAddress!.toIAddress());
    expect(d3.requestID).toEqual(details.requestID);
  });

  it('getOrdinalVdxfObjectClassForType should map to correct classes', () => {
    expect(getOrdinalVdxfObjectClassForType(VDXF_ORDINAL_DATA_DESCRIPTOR))
      .toBe(DataDescriptorOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(VDXF_ORDINAL_VERUSPAY_INVOICE))
      .toBe(VerusPayInvoiceOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(VDXF_ORDINAL_IDENTITY_UPDATE_REQUEST))
      .toBe(IdentityUpdateRequestOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(VDXF_ORDINAL_IDENTITY_UPDATE_RESPONSE))
      .toBe(IdentityUpdateResponseOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(VDXF_OBJECT_RESERVED_BYTE_I_ADDR))
      .toBe(GeneralTypeOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(VDXF_ORDINAL_LOGIN_REQUEST))
      .toBe(LoginRequestOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(VDXF_ORDINAL_PROVISION_IDENTITY_DETAILS))
      .toBe(ProvisionIdentityDetailsOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(VDXF_ORDINAL_APP_ENCRYPTION_REQUEST_DETAILS))
      .toBe(AppEncryptionRequestOrdinalVdxfObject);

    // unrecognized
    expect(() => getOrdinalVdxfObjectClassForType(new BN(999))).toThrow();
  });

  it('base OrdinalVdxfObject buffer round trip (no key path)', () => {
    // This tests the fallback when no key is provided
    const base = new OrdinalVdxfObject({ type: VDXF_ORDINAL_DATA_DESCRIPTOR });
    const buf = base.toBuffer();
    const parsed = new OrdinalVdxfObject();
    parsed.fromBuffer(buf);

    expect(parsed.type.toString()).toBe(base.type.toString());
    expect(parsed.version.toString()).toBe(base.version.toString());

    // data is undefined or empty
    expect(parsed.data).toBeUndefined();
  });

    it('should serialize / deserialize a DataResponse via buffer', () => {
    const details = new DataResponse({
      flags: new BN(0),
      requestID: TEST_CHALLENGE_ID,
      data: new DataDescriptor({
        version: new BN(1, 10),
        "flags": new BN(2, 10),
        "objectdata": Buffer.from("deadbeef", "hex"),
        "salt": Buffer.from("4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2", "hex")
      })
    });

    const obj = new DataResponseOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(DataResponseOrdinalVdxfObject);

    const d2 = (round as DataResponseOrdinalVdxfObject).data;
    expect(d2.requestID!.toString()).toEqual(details.requestID!.toString());

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(DataResponseOrdinalVdxfObject);

    const d3 = (roundJ as DataResponseOrdinalVdxfObject).data;
    expect(d3.requestID!.toString()).toEqual(details.requestID!.toString());
  });

  it('should serialize / deserialize a UserDataRequestOrdinalVdxfObject via buffer', () => {
    const details = new UserDataRequest({
      version: new BN(1),
      flags: UserDataRequest.FULL_DATA.or(UserDataRequest.ATTESTATION).or(UserDataRequest.HAS_SIGNER),
      searchDataKey: [{ "iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Attestation Name" }],
      signer: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq", rootSystemName: "VRSC" }),
      requestID: "iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ"
    });

    const obj = new UserDataRequestOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(UserDataRequestOrdinalVdxfObject);

    const d2 = (round as UserDataRequestOrdinalVdxfObject).data;
    expect(d2.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d2.searchDataKey).toEqual(details.searchDataKey);
    expect(d2.signer!.toIAddress()).toEqual(details.signer!.toIAddress());

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(UserDataRequestOrdinalVdxfObject);

    const d3 = (roundJ as UserDataRequestOrdinalVdxfObject).data;
    expect(d3.requestID!.toString()).toEqual(details.requestID!.toString());
    expect(d3.searchDataKey).toEqual(details.searchDataKey);
    expect(d3.signer!.toIAddress()).toEqual(details.signer!.toIAddress());
  });

  it('should serialize / deserialize a UserSpecificDataPacketDetailsOrdinalVdxfObject via buffer', () => {
    const details = new UserSpecificDataPacketDetails({
      version: new BN(1),
      flags: UserSpecificDataPacketDetails.HAS_STATEMENTS.or(UserSpecificDataPacketDetails.HAS_SIGNATURE),
      signableObjects: [DataDescriptor.fromJson({ version: new BN(1), label: "123", objectdata: "0011223344aabbcc", flags: DataDescriptor.FLAG_LABEL_PRESENT })],
      statements: ["Statement 1", "Statement 2"],
      signature: new VerifiableSignatureData({
        version: new BN(1),
        signatureAsVch: Buffer.from("efc8d6b60c5b6efaeb3fce4b2c0749c317f2167549ec22b1bee411b8802d5aaf", 'hex'),
        hashType: new BN(1),
        flags: new BN(0),
        identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW", rootSystemName: "VRSC" }),
        systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSC", rootSystemName: "VRSC" }),
      }),
      detailsID: "iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ"
    });

    const obj = new UserSpecificDataPacketDetailsOrdinalVdxfObject({ data: details });

    const round = roundTripBuffer(obj);
    expect(round).toBeInstanceOf(UserSpecificDataPacketDetailsOrdinalVdxfObject);

    const d2 = (round as UserSpecificDataPacketDetailsOrdinalVdxfObject).data;
    expect(d2.detailsID!.toString()).toEqual(details.detailsID!.toString());
    expect(d2.signableObjects.length).toBe(1);
    expect(d2.statements?.length).toBe(2);
    expect(d2.signature?.signatureAsVch.toString('hex')).toBe("efc8d6b60c5b6efaeb3fce4b2c0749c317f2167549ec22b1bee411b8802d5aaf");

    const json = obj.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(obj);
    expect(roundJ).toBeInstanceOf(UserSpecificDataPacketDetailsOrdinalVdxfObject);

    const d3 = (roundJ as UserSpecificDataPacketDetailsOrdinalVdxfObject).data;
    expect(d3.detailsID!.toString()).toEqual(details.detailsID!.toString());
    expect(d3.signableObjects.length).toBe(1);
    expect(d3.statements?.length).toBe(2);
    expect(d3.signature?.signatureAsVch.toString('hex')).toBe("efc8d6b60c5b6efaeb3fce4b2c0749c317f2167549ec22b1bee411b8802d5aaf");
  });

});