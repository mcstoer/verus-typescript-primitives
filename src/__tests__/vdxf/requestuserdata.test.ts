
import { CompactIdAddressObject, RequestUserData, RequestUserDataJson } from "../../vdxf/classes";

describe('Serializes and deserializes RequestUserData', () => {
  test('(de)serialize RequestUserData', () => {

    const provisionJson: RequestUserDataJson = {
      version: 1,
      flags: RequestUserData.FULL_DATA.or(RequestUserData.ATTESTATION).or(RequestUserData.HAS_SIGNER).toNumber(),
      searchdatakey: [{ "iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Attestation Name" }],
      signer: { version: 1, type: CompactIdAddressObject.IS_IDENTITYID, address: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq", rootsystemname: "VRSC" }
    }

    const e = RequestUserData.fromJson(provisionJson);
    const r = e.toBuffer();
    const rFromBuf = new RequestUserData();
    rFromBuf.fromBuffer(r);

    expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
  });
  test('(de)serialize RequestUserData with requestedkeys', async () => {

    const provisionJson: RequestUserDataJson = {
      version: 1,
      flags: RequestUserData.PARTIAL_DATA.or(RequestUserData.ATTESTATION).or(RequestUserData.HAS_SIGNER).toNumber(),
      searchdatakey: [{ "iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Attestation Name" }],
      signer: { version: 1, type: CompactIdAddressObject.IS_FQN, address: "bob@", rootsystemname: "VRSC" },
      requestedkeys: ["iLB8SG7ErJtTYcG1f4w9RLuMJPpAsjFkiL"]
    }

    const e = RequestUserData.fromJson(provisionJson);
    const r = e.toBuffer();
    const rFromBuf = new RequestUserData();
    rFromBuf.fromBuffer(r);

    expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
  });
});