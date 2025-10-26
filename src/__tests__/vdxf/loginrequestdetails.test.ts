import { BN } from "bn.js";
import { 
  LoginRequestDetails, 
  LoginRequestDetailsInterface, 
CompactIdAddressObject
} from "../../vdxf/classes";

// Test constants with valid addresses from the codebase
const TEST_CHALLENGE_ID = "iMdf3BJ1mEtKMAJqNg8hj5fMnCUCc3bpFN";
const TEST_IDENTITY_ID_1 = "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW"; 
const TEST_IDENTITY_ID_2 = "i84T3MWcb6zWcwgNZoU3TXtrUn9EqM84A4";
const TEST_IDENTITY_ID_3 = "iJ5LnijKvp1wkL4hB3EsJ5kjcE4T8VL4hD";

const SERIALIZED_LOGIN_REQUEST_DETAILS = Buffer.from("07c72c5b342995a2186f96271e91686c5e942d13e1030101022a5fc0e9dedf4f1e8351fe652a140e9dd38fa5a9020102324afad29f51859c54050db854d2c9bb52acd9bd030102a0276f355ad37d8e5d2d10f16c1d051b6f6ead6201011c68747470733a2f2f6578616d706c652e636f6d2f63616c6c6261636bff9982d02aac020000", 'hex');


describe("LoginRequestDetails", () => {
  describe("constructor and basic properties", () => {
    test("creates instance with minimal required data", () => {
      const details = new LoginRequestDetails({
        requestId: TEST_CHALLENGE_ID
      });

      const detailsBuffer = details.toBuffer();

      const newDetails = new LoginRequestDetails();
      newDetails.fromBuffer(detailsBuffer);

      expect(details.requestId).toBe(TEST_CHALLENGE_ID);
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("0");
      expect(details.permissions).toBeNull();
      expect(details.callbackUris).toBeNull();
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });

    test("creates instance with all optional data", () => {
      const details = new LoginRequestDetails({
        requestId: TEST_CHALLENGE_ID,
        permissions: [
          { type: LoginRequestDetails.REQUIRED_ID, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_1, rootSystemName: "VRSC" }) },
          { type: LoginRequestDetails.REQUIRED_SYSTEM, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_2, rootSystemName: "VRSC" }) },
          { type: LoginRequestDetails.REQUIRED_PARENT, identity: new CompactIdAddressObject({ version: CompactIdAddressObject.DEFAULT_VERSION, type: CompactIdAddressObject.IS_IDENTITYID, address: TEST_IDENTITY_ID_3, rootSystemName: "VRSC" }) }
        ],
        callbackUris: [{
          type: LoginRequestDetails.TYPE_WEBHOOK,
          uri: "https://example.com/callback"
        }],
        expiryTime: new BN(2938475938457) // 1 hour from now
      });

      const detailsBuffer = details.toBuffer();

      const newDetails = new LoginRequestDetails();
      newDetails.fromBuffer(detailsBuffer);

      expect(newDetails.requestId).toBe(TEST_CHALLENGE_ID);
      expect(newDetails.permissions?.length).toBe(3);
      expect(newDetails.callbackUris?.length).toBe(1);
      expect(newDetails.expiryTime?.toString()).toBe("2938475938457");

      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    
      expect(details.toBuffer().toString('hex')).toBe(SERIALIZED_LOGIN_REQUEST_DETAILS.toString('hex'));

    });

    test("creates instance with default constructor", () => {
      const details = new LoginRequestDetails();

      expect(details.requestId).toBe("");
      expect(details.version.toString()).toBe("1");
      expect(details.flags?.toString()).toBe("0");
      expect(details.permissions).toBeNull();
      expect(details.callbackUris).toBeNull();
    });
  }); 
});
