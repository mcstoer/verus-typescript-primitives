import { BN } from "bn.js";
import { 
  LoginRequestDetails, 
  CallbackUriType, 
  LoginRequestDetailsInterface, 
  LoginPermissionType 
} from "../../vdxf/classes/requestobjects/LoginRequestDetails";

// Test constants with valid addresses from the codebase
const TEST_CHALLENGE_ID = "iMdf3BJ1mEtKMAJqNg8hj5fMnCUCc3bpFN";
const TEST_IDENTITY_ID_1 = "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW"; 
const TEST_IDENTITY_ID_2 = "i84T3MWcb6zWcwgNZoU3TXtrUn9EqM84A4";
const TEST_IDENTITY_ID_3 = "iJ5LnijKvp1wkL4hB3EsJ5kjcE4T8VL4hD";

const SERIALIZED_LOGIN_REQUEST_DETAILS = Buffer.from("c72c5b342995a2186f96271e91686c5e942d13e10303012a5fc0e9dedf4f1e8351fe652a140e9dd38fa5a902324afad29f51859c54050db854d2c9bb52acd9bd03a0276f355ad37d8e5d2d10f16c1d051b6f6ead62011c68747470733a2f2f6578616d706c652e636f6d2f63616c6c6261636b", 'hex'); // Replace with actual serialized data


describe("LoginRequestDetails", () => {
  describe("constructor and basic properties", () => {
    test("creates instance with minimal required data", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID
      });

      expect(details.challengeId).toBe(TEST_CHALLENGE_ID);
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("0");
      expect(details.permissions).toBeNull();
      expect(details.callbackUri).toBeNull();
    });

    test("creates instance with all optional data", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 },
          { type: LoginPermissionType.REQUIRED_SYSTEM, identityid: TEST_IDENTITY_ID_2 },
          { type: LoginPermissionType.REQUIRED_PARENT, identityid: TEST_IDENTITY_ID_3 }
        ],
        callbackUri: {
          type: CallbackUriType.TYPE_WEBHOOK,
          uri: "https://example.com/callback"
        }
      });
    
      // Need to manually call setFlags as constructor doesn't call it automatically
      details.setFlags();

      expect(details.toBuffer().toString('hex')).toBe(SERIALIZED_LOGIN_REQUEST_DETAILS.toString('hex'));
      expect(details.challengeId).toBe(TEST_CHALLENGE_ID);
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("3"); // Both flags set (1 + 2)
      expect(details.permissions).toHaveLength(3);
      expect(details.callbackUri).toEqual({
        type: CallbackUriType.TYPE_WEBHOOK,
        uri: "https://example.com/callback"
      });
    });

    test("creates instance with default constructor", () => {
      const details = new LoginRequestDetails();

      expect(details.challengeId).toBe("");
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("0");
      expect(details.permissions).toBeNull();
      expect(details.callbackUri).toBeNull();
    });
  });

  describe("flag management", () => {
    test("sets permissions flag when permissions are provided", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 }
        ]
      });

      details.setFlags();
      const hasPermissionsFlag = details.flags?.and(LoginRequestDetails.FLAG_HAS_PERMISSIONS);
      expect(hasPermissionsFlag?.eq(LoginRequestDetails.FLAG_HAS_PERMISSIONS)).toBe(true);
    });

    test("sets callback URI flag when callback URI is provided", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        callbackUri: {
          type: CallbackUriType.TYPE_REDIRECT,
          uri: "https://app.example.com/login"
        }
      });

      details.setFlags();
      const hasCallbackFlag = details.flags?.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
      expect(hasCallbackFlag?.eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI)).toBe(true);
    });

    test("sets multiple flags when multiple optional data is provided", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_PARENT, identityid: TEST_IDENTITY_ID_3 }
        ],
        callbackUri: {
          type: CallbackUriType.TYPE_DEEPLINK,
          uri: "myapp://callback"
        }
      });

      details.setFlags();
      const hasPermissionsFlag = details.flags?.and(LoginRequestDetails.FLAG_HAS_PERMISSIONS);
      const hasCallbackFlag = details.flags?.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
      
      expect(hasPermissionsFlag?.eq(LoginRequestDetails.FLAG_HAS_PERMISSIONS)).toBe(true);
      expect(hasCallbackFlag?.eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI)).toBe(true);
    });

    test("does not set flags when optional data is not provided", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID
      });

      details.setFlags();
      expect(details.flags?.toString()).toBe("0");
    });
  });

  describe("validation", () => {
    test("validates with valid challenge ID", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID
      });

      expect(details.isValid()).toBe(true);
    });

    test("validates with all data provided", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 },
        ],
        callbackUri: {
          type: CallbackUriType.TYPE_OAUTH2,
          uri: "https://oauth.example.com/callback"
        }
      });

      expect(details.isValid()).toBe(true);
    });

    test("rejects empty challenge ID", () => {
      const details = new LoginRequestDetails({
        challengeId: ""
      });

      expect(details.isValid()).toBe(false);
    });

    test("rejects invalid challenge ID format", () => {
      const details = new LoginRequestDetails({
        challengeId: "invalid-challenge-id"
      });

      expect(details.isValid()).toBe(false);
    });
  });

  describe("callback URI types", () => {
    test("handles webhook callback", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        callbackUri: {
          type: CallbackUriType.TYPE_WEBHOOK,
          uri: "https://api.example.com/webhook"
        }
      });

      expect(details.callbackUri?.type).toBe(CallbackUriType.TYPE_WEBHOOK);
      expect(details.callbackUri?.uri).toBe("https://api.example.com/webhook");
    });

    test("handles redirect callback", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        callbackUri: {
          type: CallbackUriType.TYPE_REDIRECT,
          uri: "https://app.example.com/login/success"
        }
      });

      expect(details.callbackUri?.type).toBe(CallbackUriType.TYPE_REDIRECT);
      expect(details.callbackUri?.uri).toBe("https://app.example.com/login/success");
    });

    test("handles deeplink callback", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        callbackUri: {
          type: CallbackUriType.TYPE_DEEPLINK,
          uri: "myapp://auth/callback"
        }
      });

      expect(details.callbackUri?.type).toBe(CallbackUriType.TYPE_DEEPLINK);
      expect(details.callbackUri?.uri).toBe("myapp://auth/callback");
    });

    test("handles OAuth2 callback", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        callbackUri: {
          type: CallbackUriType.TYPE_OAUTH2,
          uri: "https://auth.example.com/oauth2/callback"
        }
      });

      expect(details.callbackUri?.type).toBe(CallbackUriType.TYPE_OAUTH2);
      expect(details.callbackUri?.uri).toBe("https://auth.example.com/oauth2/callback");
    });
  });

  describe("serialization", () => {
    test("roundtrip serialization with minimal data", () => {
      const original = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID
      });

      const buffer = original.toBuffer();
      const deserialized = new LoginRequestDetails();
      deserialized.fromBuffer(buffer);

      expect(deserialized.challengeId).toBe(original.challengeId);
      expect(deserialized.version.toString()).toBe(original.version.toString());
      expect(deserialized.flags?.toString()).toBe(original.flags?.toString());
      expect(deserialized.permissions).toBe(original.permissions);
      expect(deserialized.callbackUri).toBe(original.callbackUri);
    });

    test("roundtrip serialization with permissions", () => {
      const original = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 },
          { type: LoginPermissionType.REQUIRED_SYSTEM, identityid: TEST_IDENTITY_ID_2 },
          { type: LoginPermissionType.REQUIRED_PARENT, identityid: TEST_IDENTITY_ID_3 }
        ]
      });

      const buffer = original.toBuffer();
      const deserialized = new LoginRequestDetails();
      deserialized.fromBuffer(buffer);

      expect(deserialized.challengeId).toBe(original.challengeId);
      expect(deserialized.permissions).toEqual(original.permissions);
    });

    test("roundtrip serialization with callback URI", () => {
      const original = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        callbackUri: {
          type: CallbackUriType.TYPE_WEBHOOK,
          uri: "https://api.example.com/callback"
        }
      });

      const buffer = original.toBuffer();
      const deserialized = new LoginRequestDetails();
      deserialized.fromBuffer(buffer);

      expect(deserialized.challengeId).toBe(original.challengeId);
      expect(deserialized.callbackUri).toEqual(original.callbackUri);
    });

    test("roundtrip serialization with all data", () => {
      const original = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 },
          { type: LoginPermissionType.REQUIRED_PARENT, identityid: TEST_IDENTITY_ID_3 }
        ],
        callbackUri: {
          type: CallbackUriType.TYPE_REDIRECT,
          uri: "https://app.example.com/success"
        }
      });

      const buffer = original.toBuffer();
      const deserialized = new LoginRequestDetails();
      deserialized.fromBuffer(buffer);

      expect(deserialized.challengeId).toBe(original.challengeId);
      expect(deserialized.permissions).toEqual(original.permissions);
      expect(deserialized.callbackUri).toEqual(original.callbackUri);
    });

    test("roundtrip JSON serialization", () => {
      const original = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 }
        ],
        callbackUri: {
          type: CallbackUriType.TYPE_OAUTH2,
          uri: "https://oauth.example.com"
        }
      });

      const json = original.toJson();
      const fromJson = LoginRequestDetails.fromJson(json);

      expect(fromJson.challengeId).toBe(original.challengeId);
      expect(fromJson.permissions).toEqual(original.permissions);
      expect(fromJson.callbackUri).toEqual(original.callbackUri);
    });

    test("hex serialization verification with hardcoded expected data", () => {
      const original = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 }
        ],
        callbackUri: {
          type: CallbackUriType.TYPE_WEBHOOK,
          uri: "https://example.com/webhook"
        }
      });

      const buffer = original.toBuffer();
      const hexString = buffer.toString('hex');
     
     
      // Expected hex string (to be hardcoded after first run)
      const expectedHex = "c72c5b342995a2186f96271e91686c5e942d13e10301012a5fc0e9dedf4f1e8351fe652a140e9dd38fa5a9011b68747470733a2f2f6578616d706c652e636f6d2f776562686f6f6b"; // Will be filled after capturing the output
      
      // For now, just verify the roundtrip works
      const deserialized = new LoginRequestDetails();
      deserialized.fromBuffer(buffer);
      
      expect(hexString).toBe(expectedHex);
      expect(deserialized.challengeId).toBe(original.challengeId);
      expect(deserialized.permissions).toEqual(original.permissions);
      expect(deserialized.callbackUri).toEqual(original.callbackUri);
      
      // Verify hex length is reasonable
      expect(hexString.length).toBeGreaterThan(0);
      expect(hexString.length % 2).toBe(0); // Even length for valid hex
    });
  });

  describe("edge cases", () => {
    test("handles empty permissions array", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: []
      });

      const buffer = details.toBuffer();
      const deserialized = new LoginRequestDetails();
      deserialized.fromBuffer(buffer);

      expect(deserialized.permissions).toEqual([]);
    });

    test("calculates byte length correctly", () => {
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 }
        ],
        callbackUri: {
          type: CallbackUriType.TYPE_WEBHOOK,
          uri: "https://example.com"
        }
      });

      const expectedLength = details.getByteLength();
      const actualBuffer = details.toBuffer();

      expect(actualBuffer.length).toBe(expectedLength);
    });

    test("handles multiple permissions", () => {
      const longPermissions = [
        { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 },
        { type: LoginPermissionType.REQUIRED_SYSTEM, identityid: TEST_IDENTITY_ID_2 },
        { type: LoginPermissionType.REQUIRED_PARENT, identityid: TEST_IDENTITY_ID_3 },
        { type: LoginPermissionType.REQUIRED_ID, identityid: TEST_IDENTITY_ID_1 },
        { type: LoginPermissionType.REQUIRED_SYSTEM, identityid: TEST_IDENTITY_ID_2 }
      ];
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        permissions: longPermissions
      });

      const buffer = details.toBuffer();
      const deserialized = new LoginRequestDetails();
      deserialized.fromBuffer(buffer);

      expect(deserialized.permissions).toEqual(longPermissions);
    });

    test("handles long URIs", () => {
      const longUri = "https://very-long-domain-name-for-testing-purposes.example.com/path/to/callback/endpoint/with/query?param1=value1&param2=value2";
      const details = new LoginRequestDetails({
        challengeId: TEST_CHALLENGE_ID,
        callbackUri: {
          type: CallbackUriType.TYPE_REDIRECT,
          uri: longUri
        }
      });

      const buffer = details.toBuffer();
      const deserialized = new LoginRequestDetails();
      deserialized.fromBuffer(buffer);

      expect(deserialized.callbackUri?.uri).toBe(longUri);
    });
  });
});
