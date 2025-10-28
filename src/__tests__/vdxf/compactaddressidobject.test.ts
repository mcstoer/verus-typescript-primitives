import { CompactIdAddressObject } from '../../vdxf/classes/CompactIdAddressObject';
import { BN } from "bn.js";



describe("CompactIdAddressObject", () => {
  describe("constructor and basic properties", () => {

    test("creates instance with iaddress", () => {
      const item = new CompactIdAddressObject({
        version: new BN(CompactIdAddressObject.DEFAULT_VERSION),
        type: CompactIdAddressObject.IS_IDENTITYID,
        address: "iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU",
        rootSystemName: "VRSC"
      });

      const detailsBuffer = item.toBuffer();

      const newDetails = new CompactIdAddressObject();
      newDetails.fromBuffer(detailsBuffer);
      expect(newDetails.version.toString()).toBe("1");
      expect(newDetails.type.toNumber()).toBe(CompactIdAddressObject.IS_IDENTITYID.toNumber());
      expect(newDetails.address).toBe("iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU");
      expect(newDetails.rootSystemName).toBe("VRSC");
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });

        test("creates instance with fqn", () => {
      const item = new CompactIdAddressObject({
        version: new BN(CompactIdAddressObject.DEFAULT_VERSION),
        type: CompactIdAddressObject.IS_FQN,
        address: "bob.chips@",
        rootSystemName: "VRSC"
      });

      const detailsBuffer = item.toBuffer();

      const newDetails = new CompactIdAddressObject();
      newDetails.fromBuffer(detailsBuffer);
      expect(newDetails.version.toString()).toBe("1");
      expect(newDetails.type.toNumber()).toBe(CompactIdAddressObject.IS_FQN.toNumber());
      expect(newDetails.address).toBe("bob.chips@");
      expect(newDetails.rootSystemName).toBe("VRSC");
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });

      test("creates instance with fqn that reduces to iaddress for space saving", () => {
      const item = new CompactIdAddressObject({
        version: new BN(CompactIdAddressObject.DEFAULT_VERSION),
        type: CompactIdAddressObject.IS_FQN,
        address: "bob91283472394872349824728934789234.token823984279847293847239487239847324.chips@",
        rootSystemName: "VRSC"
      });

      const detailsBuffer = item.toBuffer(); // this mutates the item to use iaddress internally

      const newDetails = new CompactIdAddressObject();
      newDetails.fromBuffer(detailsBuffer);
      expect(newDetails.version.toString()).toBe("1");
      expect(newDetails.type.toNumber()).toBe(CompactIdAddressObject.IS_IDENTITYID.toNumber());
      expect(newDetails.address).toBe("i67xSVGnGC3PVuGk5crPfkVJptiLB4zNjb");
      expect(newDetails.rootSystemName).toBe("VRSC");
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });
  });
});
