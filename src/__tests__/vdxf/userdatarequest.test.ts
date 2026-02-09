
import { CompactAddressObject, CompactIAddressObject, UserDataRequestDetails, UserDataRequestJson } from "../../vdxf/classes";

describe('Serializes and deserializes UserDataRequestDetails', () => {
  test('(de)serialize UserDataRequestDetails', () => {

    const provisionJson: UserDataRequestJson = {
      version: 1,
      flags: UserDataRequestDetails.FULL_DATA.or(UserDataRequestDetails.ATTESTATION).or(UserDataRequestDetails.FLAG_HAS_SIGNER).toNumber(),
      searchdatakey: [{ "iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Attestation Name" }],
      signer: { version: 1, type: CompactAddressObject.TYPE_I_ADDRESS.toNumber(), address: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq", rootsystemname: "VRSC" },
      requestid: CompactIAddressObject.fromAddress("iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ").toJson()
    }

    const e = UserDataRequestDetails.fromJson(provisionJson);
    const r = e.toBuffer();
    const rFromBuf = new UserDataRequestDetails();
    rFromBuf.fromBuffer(r);

    expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
  });
  test('(de)serialize UserDataRequestDetails with requestedkeys', async () => {

    const provisionJson: UserDataRequestJson = {
      version: 1,
      flags: UserDataRequestDetails.PARTIAL_DATA.or(UserDataRequestDetails.ATTESTATION).or(UserDataRequestDetails.FLAG_HAS_SIGNER).toNumber(),
      searchdatakey: [{ "iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Attestation Name" }],
      signer: { version: 1, type: CompactAddressObject.TYPE_FQN.toNumber(), address: "bob@", rootsystemname: "VRSC" },
      requestedkeys: ["iLB8SG7ErJtTYcG1f4w9RLuMJPpAsjFkiL"],
      requestid: CompactIAddressObject.fromAddress("iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ").toJson()
    }

    const e = UserDataRequestDetails.fromJson(provisionJson);
    const r = e.toBuffer();
    const rFromBuf = new UserDataRequestDetails();
    rFromBuf.fromBuffer(r);

    expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
  });
});