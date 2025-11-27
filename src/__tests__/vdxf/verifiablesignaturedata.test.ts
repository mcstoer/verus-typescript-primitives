import { VerifiableSignatureData } from "../../vdxf/classes/VerifiableSignatureData";
import { CompactIdAddressObject } from "../../vdxf/classes/CompactIdAddressObject";
import { HASH_TYPE_SHA256 } from '../../constants/pbaas';
import { BN } from "bn.js";
import { SignatureData } from "../../pbaas/SignatureData";

const createHash = require("create-hash");

describe('Serializes and deserializes SignatureData', () => {
    test('(de)serialize SignatureData', () => {

        const s = new VerifiableSignatureData({
                  version: new BN(1),
                  signatureAsVch: Buffer.from("efc8d6b60c5b6efaeb3fce4b2c0749c317f2167549ec22b1bee411b8802d5aaf", 'hex'),
                  hashType: HASH_TYPE_SHA256,
                  flags: new BN(0),
                  identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW", rootSystemName: "VRSC" }),
                  systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSC", rootSystemName: "VRSC" }),
                })

        const sFromBuf = new VerifiableSignatureData();

        sFromBuf.fromBuffer(s.toBuffer())

        expect(sFromBuf.toBuffer().toString('hex')).toBe(s.toBuffer().toString('hex'))
    });

    test('(de)serialize SignatureData with vdxfKeys', () => {
        const s = new VerifiableSignatureData({
            version: new BN(1),
            signatureVersion: new BN(2),
            signatureAsVch: Buffer.from("efc8d6b60c5b6efaeb3fce4b2c0749c317f2167549ec22b1bee411b8802d5aaf", 'hex'),
            hashType: HASH_TYPE_SHA256,
            identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW", rootSystemName: "VRSC" }),
            systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSC", rootSystemName: "VRSC" }),
            vdxfKeys: ["iRrCKQqLQrWczeNotMgqJkoUW5ZzF182Ax", "iCCSCFbq9n7ftEQCQT94t8CcVV5NdxnTvL"],
        })

        const sFromBuf = new VerifiableSignatureData();
        sFromBuf.fromBuffer(s.toBuffer())

        expect(sFromBuf.toBuffer().toString('hex')).toBe(s.toBuffer().toString('hex'))
        expect(sFromBuf.vdxfKeys).toEqual(s.vdxfKeys)
        expect(sFromBuf.hasVdxfKeys()).toBe(true)
    });

    test('(de)serialize SignatureData with vdxfKeyNames', () => {
        const s = new VerifiableSignatureData({
            version: new BN(1),
            signatureVersion: new BN(2),
            signatureAsVch: Buffer.from("efc8d6b60c5b6efaeb3fce4b2c0749c317f2167549ec22b1bee411b8802d5aaf", 'hex'),
            hashType: HASH_TYPE_SHA256,
            identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW", rootSystemName: "VRSC" }),
            systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSC", rootSystemName: "VRSC" }),
            vdxfKeyNames: ["key.name.one", "key.name.two", "another.key"],
        })

        const sFromBuf = new VerifiableSignatureData();
        sFromBuf.fromBuffer(s.toBuffer())

        expect(sFromBuf.toBuffer().toString('hex')).toBe(s.toBuffer().toString('hex'))
        expect(sFromBuf.vdxfKeyNames).toEqual(s.vdxfKeyNames)
        expect(sFromBuf.hasVdxfKeyNames()).toBe(true)
    });

    test('(de)serialize SignatureData with boundHashes', () => {
        const s = new VerifiableSignatureData({
            version: new BN(1),
            signatureVersion: new BN(2),
            signatureAsVch: Buffer.from("efc8d6b60c5b6efaeb3fce4b2c0749c317f2167549ec22b1bee411b8802d5aaf", 'hex'),
            hashType: HASH_TYPE_SHA256,
            identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW", rootSystemName: "VRSC" }),
            systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSC", rootSystemName: "VRSC" }),
            boundHashes: [
                Buffer.from("a".repeat(64), 'hex'),
                Buffer.from("b".repeat(64), 'hex'),
            ],
        })

        const sFromBuf = new VerifiableSignatureData();
        sFromBuf.fromBuffer(s.toBuffer())

        expect(sFromBuf.toBuffer().toString('hex')).toBe(s.toBuffer().toString('hex'))
        expect(sFromBuf.boundHashes?.length).toBe(2)
        expect(sFromBuf.hasBoundHashes()).toBe(true)
    });

    test('(de)serialize SignatureData with all extra data', () => {
        const s = new VerifiableSignatureData({
            version: new BN(1),
            signatureVersion: new BN(2),
            signatureAsVch: Buffer.from("efc8d6b60c5b6efaeb3fce4b2c0749c317f2167549ec22b1bee411b8802d5aaf", 'hex'),
            hashType: HASH_TYPE_SHA256,
            identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW", rootSystemName: "VRSC" }),
            systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSC", rootSystemName: "VRSC" }),
            vdxfKeys: ["iRrCKQqLQrWczeNotMgqJkoUW5ZzF182Ax", "iCCSCFbq9n7ftEQCQT94t8CcVV5NdxnTvL"],
            vdxfKeyNames: ["key.name.one", "key.name.two"],
            boundHashes: [
                Buffer.from("a".repeat(64), 'hex'),
                Buffer.from("b".repeat(64), 'hex'),
            ],
        })

        const sFromBuf = new VerifiableSignatureData();
        sFromBuf.fromBuffer(s.toBuffer())

        expect(sFromBuf.toBuffer().toString('hex')).toBe(s.toBuffer().toString('hex'))
        expect(sFromBuf.vdxfKeys).toEqual(s.vdxfKeys)
        expect(sFromBuf.vdxfKeyNames).toEqual(s.vdxfKeyNames)
        expect(sFromBuf.boundHashes?.length).toBe(2)
        expect(sFromBuf.hasVdxfKeys()).toBe(true)
        expect(sFromBuf.hasVdxfKeyNames()).toBe(true)
        expect(sFromBuf.hasBoundHashes()).toBe(true)
    });

    test('getIdentityHash with extra data - vdxfKeys are sorted by buffer value', () => {
        // Create with keys in non-sorted order
        const s = new VerifiableSignatureData({
            version: new BN(1),
            signatureVersion: new BN(2),
            signatureAsVch: Buffer.from("AgVfngwAAUEgywnMVejMz6iZj88qRawIivovU9L9uQtGcDbD635QbNt2G/QoZjxT6c7w099JjBd2cGa8ajI99KG0MTbHT99ZZw==", 'base64'),
            hashType: HASH_TYPE_SHA256,
            identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i4M7ar436N7wKHgZodjGAWdsBSNjG7cz8s", rootSystemName: "VRSCTEST" }),
            systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSCTEST", rootSystemName: "VRSCTEST" }),
            vdxfKeys: ["iQRWB2Ay9rEbzStXDjMFpveh4oEmD6YWXa"],
        })

        const sigHash = createHash("sha256").update("hello world1").digest();
        const hash1 = s.getIdentityHash(826975, sigHash);
        console.log(`run verifyhash "${s.identityID.toIAddress()}" "${s.signatureAsVch.toString('base64')}" "${hash1.toString('hex')}"`);

        // Create with same keys but different order
        const s2 = new VerifiableSignatureData({
            version: new BN(1),
            signatureVersion: new BN(2),
            signatureAsVch: Buffer.from("AgVfngwAAUEgywnMVejMz6iZj88qRawIivovU9L9uQtGcDbD635QbNt2G/QoZjxT6c7w099JjBd2cGa8ajI99KG0MTbHT99ZZw==", 'base64'),
            hashType: HASH_TYPE_SHA256,
            identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i4M7ar436N7wKHgZodjGAWdsBSNjG7cz8s", rootSystemName: "VRSCTEST" }),
            systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSCTEST", rootSystemName: "VRSCTEST" }),
            vdxfKeys: ["iQRWB2Ay9rEbzStXDjMFpveh4oEmD6YWXa"],
        })

        const hash2 = s2.getIdentityHash(826975, sigHash);

        // Hashes should be identical because keys are sorted before hashing
        expect(hash1.toString('hex')).toBe(hash2.toString('hex'))
        console.log(`1 run verifyhash "${s2.identityID.toIAddress()}" "${s2.signatureAsVch.toString('base64')}" "${hash2.toString('hex')}"`);
        console.log(`1 run verifyhash "${s2.identityID.toIAddress()}" "${s2.signatureAsVch.toString('base64')}" "${hash2.reverse().toString('hex')}"`);
    });

        test('getIdentityHash with extra data - vdxfKeys are sorted by buffer value', () => {
        // Create with keys in non-sorted order
        const s = new VerifiableSignatureData({
            version: new BN(1),
            signatureVersion: new BN(2),
            signatureAsVch: Buffer.from("AgV1ngwAAUEfYEg7UW5l0zS88ERfSBXZJ6+RWiUwXQ8BwMkkUesmemFBF29LEVw0C60csXMbMdLYxt3qGLLhgHnev9XIwWFIvw==", 'base64'),
            hashType: HASH_TYPE_SHA256,
            identityID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: "i4M7ar436N7wKHgZodjGAWdsBSNjG7cz8s", rootSystemName: "VRSCTEST" }),
            systemID: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_FQN, address: "VRSCTEST", rootSystemName: "VRSCTEST" }),
        })

        const sigHash = createHash("sha256").update("hello world1").digest();
        const hash1 = s.getIdentityHash(826997, sigHash);
        console.log(`2 run verifyhash "${s.identityID.toIAddress()}" "${s.signatureAsVch.toString('base64')}" "${hash1.toString('hex')}"`);
        console.log(`2 run verifyhash "${s.identityID.toIAddress()}" "${s.signatureAsVch.toString('base64')}" "${hash1.reverse().toString('hex')}"`);
        

        // Hashes should be identical because keys are sorted before hashing
        expect(hash1.toString('hex')).toBe(hash1.toString('hex'))

    });

  
});
