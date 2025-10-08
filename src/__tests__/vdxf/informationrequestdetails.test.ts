import { BN } from "bn.js";
import { 
  RequestItem, 
  RequestedFormatFlags, 
  InformationType
} from "../../vdxf/classes";
import {
  ATTESTATION_NAME
} from "../../vdxf/keys";
import {
  IDENTITY_FIRSTNAME,
  IDENTITY_DATEOFBIRTH
} from "../../vdxf/identitydatakeys";

// Helper function to create RequestItem with properties
function createRequestItem(props: any = {}) {
  const item = new RequestItem();
  Object.assign(item, props);
  return item;
}

const TEST_IDENTITY_ID_1 = "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW"; 

describe("RequestItem (InformationRequestDetails)", () => {
  describe("constructor and basic properties", () => {
    test("creates instance with default values", () => {
      const item = new RequestItem();

      expect(item.version.toString()).toBe("1");
      expect(item.format.toString()).toBe("1"); // FULL_DATA
      expect(item.type.toString()).toBe("1"); // ATTESTATION
      expect(item.id).toEqual({});
      expect(item.signer).toBe("");
      expect(item.requestedKeys).toEqual([]);
    });

    test("creates instance with custom values", () => {
      const item = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.PARTIAL_DATA),
        type: new BN(InformationType.CREDENTIAL),
        id: { attestationId: "123", type: "identity" },
        signer: TEST_IDENTITY_ID_1,
        requestedKeys: ["key1", "key2"]
      });

      expect(item.version.toString()).toBe("1");
      expect(item.format.toNumber()).toBe(RequestedFormatFlags.PARTIAL_DATA);
      expect(item.type.toNumber()).toBe(InformationType.CREDENTIAL);
      expect(item.id).toEqual({ attestationId: "123", type: "identity" });
      expect(item.signer).toBe(TEST_IDENTITY_ID_1);
      expect(item.requestedKeys).toEqual(["key1", "key2"]);
    });
  });

  describe("validation", () => {
    test("validates with correct format flags", () => {
      // FULL_DATA
      const fullData = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: {},
        signer: TEST_IDENTITY_ID_1
      });
      expect(fullData.isValid()).toBe(true);
      expect(fullData.isFormatValid()).toBe(true);

      // PARTIAL_DATA
      const partialData = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.PARTIAL_DATA),
        type: new BN(InformationType.CLAIM),
        id: {},
        signer: TEST_IDENTITY_ID_1
      });
      expect(partialData.isValid()).toBe(true);
      expect(partialData.isFormatValid()).toBe(true);

    });

    test("rejects invalid format flags", () => {
      const invalidFormat = createRequestItem({
        version: new BN(1),
        format: new BN(3), // Invalid: not FULL, PARTIAL, or valid combinations
        type: new BN(InformationType.ATTESTATION),
        id: {},
        signer: TEST_IDENTITY_ID_1
      });
      expect(invalidFormat.isValid()).toBe(false);
      expect(invalidFormat.isFormatValid()).toBe(false);
    });

    test("validates information types", () => {
      const validTypes = [
        InformationType.ATTESTATION,
        InformationType.CLAIM,
        InformationType.CREDENTIAL
      ];

      validTypes.forEach(type => {
        const item = createRequestItem({
          version: new BN(1),
          format: new BN(RequestedFormatFlags.FULL_DATA),
          type: new BN(type),
          id: {},
          signer: TEST_IDENTITY_ID_1
        });
        expect(item.isValid()).toBe(true);
      });

      // Invalid type
      const invalidType = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(99), // Invalid type
        id: {},
        signer: TEST_IDENTITY_ID_1
      });
      expect(invalidType.isValid()).toBe(false);
    });

    test("validates version range", () => {
      // Valid version
      const validVersion = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: {},
        signer: TEST_IDENTITY_ID_1
      });
      expect(validVersion.isValid()).toBe(true);

      // Invalid version (too low)
      const lowVersion = createRequestItem({
        version: new BN(0),
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(InformationType.ATTESTATION),  
        id: {},
        signer: TEST_IDENTITY_ID_1
      });
      expect(lowVersion.isValid()).toBe(false);

      // Invalid version (too high)
      const highVersion = createRequestItem({
        version: new BN(99),
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: {},
        signer: TEST_IDENTITY_ID_1
      });
      expect(highVersion.isValid()).toBe(false);
    });
  });

  describe("serialization", () => {
    test("roundtrip serialization", () => {
      const original = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.PARTIAL_DATA),
        type: new BN(InformationType.CREDENTIAL),
        id: { attestationId: "abc123", type: "identity", scope: "personal" },
        signer: TEST_IDENTITY_ID_1,
        requestedKeys: ["name", "email", "birthdate"]
      });

      const buffer = original.toBuffer();
      const deserialized = new RequestItem();
      deserialized.fromBuffer(buffer);

      expect(deserialized.version.toString()).toBe(original.version.toString());
      expect(deserialized.format.toString()).toBe(original.format.toString());
      expect(deserialized.type.toString()).toBe(original.type.toString());
      expect(deserialized.id).toEqual(original.id);
      expect(deserialized.signer).toBe(original.signer);
      expect(deserialized.requestedKeys).toEqual(original.requestedKeys);
    });

    test("roundtrip JSON serialization", () => {
      const original = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.FULL_DATA | RequestedFormatFlags.COLLECTION),
        type: new BN(InformationType.CLAIM),
        id: { claimId: "xyz789" },
        signer: TEST_IDENTITY_ID_1,
        requestedKeys: ["verified", "timestamp"]
      });

      const json = original.toJSON();
      const fromJson = new RequestItem();
      fromJson.fromJSON(json);

      expect(fromJson.version.toString()).toBe(original.version.toString());
      expect(fromJson.format.toString()).toBe(original.format.toString());
      expect(fromJson.type.toString()).toBe(original.type.toString());
      expect(fromJson.id).toEqual(original.id);
      expect(fromJson.signer).toBe(original.signer);
      expect(fromJson.requestedKeys).toEqual(original.requestedKeys);
    });

    test("handles empty requestedKeys", () => {
      const item = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: { id: "test" },
        signer: TEST_IDENTITY_ID_1,
        requestedKeys: []
      });

      const buffer = item.toBuffer();
      const deserialized = new RequestItem();
      deserialized.fromBuffer(buffer);

      expect(deserialized.requestedKeys).toEqual([]);
    });

    test("handles undefined requestedKeys", () => {
      const item = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: { id: "test" },
        signer: TEST_IDENTITY_ID_1
        // requestedKeys is undefined
      });

      const buffer = item.toBuffer();
      const deserialized = new RequestItem();
      deserialized.fromBuffer(buffer);

      expect(deserialized.requestedKeys).toEqual([]);
    });
  });

  describe("edge cases", () => {
    test("handles complex id objects", () => {
      const complexId = {
        primary: "main-id",
        secondary: "backup-id", 
        metadata: "serialized-metadata"
      };

      const item = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(InformationType.CREDENTIAL),
        id: complexId,
        signer: TEST_IDENTITY_ID_1
      });

      const buffer = item.toBuffer();
      const deserialized = new RequestItem();
      deserialized.fromBuffer(buffer);

      expect(deserialized.id).toEqual(complexId);
    });

    test("handles empty id object", () => {
      const item = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.PARTIAL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: {},
        signer: TEST_IDENTITY_ID_1
      });

      const buffer = item.toBuffer();
      const deserialized = new RequestItem();
      deserialized.fromBuffer(buffer);

      expect(deserialized.id).toEqual({});
    });

    test("calculates byte length correctly", () => {
      const item = createRequestItem({
        version: new BN(1),
        format: new BN(RequestedFormatFlags.PARTIAL_DATA),
        type: new BN(InformationType.CREDENTIAL),
        id: { test: "value" },
        signer: TEST_IDENTITY_ID_1,
        requestedKeys: ["key1", "key2"]
      });

      const expectedLength = item.getByteLength();
      const actualBuffer = item.toBuffer();

      expect(actualBuffer.length).toBe(expectedLength);
    });
  });

  describe("real-world examples", () => {
    const VALU_SIGNER = "i8mq7inkLvNRwYQNTtt3uaaJCs5YkKxjGg"; 
    const VALU_ATTESTATION_NAME = "Testname";

    test("certification request with partial data", () => {
      const certificationRequest = createRequestItem({
        format: new BN(RequestedFormatFlags.PARTIAL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: { [ATTESTATION_NAME.vdxfid]: VALU_ATTESTATION_NAME }, // "vrsc::attestation.name" : name
        signer: VALU_SIGNER,
        requestedKeys: [IDENTITY_FIRSTNAME.vdxfid, IDENTITY_DATEOFBIRTH.vdxfid]
      });

      expect(certificationRequest.format.toNumber()).toBe(RequestedFormatFlags.PARTIAL_DATA);
      expect(certificationRequest.type.toNumber()).toBe(InformationType.ATTESTATION);
      expect(certificationRequest.id[ATTESTATION_NAME.vdxfid]).toBe(VALU_ATTESTATION_NAME);
      expect(certificationRequest.signer).toBe(VALU_SIGNER);
      expect(certificationRequest.requestedKeys).toContain(IDENTITY_FIRSTNAME.vdxfid);
      expect(certificationRequest.requestedKeys).toContain(IDENTITY_DATEOFBIRTH.vdxfid);
      expect(certificationRequest.isValid()).toBe(true);

      // Test serialization roundtrip
      const buffer = certificationRequest.toBuffer();
      const deserialized = new RequestItem();
      deserialized.fromBuffer(buffer);

      expect(deserialized.format.toNumber()).toBe(certificationRequest.format.toNumber());
      expect(deserialized.type.toNumber()).toBe(certificationRequest.type.toNumber());
      expect(deserialized.id).toEqual(certificationRequest.id);
      expect(deserialized.signer).toBe(certificationRequest.signer);
      expect(deserialized.requestedKeys).toEqual(certificationRequest.requestedKeys);
    });

    test("certification request with full data", () => {
      const certificationRequest1 = createRequestItem({
        format: new BN(RequestedFormatFlags.FULL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: { [ATTESTATION_NAME.vdxfid]: VALU_ATTESTATION_NAME }, // "vrsc::attestation.name" : name
        signer: VALU_SIGNER,
      });

      expect(certificationRequest1.format.toNumber()).toBe(RequestedFormatFlags.FULL_DATA);
      expect(certificationRequest1.type.toNumber()).toBe(InformationType.ATTESTATION);
      expect(certificationRequest1.id[ATTESTATION_NAME.vdxfid]).toBe(VALU_ATTESTATION_NAME);
      expect(certificationRequest1.signer).toBe(VALU_SIGNER);
      expect(certificationRequest1.requestedKeys).toEqual([]); // Default empty array
      expect(certificationRequest1.isValid()).toBe(true);

      // Test serialization roundtrip
      const buffer = certificationRequest1.toBuffer();
      const deserialized = new RequestItem();
      deserialized.fromBuffer(buffer);

      expect(deserialized.format.toNumber()).toBe(certificationRequest1.format.toNumber());
      expect(deserialized.type.toNumber()).toBe(certificationRequest1.type.toNumber());
      expect(deserialized.id).toEqual(certificationRequest1.id);
      expect(deserialized.signer).toBe(certificationRequest1.signer);
      expect(deserialized.requestedKeys).toEqual(certificationRequest1.requestedKeys);
    });

    test("certification request with collection format", () => {
      const certificationRequest2 = createRequestItem({
        format: new BN(RequestedFormatFlags.COLLECTION),
        type: new BN(InformationType.ATTESTATION),
        id: { 
          [ATTESTATION_NAME.vdxfid]: VALU_ATTESTATION_NAME, 
          "iEpYe4cC73H7i9ay3G8geAjD1tFAhWscvj": "" 
        }, // "vrsc::attestation.name" : name
        signer: VALU_SIGNER,
      });

      expect(certificationRequest2.format.toNumber()).toBe(RequestedFormatFlags.COLLECTION);
      expect(certificationRequest2.type.toNumber()).toBe(InformationType.ATTESTATION);
      expect(certificationRequest2.id[ATTESTATION_NAME.vdxfid]).toBe(VALU_ATTESTATION_NAME);
      expect(certificationRequest2.signer).toBe(VALU_SIGNER);
      expect(certificationRequest2.requestedKeys).toEqual([]); // Default empty array
      expect(certificationRequest2.isValid()).toBe(true);

      // Test serialization roundtrip
      const buffer = certificationRequest2.toBuffer();
      const deserialized = new RequestItem();
      deserialized.fromBuffer(buffer);

      expect(deserialized.format.toNumber()).toBe(certificationRequest2.format.toNumber());
      expect(deserialized.type.toNumber()).toBe(certificationRequest2.type.toNumber());
      expect(deserialized.id).toEqual(certificationRequest2.id);
      expect(deserialized.signer).toBe(certificationRequest2.signer);
      expect(deserialized.requestedKeys).toEqual(certificationRequest2.requestedKeys);
    });

    test("validates VDXF key usage", () => {
      // Test that the VDXF keys have the expected structure
      expect(ATTESTATION_NAME.vdxfid).toBeDefined();
      expect(IDENTITY_FIRSTNAME.vdxfid).toBeDefined();
      expect(IDENTITY_DATEOFBIRTH.vdxfid).toBeDefined();

      // Test that the VDXF keys are strings (hex format)
      expect(typeof ATTESTATION_NAME.vdxfid).toBe('string');
      expect(typeof IDENTITY_FIRSTNAME.vdxfid).toBe('string');
      expect(typeof IDENTITY_DATEOFBIRTH.vdxfid).toBe('string');

      // Test creating a request with mixed VDXF keys and strings
      const mixedRequest = createRequestItem({
        format: new BN(RequestedFormatFlags.PARTIAL_DATA),
        type: new BN(InformationType.ATTESTATION),
        id: { 
          [ATTESTATION_NAME.vdxfid]: VALU_ATTESTATION_NAME,
          "customKey": "customValue"
        },
        signer: VALU_SIGNER,
        requestedKeys: [IDENTITY_FIRSTNAME.vdxfid, "customRequestedKey"]
      });

      expect(mixedRequest.isValid()).toBe(true);
      expect(mixedRequest.id[ATTESTATION_NAME.vdxfid]).toBe(VALU_ATTESTATION_NAME);
      expect(mixedRequest.id["customKey"]).toBe("customValue");
      expect(mixedRequest.requestedKeys).toContain(IDENTITY_FIRSTNAME.vdxfid);
      expect(mixedRequest.requestedKeys).toContain("customRequestedKey");
    });
  });
});
