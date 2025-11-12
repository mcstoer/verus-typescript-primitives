import { BN } from "bn.js";
import { 
  LoginRequestDetails, 
  LoginRequestDetailsInterface, 
CompactIdAddressObject
} from "../../vdxf/classes";
import { SERIALIZED_LOGIN_REQUEST_DETAILS, TEST_CHALLENGE_ID, TEST_IDENTITY_ID_1, TEST_IDENTITY_ID_2, TEST_IDENTITY_ID_3 } from "../constants/fixtures";

describe("LoginRequestDetails", () => {
  describe("constructor and basic properties", () => {
    test("creates instance with minimal required data", () => {
      const details = new LoginRequestDetails({
        requestID: TEST_CHALLENGE_ID
      });

      const detailsBuffer = details.toBuffer();

      const newDetails = new LoginRequestDetails();
      newDetails.fromBuffer(detailsBuffer);

      expect(details.requestID).toBe(TEST_CHALLENGE_ID);
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("0");
      expect(details.recipientConstraints).toBeNull();
      expect(details.callbackURIs).toBeNull();
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });

    test("creates instance with all optional data", () => {
      const details = new LoginRequestDetails({
        requestID: TEST_CHALLENGE_ID,
        recipientConstraints: [
          { type: LoginRequestDetails.REQUIRED_ID, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_1, rootSystemName: "VRSC" }) },
          { type: LoginRequestDetails.REQUIRED_SYSTEM, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_2, rootSystemName: "VRSC" }) },
          { type: LoginRequestDetails.REQUIRED_PARENT, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_3, rootSystemName: "VRSC" }) }
        ],
        callbackURIs: [{
          type: LoginRequestDetails.TYPE_WEBHOOK,
          uri: "https://example.com/callback"
        }],
        expiryTime: new BN(2938475938457) // 1 hour from now
      });

      const detailsBuffer = details.toBuffer();

      const newDetails = new LoginRequestDetails();
      newDetails.fromBuffer(detailsBuffer);

      expect(newDetails.requestID).toBe(TEST_CHALLENGE_ID);
      expect(newDetails.recipientConstraints?.length).toBe(3);
      expect(newDetails.callbackURIs?.length).toBe(1);
      expect(newDetails.expiryTime?.toString()).toBe("2938475938457");

      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    
      expect(details.toBuffer().toString('hex')).toBe(SERIALIZED_LOGIN_REQUEST_DETAILS.toString('hex'));

    });

    test("creates instance with default constructor", () => {
      const details = new LoginRequestDetails();

      expect(details.requestID).toBe("");
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("0");
      expect(details.recipientConstraints).toBeNull();
      expect(details.callbackURIs).toBeNull();
    });
  }); 
});
