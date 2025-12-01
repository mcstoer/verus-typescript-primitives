import { BN } from "bn.js";
import {
  AuthenticationResponseDetails
} from "../../vdxf/classes";
import { TEST_CHALLENGE_ID } from "../constants/fixtures";

describe("AuthenticationRequestDetails", () => {
  describe("constructor and basic properties", () => {
    test("creates instance with all optional data", () => {
      const details = new AuthenticationResponseDetails({
        requestID: TEST_CHALLENGE_ID
      });

      const detailsBuffer = details.toBuffer();

      const newDetails = new AuthenticationResponseDetails();
      newDetails.fromBuffer(detailsBuffer);

      expect(newDetails.requestID).toBe(TEST_CHALLENGE_ID);

      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });
  }); 
});
