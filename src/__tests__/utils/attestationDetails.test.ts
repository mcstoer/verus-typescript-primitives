import { AttestationDetails } from "../../vdxf/classes/attestation/AttestationDetails";

describe('AttestationDetails tests', () => {
  test('toBuffer and fromBuffer test with real data', () => {
    const testData = {
      "mmrdescriptor": {
        "version": 1,
        "objecthashtype": 5,
        "mmrhashtype": 1,
        "mmrroot": {
          "version": 1,
          "flags": 0,
          "objectdata": "da513b88a56ef93a55cfd7e8f49e1143fd26a2e6095a67fc0d368327d8e3d3df"
        },
        "mmrhashes": {
          "version": 1,
          "flags": 0,
          "objectdata": "41d826d3c6cbbc3a96992670d2f604e959fd1a8c014102c78ee8fa7c01db81cbf60181fc9baa101aa8c07d40c324d771145699168d3b18867a587f139173cf8b961d581fe15bbf15f5d02813a615e54c050d2b6b1cd4ee"
        },
        "datadescriptors": [
          {
            "version": 1,
            "flags": 2,
            "objectdata": {
              "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
                "version": 1,
                "flags": 96,
                "mimetype": "text/plain",
                "objectdata": {
                  "message": "John"
                },
                "label": "i4GqsotHGa4czCdtg2d8FVHKfJFzVyBPrM"
              }
            },
            "salt": "06e9b0454f1fddf23353a8c411bdbbb266738dca1d647e03040bffe1bddacf74"
          },
          {
            "version": 1,
            "flags": 2,
            "objectdata": {
              "i4GC1YGEVD21afWudGoFJVdnfjJ5XWnCQv": {
                "version": 1,
                "flags": 96,
                "mimetype": "text/plain",
                "objectdata": {
                  "message": "Doe"
                },
                "label": "iHybTrNB1kXRrjsCtJXd6fvBKxepqMpS5Z"
              }
            },
            "salt": "d32fac398866a7331acd678fd48412f173f71e381f1c1d6efff253a6b29b4d5b"
          }
        ]
      },
      "signaturedata": {
        "version": 1,
        "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "hashtype": 1,
        "signaturehash": "dfd3e3d82783360dfc675a09e6a226fd43119ef4e8d7cf553af96ea5883b51da",
        "identityid": "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        "signaturetype": 1,
        "signature": "AgXOCgAAAUEfCiSukK9tg46cYOpHmxzKjNquWDyNc8H58+uLSOYmqlUcNUxWB8j3nzT1RHKeJGygdAwrUj5iZ/A9H3+qYV9H9g=="
      }
    };

    // Create AttestationDetails from the node response
    const attestationDetails = AttestationDetails.fromNodeResponse(testData);

    // Convert to buffer
    const buffer = attestationDetails.toBuffer();
    
    // Convert buffer to hex string for comparison
    const bufferHex = buffer.toString('hex');
    
    // Test that we can deserialize back to the same object
    const deserializedAttestation = new AttestationDetails();
    deserializedAttestation.fromBuffer(buffer);

    // Verify the deserialized object matches the original
    expect(deserializedAttestation.version.toNumber()).toBe(attestationDetails.version.toNumber());
    expect(deserializedAttestation.flags.toNumber()).toBe(attestationDetails.flags.toNumber());
    expect(deserializedAttestation.attestations.length).toBe(1);
    
    // Verify MMR descriptor data
    const originalMmr = attestationDetails.attestations[0].mmrDescriptor;
    const deserializedMmr = deserializedAttestation.attestations[0].mmrDescriptor;
    
    expect(deserializedMmr.version.toNumber()).toBe(originalMmr.version.toNumber());
    expect(deserializedMmr.objectHashType).toBe(originalMmr.objectHashType);
    expect(deserializedMmr.mmrHashType).toBe(originalMmr.mmrHashType);
    
    // Verify signature data
    const originalSig = attestationDetails.attestations[0].signatureData;
    const deserializedSig = deserializedAttestation.attestations[0].signatureData;
    
    expect(deserializedSig.version.toNumber()).toBe(originalSig.version.toNumber());
    expect(deserializedSig.system_ID).toBe(originalSig.system_ID);
    expect(deserializedSig.hash_type.toNumber()).toBe(originalSig.hash_type.toNumber());
    expect(deserializedSig.identity_ID).toBe(originalSig.identity_ID);
    expect(deserializedSig.sig_type.toNumber()).toBe(originalSig.sig_type.toNumber());
    
    // Test JSON round-trip
    const json = attestationDetails.toJson();
    const fromJson = AttestationDetails.fromJson(json);
    const fromJsonBuffer = fromJson.toBuffer();
    
    expect(fromJsonBuffer.toString('hex')).toBe(bufferHex);
  });

  test('fromBuffer with known hex data', () => {
    // This is the actual hex string generated from the test data above
    const expectedHex = "0001010501010020da513b88a56ef93a55cfd7e8f49e1143fd26a2e6095a67fc0d368327d8e3d3df01005741d826d3c6cbbc3a96992670d2f604e959fd1a8c014102c78ee8fa7c01db81cbf60181fc9baa101aa8c07d40c324d771145699168d3b18867a587f139173cf8b961d581fe15bbf15f5d02813a615e54c050d2b6b1cd4ee0201024b08a2ebb2c55f83a8e2a426a53320ed4d42124f4d01350160044a6f686e2269344771736f7448476134637a436474673264384656484b664a467a56794250724d0a746578742f706c61696e2006e9b0454f1fddf23353a8c411bdbbb266738dca1d647e03040bffe1bddacf7401024a08a2ebb2c55f83a8e2a426a53320ed4d42124f4d0134016003446f65226948796254724e42316b5852726a7343744a5864366676424b786570714d7053355a0a746578742f706c61696e20d32fac398866a7331acd678fd48412f173f71e381f1c1d6efff253a6b29b4d5b01a6ef9ea235635e328124ff3429db9f9e91b64e2d0120da513b88a56ef93a55cfd7e8f49e1143fd26a2e6095a67fc0d368327d8e3d3dfb26820ee0c9b1276aac834cf457026a575dfce8401000000490205ce0a000001411f0a24ae90af6d838e9c60ea479b1cca8cdaae583c8d73c1f9f3eb8b48e626aa551c354c5607c8f79f34f544729e246ca0740c2b523e6267f03d1f7faa615f47f6";
    
    // Create AttestationDetails from the hex buffer
    const buffer = Buffer.from(expectedHex, 'hex');
    const attestationDetails = new AttestationDetails();
    attestationDetails.fromBuffer(buffer);

    // Verify basic structure
    expect(attestationDetails.flags.toNumber()).toBe(0);
    expect(attestationDetails.attestations.length).toBe(1);

    // Convert back to JSON and verify data
    const json = attestationDetails.toJson();
    expect(json.version).toBe(1);
    expect(json.attestations.length).toBe(1);
    
    const mmrJson = json.attestations[0].mmrdescriptor;
    expect(mmrJson.version).toBe(1);
    expect(mmrJson.objecthashtype).toBe(5);
    expect(mmrJson.mmrhashtype).toBe(1);
    
    const sigJson = json.attestations[0].signaturedata;
    expect(sigJson.version).toBe(1);
    expect(sigJson.systemid).toBe("iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq");
    expect(sigJson.hashtype).toBe(1);
    expect(sigJson.identityid).toBe("iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB");
    expect(sigJson.signaturetype).toBe(1);

    // Test round-trip: buffer -> object -> buffer should match
    const newBuffer = attestationDetails.toBuffer();
    expect(newBuffer.toString('hex')).toBe(expectedHex);
  });

  test('addAttestation functionality', () => {
    const testData = {
      "mmrdescriptor": {
        "version": 1,
        "objecthashtype": 5,
        "mmrhashtype": 1,
        "mmrroot": {
          "version": 1,
          "flags": 0,
          "objectdata": "da513b88a56ef93a55cfd7e8f49e1143fd26a2e6095a67fc0d368327d8e3d3df"
        },
        "mmrhashes": {
          "version": 1,
          "flags": 0,
          "objectdata": "41d826d3c6cbbc3a96992670d2f604e959fd1a8c014102c78ee8fa7c01db81cbf60181fc9baa101aa8c07d40c324d771145699168d3b18867a587f139173cf8b961d581fe15bbf15f5d02813a615e54c050d2b6b1cd4ee"
        },
        "datadescriptors": []
      },
      "signaturedata": {
        "version": 1,
        "systemid": "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        "hashtype": 1,
        "signaturehash": "dfd3e3d82783360dfc675a09e6a226fd43119ef4e8d7cf553af96ea5883b51da",
        "identityid": "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        "signaturetype": 1,
        "signature": "AgXOCgAAAUEfCiSukK9tg46cYOpHmxzKjNquWDyNc8H58+uLSOYmqlUcNUxWB8j3nzT1RHKeJGygdAwrUj5iZ/A9H3+qYV9H9g=="
      }
    };

    // Create initial AttestationDetails
    const attestationDetails = AttestationDetails.fromNodeResponse(testData, {
      label: "Test Attestation",
      id: "test-001",
      timestamp: 1640995200000 // Jan 1, 2022
    });

    // Verify initial state
    expect(attestationDetails.hasLabel()).toBe(true);
    expect(attestationDetails.hasId()).toBe(true);
    expect(attestationDetails.hasTimestamp()).toBe(true);
    expect(attestationDetails.label).toBe("Test Attestation");
    expect(attestationDetails.id).toBe("test-001");
    expect(attestationDetails.getAttestationCount()).toBe(1);

    // Add another attestation
    attestationDetails.addAttestation(testData);
    expect(attestationDetails.getAttestationCount()).toBe(2);

    // Test buffer serialization with metadata
    const buffer = attestationDetails.toBuffer();
    const deserializedAttestation = new AttestationDetails();
    deserializedAttestation.fromBuffer(buffer);

    expect(deserializedAttestation.hasLabel()).toBe(true);
    expect(deserializedAttestation.hasId()).toBe(true);
    expect(deserializedAttestation.hasTimestamp()).toBe(true);
    expect(deserializedAttestation.label).toBe("Test Attestation");
    expect(deserializedAttestation.id).toBe("test-001");
    expect(deserializedAttestation.getAttestationCount()).toBe(2);
  });
});
