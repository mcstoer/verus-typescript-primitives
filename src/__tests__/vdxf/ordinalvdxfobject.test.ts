import { BN } from 'bn.js';
import {
  OrdinalVdxfObject,
  DataDescriptorOrdinalVdxfObject,
  VerusPayInvoiceOrdinalVdxfObject,
  GeneralTypeOrdinalVdxfObject,
  getOrdinalVdxfObjectClassForType,
  LoginRequestDetailsOrdinalVdxfObject
} from '../../vdxf/classes/OrdinalVdxfObject';

import { DataDescriptor, DEST_PKH, TransferDestination } from '../../pbaas';
import { CompactIdAddressObject, LoginRequestDetails, VerusPayInvoiceDetails } from '../../vdxf/classes';
import { DEFAULT_VERUS_CHAINID } from '../../constants/pbaas';
import { fromBase58Check } from '../../utils/address';

describe('OrdinalVdxfObject and subclasses round-trip serialization', () => {
  function roundTripBuffer<T extends OrdinalVdxfObject>(obj: T): T {
    const buf = obj.toBuffer();
    // Use the factory createFromBuffer so the correct subclass is used
    const { obj: parsed } = OrdinalVdxfObject.createFromBuffer(buf);
    // Type assertion
    return parsed as T;
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
    } else if (obj instanceof LoginRequestDetailsOrdinalVdxfObject) {
      newObj = LoginRequestDetailsOrdinalVdxfObject.fromJson(json as any);
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

  it('getOrdinalVdxfObjectClassForType should map to correct classes', () => {
    expect(getOrdinalVdxfObjectClassForType(OrdinalVdxfObject.ORDINAL_DATA_DESCRIPTOR))
      .toBe(DataDescriptorOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(OrdinalVdxfObject.ORDINAL_VERUSPAY_INVOICE))
      .toBe(VerusPayInvoiceOrdinalVdxfObject);
    expect(getOrdinalVdxfObjectClassForType(OrdinalVdxfObject.VDXF_OBJECT_RESERVED_BYTE_I_ADDR))
      .toBe(GeneralTypeOrdinalVdxfObject);

    // unrecognized
    expect(() => getOrdinalVdxfObjectClassForType(new BN(999))).toThrow();
  });

  it('base OrdinalVdxfObject buffer round trip (no key path)', () => {
    // This tests the fallback when no key is provided
    const base = new OrdinalVdxfObject({ type: OrdinalVdxfObject.ORDINAL_DATA_DESCRIPTOR });
    const buf = base.toBuffer();
    const parsed = new OrdinalVdxfObject();
    parsed.fromBuffer(buf);

    expect(parsed.type.toString()).toBe(base.type.toString());
    expect(parsed.version.toString()).toBe(base.version.toString());

    // data is undefined or empty
    expect(parsed.data).toBeUndefined();
  });

  it('should serialize / deserialize a LoginRequestDetailsOrdinalVdxfObject via buffer', () => {
    const obj = new LoginRequestDetails({
          requestId: "iBJqQMRzpCW1WVYoU2Ty2VbCJnvyTEsE1C",
          flags: new BN(LoginRequestDetails.FLAG_HAS_PERMISSIONS)
            .or(new BN(LoginRequestDetails.FLAG_HAS_CALLBACK_URI))
            .or(new BN(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME)),
          permissions: [{type: new BN(1), identity: new CompactIdAddressObject({
              version: new BN(1),
              type: CompactIdAddressObject.IS_IDENTITYID,
              address: "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv",
              rootSystemName: "VRSC"
          })}],
          callbackUris: [{type: new BN(LoginRequestDetails.TYPE_WEBHOOK), uri: "https://example.com/callback"}],
          expiryTime: new BN(345353453),
    });

    const objOrdinal = new LoginRequestDetailsOrdinalVdxfObject({ data: obj });

    const round = roundTripBuffer(objOrdinal);
    expect(round).toBeInstanceOf(LoginRequestDetailsOrdinalVdxfObject);
    const d2 = (round as LoginRequestDetailsOrdinalVdxfObject).data;
    expect(d2.requestId).toEqual(objOrdinal.data.requestId);
    const json = objOrdinal.toJson();
    expect(json.data).toBeDefined();
    const roundJ = roundTripJson(objOrdinal);
    expect(roundJ).toBeInstanceOf(LoginRequestDetailsOrdinalVdxfObject);
    const d3 = (roundJ as LoginRequestDetailsOrdinalVdxfObject).data;
    expect(d3.requestId).toEqual(objOrdinal.data.requestId);
    }); 
});