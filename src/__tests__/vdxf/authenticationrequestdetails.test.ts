import { BN } from "bn.js";
import { 
  AuthenticationRequestDetails,
  CompactAddressObject,
  ResponseURI
} from "../../vdxf/classes";
import { SERIALIZED_AUTHENTICATION_REQUEST_DETAILS, TEST_CHALLENGE_ID, TEST_IDENTITY_ID_1, TEST_IDENTITY_ID_2, TEST_IDENTITY_ID_3 } from "../constants/fixtures";

describe("AuthenticationRequestDetails", () => {
  describe("constructor and basic properties", () => {
    test("creates instance with minimal required data", () => {
      const details = new AuthenticationRequestDetails({
        requestID: TEST_CHALLENGE_ID
      });

      const detailsBuffer = details.toBuffer();

      const newDetails = new AuthenticationRequestDetails();
      newDetails.fromBuffer(detailsBuffer);

      expect(details.requestID).toBe(TEST_CHALLENGE_ID);
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("0");
      expect(details.recipientConstraints).toBeNull();
      expect(details.responseURIs).toBeNull();
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });

    test("creates instance with all optional data", () => {
      const details = new AuthenticationRequestDetails({
        requestID: TEST_CHALLENGE_ID,
        recipientConstraints: [
          { type: AuthenticationRequestDetails.REQUIRED_ID, identity: new CompactAddressObject({ version: CompactAddressObject.DEFAULT_VERSION, type: CompactAddressObject.TYPE_I_ADDRESS, address: TEST_IDENTITY_ID_1, rootSystemName: "VRSC" }) },
          { type: AuthenticationRequestDetails.REQUIRED_SYSTEM, identity: new CompactAddressObject({ version: CompactAddressObject.DEFAULT_VERSION, type: CompactAddressObject.TYPE_I_ADDRESS, address: TEST_IDENTITY_ID_2, rootSystemName: "VRSC" }) },
          { type: AuthenticationRequestDetails.REQUIRED_PARENT, identity: new CompactAddressObject({ version: CompactAddressObject.DEFAULT_VERSION, type: CompactAddressObject.TYPE_I_ADDRESS, address: TEST_IDENTITY_ID_3, rootSystemName: "VRSC" }) }
        ],
        responseURIs: [ResponseURI.fromUriString("https://example.com/callback", ResponseURI.TYPE_POST)],
        expiryTime: new BN(2938475938457) // 1 hour from now
      });

      const detailsBuffer = details.toBuffer();

      const newDetails = new AuthenticationRequestDetails();
      newDetails.fromBuffer(detailsBuffer);

      expect(newDetails.requestID).toBe(TEST_CHALLENGE_ID);
      expect(newDetails.recipientConstraints?.length).toBe(3);
      expect(newDetails.responseURIs?.length).toBe(1);
      expect(newDetails.expiryTime?.toString()).toBe("2938475938457");

      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    
      expect(details.toBuffer().toString('hex')).toBe(SERIALIZED_AUTHENTICATION_REQUEST_DETAILS.toString('hex'));

    });

    test("creates instance with default constructor", () => {
      const details = new AuthenticationRequestDetails();

      expect(details.requestID).toBe("");
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("0");
      expect(details.recipientConstraints).toBeNull();
      expect(details.responseURIs).toBeNull();
    });
  }); 
});
