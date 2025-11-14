import { BN } from "bn.js";
import {
  LoginResponseDetails
} from "../../vdxf/classes";
import { TEST_CHALLENGE_ID } from "../constants/fixtures";

describe("LoginRequestDetails", () => {
  describe("constructor and basic properties", () => {
    test("creates instance with all optional data", () => {
      const details = new LoginResponseDetails({
        requestID: TEST_CHALLENGE_ID,
        createdAt: new BN(2938475938457) // 1 hour from now
      });

      const detailsBuffer = details.toBuffer();

      const newDetails = new LoginResponseDetails();
      newDetails.fromBuffer(detailsBuffer);

      expect(newDetails.requestID).toBe(TEST_CHALLENGE_ID);
      expect(newDetails.createdAt?.toString()).toBe("2938475938457");

      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });
  }); 
});
