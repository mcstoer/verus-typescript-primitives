
import { ProvisionIdentityDetails } from "../../vdxf/classes/requestobjects/ProvisionIdentityDetails";
import { CompactIAddressObject, CompactAddressObject } from "../../vdxf/classes";
import { BN } from "bn.js";
import { TEST_IDENTITY_ID_1, TEST_IDENTITY_ID_2 } from "../constants/fixtures";

describe('Serializes and deserializes ProvisionIdentityDetails', () => {
  test('(de)serialize ProvisionIdentityDetails', () => {
    const e = new ProvisionIdentityDetails({
      version: new BN(1, 10),
      flags: ProvisionIdentityDetails.FLAG_HAS_SYSTEMID.or(ProvisionIdentityDetails.FLAG_HAS_PARENTID),
      systemID: new CompactIAddressObject({ version: CompactAddressObject.DEFAULT_VERSION, type: CompactAddressObject.TYPE_I_ADDRESS, address: TEST_IDENTITY_ID_1, rootSystemName: "VRSC" }),
      parentID: new CompactIAddressObject({ version: CompactAddressObject.DEFAULT_VERSION, type: CompactAddressObject.TYPE_I_ADDRESS, address: TEST_IDENTITY_ID_2, rootSystemName: "VRSC" })
    })

    const r = e.toBuffer();
    const rFromBuf = new ProvisionIdentityDetails();
    rFromBuf.fromBuffer(r);

    expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
  });

  test('(de)serialize ProvisionIdentity with fqn', async () => {
    const e = new ProvisionIdentityDetails({
      version: new BN(1, 10),
      flags: ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION,
      identityID: new CompactIAddressObject({ version: CompactAddressObject.DEFAULT_VERSION, type: CompactAddressObject.TYPE_I_ADDRESS, address: TEST_IDENTITY_ID_1, rootSystemName: "VRSC" })
    })

    const r = e.toBuffer();
    const rFromBuf = new ProvisionIdentityDetails();
    rFromBuf.fromBuffer(r);

    expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
  });
});