import { BN } from "bn.js";
import { DataDescriptor } from "../../pbaas/DataDescriptor";
import { VerusPayInvoiceDetails } from "../../vdxf/classes/payment/VerusPayInvoiceDetails";
import { SignatureData } from "../../pbaas/SignatureData";
import { GenericRequest } from "../../vdxf/classes";

describe("GenericRequest serialization tests", () => {
  test("rejects invalid versions", () => {
    const details = DataDescriptor.fromJson({
      version: 1,
      "flags": 2,
      "objectdata": {
        "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
          "version": 1,
          "flags": 96,
          "mimetype": "text/plain",
          "objectdata": {
            "message": "Something 1"
          },
          "label": "label 1"
        }
      },
      "salt": "4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2"
    });

    const tooLow = new GenericRequest({
      details,
      version: GenericRequest.VERSION_FIRSTVALID.sub(new BN(1)),
    });
    expect(() => {
      const buf = tooLow.toBuffer();
      const req = new GenericRequest();
      req.fromBuffer(buf);
    }).toThrow("Unsupported version for vdxf object.");

    const tooHigh = new GenericRequest({
      details,
      version: GenericRequest.VERSION_LASTVALID.add(new BN(1)),
    });
    expect(() => {
      const buf = tooHigh.toBuffer();
      const req = new GenericRequest();
      req.fromBuffer(buf);
    }).toThrow("Unsupported version for vdxf object.");
  });

  test("roundtrip unsigned request with DataDescriptor", () => {
    const details = DataDescriptor.fromJson({
      version: 1,
      "flags": 2,
      "objectdata": {
        "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
          "version": 1,
          "flags": 96,
          "mimetype": "text/plain",
          "objectdata": {
            "message": "Something 1"
          },
          "label": "label 1"
        }
      },
      "salt": "4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2"
    });

    const req = new GenericRequest({ details });

    const buf = req.toBuffer();
    const req2 = new GenericRequest();
    req2.fromBuffer(buf);

    expect(req2.toBuffer().toString("hex")).toBe(buf.toString("hex"));

    const uri = req.toWalletDeeplinkUri();
    const fromUri = GenericRequest.fromWalletDeeplinkUri(uri);
    expect(fromUri.toBuffer().toString("hex")).toBe(buf.toString("hex"));

    const qr = req.toQrString();
    const fromQr = GenericRequest.fromQrString(qr);
    expect(fromQr.toBuffer().toString("hex")).toBe(buf.toString("hex"));

    const json = req.toJson();

    const fromJson = GenericRequest.fromJson(json);
    expect(fromJson.toBuffer().toString("hex")).toBe(buf.toString("hex"));
  });

  test("roundtrip unsigned request with VerusPayInvoiceDetails", () => {
    const details = new VerusPayInvoiceDetails({
      requestedcurrencyid: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
    });

    details.setFlags({
      acceptsConversion: false,
      acceptsNonVerusSystems: false,
      expires: false,
      acceptsAnyAmount: true,
      acceptsAnyDestination: true
    })

    const req = new GenericRequest({
      details,
      type: GenericRequest.TYPE_INVOICE,
    });

    const buf = req.toBuffer();
    const req2 = new GenericRequest();
    req2.fromBuffer(buf);

    expect(req2.toBuffer().toString("hex")).toBe(buf.toString("hex"));

    const json = req.toJson();
    const fromJson = GenericRequest.fromJson(json);
    expect(fromJson.toBuffer().toString("hex")).toBe(buf.toString("hex"));
  });

  test("roundtrip signed request with DataDescriptor + SignatureData", () => {
    const details = DataDescriptor.fromJson({
      version: 1,
      "flags": 2,
      "objectdata": {
        "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
          "version": 1,
          "flags": 96,
          "mimetype": "text/plain",
          "objectdata": {
            "message": "Something 1"
          },
          "label": "label 1"
        }
      },
      "salt": "4f66603f256d3f757b6dc3ea44802d4041d2a1901e06005028fd60b85a5878a2"
    });

    const sig = new SignatureData({
      version: new BN(1),
      system_ID: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
      hash_type: new BN(5), // EHashTypes.HASH_SHA256
      signature_hash: Buffer.from("aabbccdd", "hex"),
      identity_ID: "iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU",
      sig_type: new BN(1),
      signature_as_vch: Buffer.from("fakesignature"),
    });

    const req = new GenericRequest({
      details,
      system_id: sig.system_ID,
      signing_id: sig.identity_ID,
      signature: sig,
      type: GenericRequest.TYPE_DATA_DESCRIPTOR,
    });

    req.setSigned();

    const buf = req.toBuffer();
    const req2 = new GenericRequest();
    req2.fromBuffer(buf);

    expect(req2.toBuffer().toString("hex")).toBe(buf.toString("hex"));

    const uri = req.toWalletDeeplinkUri();
    const fromUri = GenericRequest.fromWalletDeeplinkUri(uri);
    expect(fromUri.toBuffer().toString("hex")).toBe(buf.toString("hex"));

    const qr = req.toQrString();
    const fromQr = GenericRequest.fromQrString(qr);
    expect(fromQr.toBuffer().toString("hex")).toBe(buf.toString("hex"));

    const json = req.toJson();
    const fromJson = GenericRequest.fromJson(json);
    expect(fromJson.toBuffer().toString("hex")).toBe(buf.toString("hex"));
  });

  test("throws on empty buffer", () => {
    const buf = Buffer.from([]);
    const req = new GenericRequest();
    expect(() => req.fromDataBuffer(buf)).toThrow("Cannot create request from empty buffer");
  });
});