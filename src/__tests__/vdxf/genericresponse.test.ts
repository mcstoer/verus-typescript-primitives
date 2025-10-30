import { BN } from 'bn.js';
import base64url from 'base64url';
import { DEFAULT_VERUS_CHAINID, HASH_TYPE_SHA256 } from '../../constants/pbaas';
import { WALLET_VDXF_KEY, GENERIC_REQUEST_DEEPLINK_VDXF_KEY, GenericResponse, SaplingPaymentAddress } from '../../';
import { createHash } from 'crypto';
import { VerifiableSignatureData } from '../../vdxf/classes/VerifiableSignatureData';
import { CompactIdAddressObject } from '../../vdxf/classes/CompactIdAddressObject';
import { GeneralTypeOrdinalVdxfObject } from '../../vdxf/classes/ordinals';

describe('GenericResponse — buffer / URI / QR operations', () => {
  function roundTripBuffer(req: GenericResponse): GenericResponse {
    const buf = req.toBuffer();
    const clone = new GenericResponse();
    clone.fromBuffer(buf, 0);
    return clone;
  }

  function rawDetailsSha256(req: GenericResponse): Buffer {
    // replicate the same behavior as getRawDetailsSha256()
    const buf = req['toBufferOptionalSig'](false);  // call internal method
    return createHash("sha256").update(buf).digest();
  }

  it('round trips with a single detail (no signature / createdAt)', () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('cafebabe', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericResponse({ details: [detail] });

    expect(req.hasMultiDetails()).toBe(false);
    expect(req.hasCreatedAt()).toBe(false);
    expect(req.isSigned()).toBe(false);

    const round = roundTripBuffer(req);
    expect(round.version.toString()).toEqual(req.version.toString());
    expect(round.flags.toString()).toEqual(req.flags.toString());
    expect(round.details.length).toBe(1);
    const d2 = round.getDetails(0);
    expect(d2).toBeInstanceOf(GeneralTypeOrdinalVdxfObject);
    expect((d2 as GeneralTypeOrdinalVdxfObject).data).toEqual(detail.data);
    expect((d2 as GeneralTypeOrdinalVdxfObject).key).toEqual(detail.key);
    expect(round.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('round trips with multiple details', () => {
    const d1 = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('aa', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const d2 = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('bb', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericResponse({ details: [d1, d2] });
    expect(req.hasMultiDetails()).toBe(true);

    const round = roundTripBuffer(req);
    expect(round.details.length).toBe(2);
    expect((round.getDetails(0) as GeneralTypeOrdinalVdxfObject).data).toEqual(d1.data);
    expect((round.getDetails(1) as GeneralTypeOrdinalVdxfObject).data).toEqual(d2.data);
    expect(round.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('round trips with createdAt, signature, and requestHash/requestHashType', () => {
    const sig = new VerifiableSignatureData({
      flags: new BN(0),
      version: new BN(1),
      systemID: CompactIdAddressObject.fromIAddress(DEFAULT_VERUS_CHAINID),
      hashType: HASH_TYPE_SHA256,
      identityID: CompactIdAddressObject.fromIAddress(DEFAULT_VERUS_CHAINID),
      signatureAsVch: Buffer.from('abcd', 'hex'),
      vdxfKeys: [DEFAULT_VERUS_CHAINID, DEFAULT_VERUS_CHAINID],
      vdxfKeyNames: ["VRSC", "VRSC"],
      boundHashes: [Buffer.from('abcd', 'hex')],
      statements: [Buffer.from('abcd', 'hex')]
    });

    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('abcd', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });

    const createdAt = new BN(9999);
    const requestHash = Buffer.from('abcdabcdabcdabcdabcdabcdabcdabcdabcdabcd', 'hex');
    const requestHashType = HASH_TYPE_SHA256;

    const req = new GenericResponse({
      details: [detail],
      signature: sig,
      createdAt,
      requestHash: requestHash,
      requestHashType: requestHashType
    });

    expect(req.isSigned()).toBe(true);
    expect(req.hasCreatedAt()).toBe(true);

    const round = roundTripBuffer(req);
    expect(round.signature).toBeDefined();
    expect(round.createdAt?.toString()).toEqual(createdAt.toString());
    expect(round.hasRequestHash()).toBe(true)
    expect(round.requestHash?.toString('hex')).toBe(requestHash.toString('hex'))
    expect(round.requestHashType?.toNumber()).toBe(requestHashType.toNumber())
    const d2 = round.getDetails(0);
    expect((d2 as GeneralTypeOrdinalVdxfObject).data).toEqual(detail.data);
    expect(round.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('toString / fromQrString consistency', () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('feed', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericResponse({ details: [detail] });

    const str = req.toString();
    const buf = base64url.toBuffer(str);
    const parsed = new GenericResponse();
    parsed.fromBuffer(buf, 0);
    expect(parsed.details[0].toJson()).toEqual(detail.toJson());
  });

  it('deeplink URI round trip', () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('face', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericResponse({ details: [detail] });
    const uri = req.toWalletDeeplinkUri();

    expect(uri).toContain(WALLET_VDXF_KEY.vdxfid.toLowerCase());
    expect(uri).toContain(`${GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/`);

    const parsed = GenericResponse.fromWalletDeeplinkUri(uri);
    expect(parsed.version.toString()).toEqual(req.version.toString());
    expect(parsed.details[0].toJson()).toEqual(detail.toJson());
    expect(parsed.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('fromQrString should parse correctly', () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('bead', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericResponse({ details: [detail] });
    const qr = req.toQrString();
    const parsed = GenericResponse.fromQrString(qr);
    expect(parsed.details[0].toJson()).toEqual(detail.toJson());
    expect(parsed.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('fromBuffer with empty buffer should throw', () => {
    const empty = Buffer.alloc(0);
    const req = new GenericResponse();
    expect(() => {
      req.fromBuffer(empty, 0);
    }).toThrow("Cannot create response from empty buffer");
  });

  it("returns raw SHA256 when not signed", () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from("abcd", "hex"),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericResponse({ details: [detail] });
    expect(req.isSigned()).toBe(false);

    const hash = req.getDetailsHash(123456);
    const expected = rawDetailsSha256(req);
    expect(hash).toEqual(expected);
  });
});