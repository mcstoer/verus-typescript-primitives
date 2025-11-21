
import { CompactIdAddressObject, UserDataRequest, UserDataRequestJson } from "../../vdxf/classes";

describe('Serializes and deserializes UserDataRequest', () => {
  test('(de)serialize UserDataRequest', () => {

    const provisionJson: UserDataRequestJson = {
      version: 1,
      flags: UserDataRequest.FULL_DATA.or(UserDataRequest.ATTESTATION).or(UserDataRequest.HAS_SIGNER).toNumber(),
      searchdatakey: [{ "iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Attestation Name" }],
      signer: { version: 1, type: CompactIdAddressObject.IS_IDENTITYID.toNumber(), address: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq", rootsystemname: "VRSC" },
      requestid: "iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ"
    }

    const e = UserDataRequest.fromJson(provisionJson);
    const r = e.toBuffer();
    const rFromBuf = new UserDataRequest();
    rFromBuf.fromBuffer(r);

    expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
  });
  test('(de)serialize UserDataRequest with requestedkeys', async () => {

    const provisionJson: UserDataRequestJson = {
      version: 1,
      flags: UserDataRequest.PARTIAL_DATA.or(UserDataRequest.ATTESTATION).or(UserDataRequest.HAS_SIGNER).toNumber(),
      searchdatakey: [{ "iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Attestation Name" }],
      signer: { version: 1, type: CompactIdAddressObject.IS_FQN.toNumber(), address: "bob@", rootsystemname: "VRSC" },
      requestedkeys: ["iLB8SG7ErJtTYcG1f4w9RLuMJPpAsjFkiL"],
      requestid: "iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ"
    }

    const e = UserDataRequest.fromJson(provisionJson);
    const r = e.toBuffer();
    const rFromBuf = new UserDataRequest();
    rFromBuf.fromBuffer(r);

    expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
  });
});