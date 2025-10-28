
import { ProvisionIdentityDetails } from "../../vdxf/classes/requestobjects/ProvisionIdentityDetails";
import { CompactIdAddressObject, ProvisionIdentityDetailsJson } from "../../vdxf/classes";

describe('Serializes and deserializes ProvisionIdentityDetails', () => {
    test('(de)serialize ProvisionIdentityDetails', () => {

        const provisionJson: ProvisionIdentityDetailsJson = {
            version: 1,
            flags: ProvisionIdentityDetails.FLAG_HAS_SYSTEMID.or(ProvisionIdentityDetails.FLAG_HAS_PARENTID).toNumber(),
            systemid: {version: 1, type: CompactIdAddressObject.IS_IDENTITYID.toNumber(), address: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq", rootsystemname: "VRSC"},
            parentid: {version: 1, type: CompactIdAddressObject.IS_IDENTITYID.toNumber(), address: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB", rootsystemname: "VRSC"}
        }

        const e = ProvisionIdentityDetails.fromJson(provisionJson);
        const r = e.toBuffer();
        const rFromBuf = new ProvisionIdentityDetails();
        rFromBuf.fromBuffer(r);

        expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
    });
    test('(de)serialize ProvisionIdentity with fqn', async () => {

        const provisionJson = {
            version: 1,
            flags: ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION.toNumber(),
            identityid: {version: 1, type: CompactIdAddressObject.IS_FQN, address: "my.fully.vrsc@", rootsystemname: "VRSC"}
        }

        const e = ProvisionIdentityDetails.fromJson(provisionJson);
        const r = e.toBuffer();
        const rFromBuf = new ProvisionIdentityDetails();
        rFromBuf.fromBuffer(r);

        expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
    });
});