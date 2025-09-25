
import { ProvisionIdentity } from "../../vdxf/classes/requestobjects/ProvisioningIdentity";


describe('Serializes and deserializes ProvisionIdentity', () => {
    test('(de)serialize ProvisionIdentity', () => {

        const provisionJson = {
            version: 1,
            flags: ProvisionIdentity.FLAG_HAS_IDENTITYID.or(ProvisionIdentity.FLAG_HAS_WEBHOOK).toNumber(),
            identity_id: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
            system_id: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
            parent_id: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
            webhook: "https://mydomain.com/webhook"            
        }

        const e = ProvisionIdentity.fromJson(provisionJson);
        const r = e.toBuffer();
        const rFromBuf = new ProvisionIdentity;
        rFromBuf.fromBuffer(r);

        expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
    });
    test('(de)serialize ProvisionIdentity with fqn', async () => {

        const provisionJson = {
            version: 1,
            flags: ProvisionIdentity.FLAG_HAS_IDENTITYID
            .or(ProvisionIdentity.FLAG_HAS_WEBHOOK).or(ProvisionIdentity.FLAG_HAS_FQN).toNumber(),
            identity_id: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
            system_id: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
            parent_id: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
            webhook: "https://mydomain.com/webhook",
            fqn: "my.fully.vrsc@"
        }

        const e = ProvisionIdentity.fromJson(provisionJson);
        const r = e.toBuffer();
        const rFromBuf = new ProvisionIdentity;
        rFromBuf.fromBuffer(r);

        expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
    });
});