import { BN } from 'bn.js';
import base64url from 'base64url';
import { DEFAULT_VERUS_CHAINID, HASH_TYPE_SHA256 } from '../../constants/pbaas';
import { WALLET_VDXF_KEY, GENERIC_REQUEST_DEEPLINK_VDXF_KEY, GenericRequest, SaplingPaymentAddress } from '../../';
import { createHash } from 'crypto';
import { VerifiableSignatureData } from '../../vdxf/classes/VerifiableSignatureData';
import { CompactIdAddressObject } from '../../vdxf/classes/CompactIdAddressObject';
import { GeneralTypeOrdinalVdxfObject } from '../../vdxf/classes/ordinals';

describe('GenericRequest — buffer / URI / QR operations', () => {
  function roundTripBuffer(req: GenericRequest): GenericRequest {
    const buf = req.toBuffer();
    const clone = new GenericRequest();
    clone.fromBuffer(buf, 0);
    return clone;
  }

  function rawDetailsSha256(req: GenericRequest): Buffer {
    // replicate the same behavior as getRawDetailsSha256()
    const buf = req['toBufferOptionalSig'](false);  // call internal method
    return createHash("sha256").update(buf).digest();
  }

  it('round trips with a single detail (no signature / createdAt)', () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('cafebabe', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericRequest({ details: [detail] });

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
    const req = new GenericRequest({ details: [d1, d2] });
    expect(req.hasMultiDetails()).toBe(true);

    const round = roundTripBuffer(req);
    expect(round.details.length).toBe(2);
    expect((round.getDetails(0) as GeneralTypeOrdinalVdxfObject).data).toEqual(d1.data);
    expect((round.getDetails(1) as GeneralTypeOrdinalVdxfObject).data).toEqual(d2.data);
    expect(round.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('round trips with createdAt, signature, and encryptResponseToAddress', () => {
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
    const saplingAddr = "zs1wczplx4kegw32h8g0f7xwl57p5tvnprwdmnzmdnsw50chcl26f7tws92wk2ap03ykaq6jyyztfa"

    const req = new GenericRequest({
      details: [detail],
      signature: sig,
      createdAt,
      encryptResponseToAddress: SaplingPaymentAddress.fromAddressString(saplingAddr)
    });

    expect(req.isSigned()).toBe(true);
    expect(req.hasCreatedAt()).toBe(true);

    const round = roundTripBuffer(req);
    expect(round.signature).toBeDefined();
    expect(round.createdAt?.toString()).toEqual(createdAt.toString());
    expect(round.hasEncryptResponseToAddress()).toBe(true)
    expect(round.encryptResponseToAddress?.toAddressString()).toBe(saplingAddr)
    const d2 = round.getDetails(0);
    expect((d2 as GeneralTypeOrdinalVdxfObject).data).toEqual(detail.data);
    expect(round.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('toString / fromQrString consistency', () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('feed', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericRequest({ details: [detail] });

    const str = req.toString();
    const buf = base64url.toBuffer(str);
    const parsed = new GenericRequest();
    parsed.fromBuffer(buf, 0);
    expect(parsed.details[0].toJson()).toEqual(detail.toJson());
  });

  it('deeplink URI round trip', () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('face', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericRequest({ details: [detail] });
    const uri = req.toWalletDeeplinkUri();

    expect(uri).toContain(WALLET_VDXF_KEY.vdxfid.toLowerCase());
    expect(uri).toContain(`${GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/`);

    const parsed = GenericRequest.fromWalletDeeplinkUri(uri);
    expect(parsed.version.toString()).toEqual(req.version.toString());
    expect(parsed.details[0].toJson()).toEqual(detail.toJson());
    expect(parsed.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('fromQrString should parse correctly', () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from('bead', 'hex'),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericRequest({ details: [detail] });
    const qr = req.toQrString();
    const parsed = GenericRequest.fromQrString(qr);
    expect(parsed.details[0].toJson()).toEqual(detail.toJson());
    expect(parsed.toBuffer().toString('hex')).toEqual(req.toBuffer().toString('hex'));
  });

  it('fromBuffer with empty buffer should throw', () => {
    const empty = Buffer.alloc(0);
    const req = new GenericRequest();
    expect(() => {
      req.fromBuffer(empty, 0);
    }).toThrow("Cannot create request from empty buffer");
  });

  it("returns raw SHA256 when not signed", () => {
    const detail = new GeneralTypeOrdinalVdxfObject({
      data: Buffer.from("abcd", "hex"),
      key: DEFAULT_VERUS_CHAINID
    });
    const req = new GenericRequest({ details: [detail] });
    expect(req.isSigned()).toBe(false);

    const hash = req.getDetailsHash(123456);
    const expected = rawDetailsSha256(req);
    expect(hash).toEqual(expected);
  });
});