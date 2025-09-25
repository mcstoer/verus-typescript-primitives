import { RequestItem, RequestInformation, RequestedFormatFlags, InformationType } from "../../vdxf/classes/attestation/InformationRequest";
import { BN } from "bn.js";

describe('Information Request Tests', () => {
  const testAttestationKey = {"iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Valu Proof of Life"};
  const testRequestedKeys = ["iPzSt64gwsqmxcz3Ht7zhMngLC6no6S74K", "i6E3RQUUX3jt8CkizuLX6ihZHTegCmmbj4"];
  const testSigner = "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB";

  describe('RequestItem Tests', () => {
    test('should create RequestItem with default values', () => {
      const requestItem = new RequestItem();

      expect(requestItem.version.toNumber()).toBe(1);
      expect(requestItem.format.toNumber()).toBe(1); // FULL_DATA
      expect(requestItem.type.toNumber()).toBe(1); // ATTESTATION
      expect(requestItem.id).toEqual({});
      expect(requestItem.signer).toBe('');
      expect(requestItem.requestedkeys).toEqual([]);
    });

    test('should create RequestItem with provided values', () => {
      const testItem = new RequestItem();
      testItem.version = new BN(1);
      testItem.format = new BN(RequestedFormatFlags.FULL_DATA);
      testItem.type = new BN(InformationType.ATTESTATION);
      testItem.id = testAttestationKey;
      testItem.signer = testSigner;
      testItem.requestedkeys = testRequestedKeys;

      const requestItem = new RequestItem(testItem);

      expect(requestItem.version.toNumber()).toBe(1);
      expect(requestItem.format.toNumber()).toBe(RequestedFormatFlags.FULL_DATA);
      expect(requestItem.type.toNumber()).toBe(InformationType.ATTESTATION);
      expect(requestItem.id).toEqual(testAttestationKey);
      expect(requestItem.signer).toBe(testSigner);
      expect(requestItem.requestedkeys).toEqual(testRequestedKeys);
    });

    test('should validate format correctly - FULL_DATA', () => {
      const requestItem = new RequestItem();
      requestItem.format = new BN(RequestedFormatFlags.FULL_DATA);

      expect(requestItem.isFormatValid()).toBe(true);
    });

    test('should validate format correctly - PARTIAL_DATA', () => {
      const requestItem = new RequestItem();
      requestItem.format = new BN(RequestedFormatFlags.PARTIAL_DATA);

      expect(requestItem.isFormatValid()).toBe(true);
    });

    test('should validate format correctly - FULL_DATA | COLLECTION (5)', () => {
      const requestItem = new RequestItem();
      requestItem.format = new BN(RequestedFormatFlags.FULL_DATA | RequestedFormatFlags.COLLECTION);

      expect(requestItem.isFormatValid()).toBe(true);
    });

    test('should validate format correctly - PARTIAL_DATA | COLLECTION (6)', () => {
      const requestItem = new RequestItem();
      requestItem.format = new BN(RequestedFormatFlags.PARTIAL_DATA | RequestedFormatFlags.COLLECTION);

      expect(requestItem.isFormatValid()).toBe(true);
    });

    test('should reject invalid format - FULL_DATA | PARTIAL_DATA (3)', () => {
      const requestItem = new RequestItem();
      requestItem.format = new BN(RequestedFormatFlags.FULL_DATA | RequestedFormatFlags.PARTIAL_DATA);

      expect(requestItem.isFormatValid()).toBe(false);
    });

    test('should reject invalid format - random value (7)', () => {
      const requestItem = new RequestItem();
      requestItem.format = new BN(7);

      expect(requestItem.isFormatValid()).toBe(false);
    });

    test('should serialize and deserialize to buffer correctly', () => {
      const requestItem = new RequestItem();
      requestItem.version = new BN(1);
      requestItem.format = new BN(RequestedFormatFlags.PARTIAL_DATA);
      requestItem.type = new BN(InformationType.ATTESTATION);
      requestItem.id = testAttestationKey;
      requestItem.signer = testSigner;
      requestItem.requestedkeys = testRequestedKeys;

      // Serialize to buffer
      const buffer = requestItem.toBuffer();
      expect(buffer).toBeInstanceOf(Buffer);

      // Deserialize from buffer
      const deserializedItem = new RequestItem();
      const bytesRead = deserializedItem.fromBuffer(buffer);

      expect(bytesRead).toBeGreaterThan(0);
      expect(deserializedItem.version.toNumber()).toBe(1);
      expect(deserializedItem.format.toNumber()).toBe(RequestedFormatFlags.PARTIAL_DATA);
      expect(deserializedItem.type.toNumber()).toBe(InformationType.ATTESTATION);
      expect(deserializedItem.id).toEqual(testAttestationKey);
      expect(deserializedItem.signer).toBe(testSigner);
      expect(deserializedItem.requestedkeys).toEqual(testRequestedKeys);
    });

    test('should serialize and deserialize to JSON correctly', () => {
      const requestItem = new RequestItem();
      requestItem.version = new BN(1);
      requestItem.format = new BN(RequestedFormatFlags.FULL_DATA | RequestedFormatFlags.COLLECTION);
      requestItem.type = new BN(InformationType.CREDENTIAL);
      requestItem.id = testAttestationKey;
      requestItem.signer = testSigner;
      requestItem.requestedkeys = testRequestedKeys;

      // Serialize to JSON
      const json = requestItem.toJSON();
      expect(json).toEqual({
        version: 1,
        format: RequestedFormatFlags.FULL_DATA | RequestedFormatFlags.COLLECTION,
        type: InformationType.CREDENTIAL,
        id: testAttestationKey,
        signer: testSigner,
        requestedkeys: testRequestedKeys
      });

      // Deserialize from JSON
      const deserializedItem = new RequestItem();
      deserializedItem.fromJSON(json);

      expect(deserializedItem.version.toNumber()).toBe(1);
      expect(deserializedItem.format.toNumber()).toBe(RequestedFormatFlags.FULL_DATA | RequestedFormatFlags.COLLECTION);
      expect(deserializedItem.type.toNumber()).toBe(InformationType.CREDENTIAL);
      expect(deserializedItem.id).toEqual(testAttestationKey);
      expect(deserializedItem.signer).toBe(testSigner);
      expect(deserializedItem.requestedkeys).toEqual(testRequestedKeys);
    });

    test('should calculate byte length correctly', () => {
      const requestItem = new RequestItem();
      requestItem.version = new BN(1);
      requestItem.format = new BN(RequestedFormatFlags.FULL_DATA);
      requestItem.type = new BN(InformationType.ATTESTATION);
      requestItem.id = testAttestationKey;
      requestItem.signer = testSigner;
      requestItem.requestedkeys = testRequestedKeys;

      const byteLength = requestItem.getByteLength();
      const buffer = requestItem.toBuffer();

      expect(buffer.length).toBe(byteLength);
    });

    test('should handle empty id object', () => {
      const requestItem = new RequestItem();
      requestItem.id = {};
      requestItem.signer = testSigner;

      const buffer = requestItem.toBuffer();
      const deserializedItem = new RequestItem();
      deserializedItem.fromBuffer(buffer);

      expect(deserializedItem.id).toEqual({});
      expect(deserializedItem.signer).toBe(testSigner);
    });

    test('should handle complex id object', () => {
      const complexId = {
        "iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Valu Proof of Life",
        "iAnotherKey123": "Another Value",
        "iThirdKey456": "Third Value"
      };

      const requestItem = new RequestItem();
      requestItem.id = complexId;
      requestItem.signer = testSigner;

      const buffer = requestItem.toBuffer();
      const deserializedItem = new RequestItem();
      deserializedItem.fromBuffer(buffer);

      expect(deserializedItem.id).toEqual(complexId);
      expect(deserializedItem.signer).toBe(testSigner);
    });
  });

  describe('RequestInformation Tests', () => {
    test('should create RequestInformation with items', () => {
      // Create test items
      const item1 = new RequestItem();
      item1.format = new BN(RequestedFormatFlags.FULL_DATA);
      item1.type = new BN(InformationType.ATTESTATION);
      item1.id = testAttestationKey;
      item1.signer = testSigner;
      item1.requestedkeys = testRequestedKeys;

      const item2 = new RequestItem();
      item2.format = new BN(RequestedFormatFlags.PARTIAL_DATA);
      item2.type = new BN(InformationType.CLAIM);
      item2.id = {"iAnotherAttestation": "Another Value"};
      item2.signer = testSigner;
      item2.requestedkeys = ["iSomeOtherKey"];

      const requestInfo = new RequestInformation({
        version: new BN(1),
        items: [item1, item2]
      } as any);

      expect(requestInfo.version.toNumber()).toBe(1);
      expect(requestInfo.items.length).toBe(2);
    });

    test('should serialize and deserialize to JSON correctly', () => {
      const item = new RequestItem();
      item.format = new BN(RequestedFormatFlags.FULL_DATA);
      item.type = new BN(InformationType.ATTESTATION);
      item.id = testAttestationKey;
      item.signer = testSigner;
      item.requestedkeys = testRequestedKeys;

      const requestInfo = new RequestInformation({
        version: new BN(1),
        items: [item]
      } as any);

      // Test toJSON
      const json = requestInfo.toJSON();
      expect(json.version).toBe(1);
      expect(json.items.length).toBe(1);
      expect(json.items[0].id).toEqual(testAttestationKey);
      expect(json.items[0].signer).toBe(testSigner);
      expect(json.items[0].requestedkeys).toEqual(testRequestedKeys);

      // Test fromJSON
      const newRequestInfo = new RequestInformation({} as any);
      newRequestInfo.fromJSON(json);

      expect(newRequestInfo.version.toNumber()).toBe(1);
      expect(newRequestInfo.items.length).toBe(1);
      expect(newRequestInfo.items[0].id).toEqual(testAttestationKey);
      expect(newRequestInfo.items[0].signer).toBe(testSigner);
      expect(newRequestInfo.items[0].requestedkeys).toEqual(testRequestedKeys);
    });

    test('should serialize and deserialize to buffer correctly', () => {
      const item1 = new RequestItem();
      item1.format = new BN(RequestedFormatFlags.FULL_DATA);
      item1.type = new BN(InformationType.ATTESTATION);
      item1.id = testAttestationKey;
      item1.signer = testSigner;
      item1.requestedkeys = testRequestedKeys;

      const item2 = new RequestItem();
      item2.format = new BN(RequestedFormatFlags.PARTIAL_DATA | RequestedFormatFlags.COLLECTION);
      item2.type = new BN(InformationType.CREDENTIAL);
      item2.id = {"iSecondAttestation": "Second Value"};
      item2.signer = "iAnotherSigner123";
      item2.requestedkeys = ["iOneMoreKey"];

      const requestInfo = new RequestInformation({
        version: new BN(1),
        items: [item1, item2]
      } as any);

      // Serialize to buffer
      const buffer = requestInfo.toBuffer();
      expect(buffer).toBeInstanceOf(Buffer);

      // Deserialize from buffer
      const deserializedInfo = new RequestInformation({} as any);
      const bytesRead = deserializedInfo.fromBuffer(buffer);

      expect(bytesRead).toBeGreaterThan(0);
      expect(deserializedInfo.version.toNumber()).toBe(1);
      expect(deserializedInfo.items.length).toBe(2);
      
      // Verify first item
      expect(deserializedInfo.items[0].format.toNumber()).toBe(RequestedFormatFlags.FULL_DATA);
      expect(deserializedInfo.items[0].type.toNumber()).toBe(InformationType.ATTESTATION);
      expect(deserializedInfo.items[0].id).toEqual(testAttestationKey);
      expect(deserializedInfo.items[0].signer).toBe(testSigner);
      expect(deserializedInfo.items[0].requestedkeys).toEqual(testRequestedKeys);

      // Verify second item
      expect(deserializedInfo.items[1].format.toNumber()).toBe(RequestedFormatFlags.PARTIAL_DATA | RequestedFormatFlags.COLLECTION);
      expect(deserializedInfo.items[1].type.toNumber()).toBe(InformationType.CREDENTIAL);
      expect(deserializedInfo.items[1].id).toEqual({"iSecondAttestation": "Second Value"});
      expect(deserializedInfo.items[1].signer).toBe("iAnotherSigner123");
      expect(deserializedInfo.items[1].requestedkeys).toEqual(["iOneMoreKey"]);
    });

    test('should validate correctly with valid items', () => {
      const item = new RequestItem();
      item.format = new BN(RequestedFormatFlags.FULL_DATA);
      item.type = new BN(InformationType.ATTESTATION);
      item.id = testAttestationKey;
      item.signer = testSigner;

      const requestInfo = new RequestInformation({
        version: new BN(1),
        items: [item]
      } as any);

      expect(requestInfo.isValid()).toBe(true);
    });

    test('should calculate byte length correctly', () => {
      const item = new RequestItem();
      item.format = new BN(RequestedFormatFlags.FULL_DATA);
      item.type = new BN(InformationType.ATTESTATION);
      item.id = testAttestationKey;
      item.signer = testSigner;
      item.requestedkeys = testRequestedKeys;

      const requestInfo = new RequestInformation({
        version: new BN(1),
        items: [item]
      } as any);

      const byteLength = requestInfo.getByteLength();
      const buffer = requestInfo.toBuffer();

      expect(buffer.length).toBe(byteLength);
    });
  });

  describe('Round-trip Tests', () => {
    test('should maintain data integrity through multiple serialization formats', () => {
      // Create original request item
      const originalItem = new RequestItem();
      originalItem.version = new BN(1);
      originalItem.format = new BN(RequestedFormatFlags.PARTIAL_DATA | RequestedFormatFlags.COLLECTION);
      originalItem.type = new BN(InformationType.CREDENTIAL);
      originalItem.id = testAttestationKey;
      originalItem.signer = testSigner;
      originalItem.requestedkeys = testRequestedKeys;

      // JSON round-trip
      const json = originalItem.toJSON();
      const fromJsonItem = new RequestItem();
      fromJsonItem.fromJSON(json);

      // Buffer round-trip from JSON-restored item
      const buffer = fromJsonItem.toBuffer();
      const fromBufferItem = new RequestItem();
      fromBufferItem.fromBuffer(buffer);

      // Verify all data is preserved
      expect(fromBufferItem.version.toNumber()).toBe(originalItem.version.toNumber());
      expect(fromBufferItem.format.toNumber()).toBe(originalItem.format.toNumber());
      expect(fromBufferItem.type.toNumber()).toBe(originalItem.type.toNumber());
      expect(fromBufferItem.id).toEqual(originalItem.id);
      expect(fromBufferItem.signer).toBe(originalItem.signer);
      expect(fromBufferItem.requestedkeys).toEqual(originalItem.requestedkeys);
    });

    test('should handle buffer round-trip with hex string', () => {
      const requestItem = new RequestItem();
      requestItem.version = new BN(1);
      requestItem.format = new BN(RequestedFormatFlags.FULL_DATA);
      requestItem.type = new BN(InformationType.ATTESTATION);
      requestItem.id = testAttestationKey;
      requestItem.signer = testSigner;
      requestItem.requestedkeys = testRequestedKeys;

      // Serialize to buffer and convert to hex
      const buffer = requestItem.toBuffer();
      const hexString = buffer.toString('hex');

      // Reconstruct from hex and verify
      const reconstructedBuffer = Buffer.from(hexString, 'hex');
      const reconstructedItem = new RequestItem();
      reconstructedItem.fromBuffer(reconstructedBuffer);

      expect(reconstructedItem.id).toEqual(testAttestationKey);
      expect(reconstructedItem.signer).toBe(testSigner);
      expect(reconstructedItem.requestedkeys).toEqual(testRequestedKeys);
      expect(reconstructedItem.format.toNumber()).toBe(RequestedFormatFlags.FULL_DATA);
      expect(reconstructedItem.type.toNumber()).toBe(InformationType.ATTESTATION);
    });

    test('should deserialize from known hex string - RequestItem with test data', () => {
      // Create original item with test data
      const originalItem = new RequestItem();
      originalItem.version = new BN(1);
      originalItem.format = new BN(RequestedFormatFlags.PARTIAL_DATA | RequestedFormatFlags.COLLECTION); // 6
      originalItem.type = new BN(InformationType.CREDENTIAL); // 3
      originalItem.id = testAttestationKey;
      originalItem.signer = testSigner;
      originalItem.requestedkeys = testRequestedKeys;

      // Generate the hex string
      const originalBuffer = originalItem.toBuffer();
      const hexString = originalBuffer.toString('hex');
      
      // Deserialize from the hex string
      const buffer = Buffer.from(hexString, 'hex');
      const deserializedItem = new RequestItem();
      deserializedItem.fromBuffer(buffer);

      // Verify all fields match exactly
      expect(deserializedItem.version.toNumber()).toBe(1);
      expect(deserializedItem.format.toNumber()).toBe(6); // PARTIAL_DATA | COLLECTION
      expect(deserializedItem.type.toNumber()).toBe(3); // CREDENTIAL
      expect(deserializedItem.id).toEqual(testAttestationKey);
      expect(deserializedItem.signer).toBe(testSigner);
      expect(deserializedItem.requestedkeys).toEqual(testRequestedKeys);

      // Verify round-trip integrity - serialize again and compare
      const reserializedBuffer = deserializedItem.toBuffer();
      expect(reserializedBuffer.toString('hex')).toBe(hexString);
    });

    test('should deserialize from known hex string - RequestInformation with multiple items', () => {
      // Create first item
      const item1 = new RequestItem();
      item1.version = new BN(1);
      item1.format = new BN(RequestedFormatFlags.FULL_DATA);
      item1.type = new BN(InformationType.ATTESTATION);
      item1.id = testAttestationKey;
      item1.signer = testSigner;
      item1.requestedkeys = testRequestedKeys;

      // Create second item with different data
      const item2 = new RequestItem();
      item2.version = new BN(1);
      item2.format = new BN(RequestedFormatFlags.PARTIAL_DATA);
      item2.type = new BN(InformationType.CLAIM);
      item2.id = {"iSecondKey": "Second Value", "iThirdKey": "Third Value"};
      item2.signer = "iAnotherSigner123456789";
      item2.requestedkeys = ["iKey1", "iKey2", "iKey3"];

      // Create RequestInformation
      const originalInfo = new RequestInformation({
        version: new BN(1),
        items: [item1, item2]
      } as any);

      // Generate hex string
      const originalBuffer = originalInfo.toBuffer();
      const hexString = originalBuffer.toString('hex');
      
      // Deserialize from hex string
      const buffer = Buffer.from(hexString, 'hex');
      const deserializedInfo = new RequestInformation({} as any);
      deserializedInfo.fromBuffer(buffer);

      // Verify structure
      expect(deserializedInfo.version.toNumber()).toBe(1);
      expect(deserializedInfo.items.length).toBe(2);

      // Verify first item
      const firstItem = deserializedInfo.items[0];
      expect(firstItem.version.toNumber()).toBe(1);
      expect(firstItem.format.toNumber()).toBe(RequestedFormatFlags.FULL_DATA);
      expect(firstItem.type.toNumber()).toBe(InformationType.ATTESTATION);
      expect(firstItem.id).toEqual(testAttestationKey);
      expect(firstItem.signer).toBe(testSigner);
      expect(firstItem.requestedkeys).toEqual(testRequestedKeys);

      // Verify second item
      const secondItem = deserializedInfo.items[1];
      expect(secondItem.version.toNumber()).toBe(1);
      expect(secondItem.format.toNumber()).toBe(RequestedFormatFlags.PARTIAL_DATA);
      expect(secondItem.type.toNumber()).toBe(InformationType.CLAIM);
      expect(secondItem.id).toEqual({"iSecondKey": "Second Value", "iThirdKey": "Third Value"});
      expect(secondItem.signer).toBe("iAnotherSigner123456789");
      expect(secondItem.requestedkeys).toEqual(["iKey1", "iKey2", "iKey3"]);

      // Verify round-trip integrity
      const reserializedBuffer = deserializedInfo.toBuffer();
      expect(reserializedBuffer.toString('hex')).toBe(hexString);
    });

    test('should handle edge cases in hex deserialization', () => {
      // Test with minimal data
      const minimalItem = new RequestItem();
      minimalItem.version = new BN(1);
      minimalItem.format = new BN(RequestedFormatFlags.FULL_DATA);
      minimalItem.type = new BN(InformationType.ATTESTATION);
      minimalItem.id = {};
      minimalItem.signer = "";
      minimalItem.requestedkeys = [];

      const minimalBuffer = minimalItem.toBuffer();
      const minimalHex = minimalBuffer.toString('hex');
      
      // Deserialize minimal case
      const deserializedMinimal = new RequestItem();
      deserializedMinimal.fromBuffer(Buffer.from(minimalHex, 'hex'));

      expect(deserializedMinimal.version.toNumber()).toBe(1);
      expect(deserializedMinimal.format.toNumber()).toBe(RequestedFormatFlags.FULL_DATA);
      expect(deserializedMinimal.type.toNumber()).toBe(InformationType.ATTESTATION);
      expect(deserializedMinimal.id).toEqual({});
      expect(deserializedMinimal.signer).toBe("");
      expect(deserializedMinimal.requestedkeys).toEqual([]);

      // Verify round-trip
      const reserializedMinimal = deserializedMinimal.toBuffer();
      expect(reserializedMinimal.toString('hex')).toBe(minimalHex);
    });

    test('should deserialize from hardcoded hex string with test data', () => {
      // This hex string represents a RequestItem with:
      // - version: 1, format: 6 (PARTIAL_DATA | COLLECTION), type: 3 (CREDENTIAL)
      // - id: {"iEEjVkvM9Niz4u2WCr6QQzx1zpVSvDFub1": "Valu Proof of Life"}
      // - signer: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB"
      // - requestedkeys: ["iPzSt64gwsqmxcz3Ht7zhMngLC6no6S74K", "i6E3RQUUX3jt8CkizuLX6ihZHTegCmmbj4"]
      const knownHexString = "0106033b7b226945456a566b764d394e697a3475325743723651517a78317a705653764446756231223a2256616c752050726f6f66206f66204c696665227d22694b6a725443776f5046526b3434664169326e594e62504731365a55516a76314e42022269507a53743634677773716d78637a334874377a684d6e674c43366e6f365337344b22693645335251555558336a7438436b697a754c583669685a48546567436d6d626a34";

      // Deserialize from known hex string
      const buffer = Buffer.from(knownHexString, 'hex');
      const deserializedItem = new RequestItem();
      deserializedItem.fromBuffer(buffer);

      // Verify all expected values
      expect(deserializedItem.version.toNumber()).toBe(1);
      expect(deserializedItem.format.toNumber()).toBe(6); // PARTIAL_DATA | COLLECTION
      expect(deserializedItem.type.toNumber()).toBe(3); // CREDENTIAL
      expect(deserializedItem.id).toEqual(testAttestationKey);
      expect(deserializedItem.signer).toBe(testSigner);
      expect(deserializedItem.requestedkeys).toEqual(testRequestedKeys);

      // Verify format validation passes
      expect(deserializedItem.isFormatValid()).toBe(true);

      // Verify we can serialize back to the same hex string
      const reserializedBuffer = deserializedItem.toBuffer();
      expect(reserializedBuffer.toString('hex')).toBe(knownHexString);

      // Verify JSON output
      const json = deserializedItem.toJSON();
      expect(json).toEqual({
        version: 1,
        format: 6,
        type: 3,
        id: testAttestationKey,
        signer: testSigner,
        requestedkeys: testRequestedKeys
      });
    });
  });
});
