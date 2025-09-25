
import { Endorsement, ENDORSEMENT_SKILL } from "../../vdxf/classes/endorsement/Endorsement";


describe('Serializes and deserializes Endorsement', () => {
    test('(de)serialize Endorsement', () => {

        const endorsementJson = {
            version: 1,
            endorsee: "candidate.vrsctest@",
            reference: "f0e88c0a40e1681634faa6e6b23d5c60b413a4669817df55574a47086dd7e924", //blockchain txid
            txid: "493a5f8b457a44beb7ae0c9399192448b6e2576f399aff11c63228481628a8b7" //claim ref inside the txid
        }

        const e = Endorsement.fromJson(endorsementJson);
        const r = e.toBuffer();
        const rFromBuf = new Endorsement;
        rFromBuf.fromBuffer(r);

        expect(rFromBuf.toBuffer().toString('hex')).toBe(r.toString('hex'))
    });
    test('create Endorsement Identity Update', async () => {

        const endorsementJson = {
            version: 1,
            endorsee: "candidate.vrsctest@",
            reference: "d425c5dfd8074260a2143e31382a25f3eb82a9eecd21dc63f025bff37cbd3628",
            txid: "dcf012d856fead4d729b1e5f1b829e23e9198fb288e6c990f1d7ea9fb12c28a7" //claim ref inside the txid
        }

        const e = Endorsement.fromJson(endorsementJson);

        const hash = e.createHash("endorsetest@");

        e.setFlags();

        expect(() => e.toIdentityUpdateJson(ENDORSEMENT_SKILL)).toThrow("Signature is required");

    });
});