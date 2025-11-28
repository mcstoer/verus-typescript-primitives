import { CompactAddressObject, CompactAddressXVariant } from '../../vdxf/classes/CompactAddressObject';
import { BN } from "bn.js";



describe("CompactAddressObject", () => {
  describe("constructor and basic properties", () => {

    test("creates instance with iaddress", () => {
      const item = new CompactAddressObject({
        version: new BN(CompactAddressObject.DEFAULT_VERSION),
        type: CompactAddressObject.TYPE_I_ADDRESS,
        address: "iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU",
        rootSystemName: "VRSC"
      });

      const detailsBuffer = item.toBuffer();

      const newDetails = new CompactAddressObject();
      newDetails.fromBuffer(detailsBuffer);
      expect(newDetails.version.toString()).toBe("1");
      expect(newDetails.BNType.toNumber()).toBe(CompactAddressObject.TYPE_I_ADDRESS.toNumber());
      expect(newDetails.address).toBe("iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU");
      expect(newDetails.rootSystemName).toBe("VRSC");
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });

    test("creates instance with xaddress", () => {
      const item = new CompactAddressObject<CompactAddressXVariant>({
        version: new BN(CompactAddressObject.DEFAULT_VERSION),
        type: CompactAddressObject.TYPE_X_ADDRESS,
        address: "xA91QPpBrHZto92NCU5KEjCqRveS4dAPrf",
        rootSystemName: "VRSC"
      });

      const detailsBuffer = item.toBuffer();

      const newDetails = new CompactAddressObject<CompactAddressXVariant>();
      newDetails.fromBuffer(detailsBuffer);
      expect(newDetails.version.toString()).toBe("1");
      expect(newDetails.BNType.toNumber()).toBe(CompactAddressObject.TYPE_X_ADDRESS.toNumber());
      expect(newDetails.address).toBe("xA91QPpBrHZto92NCU5KEjCqRveS4dAPrf");
      expect(newDetails.rootSystemName).toBe("VRSC");
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });

    test("creates instance with fqn", () => {
      const item = new CompactAddressObject({
        version: new BN(CompactAddressObject.DEFAULT_VERSION),
        type: CompactAddressObject.TYPE_FQN,
        address: "bob.chips@",
        rootSystemName: "VRSC"
      });

      const detailsBuffer = item.toBuffer();

      const newDetails = new CompactAddressObject();
      newDetails.fromBuffer(detailsBuffer);
      expect(newDetails.version.toString()).toBe("1");
      expect(newDetails.BNType.toNumber()).toBe(CompactAddressObject.TYPE_FQN.toNumber());
      expect(newDetails.address).toBe("bob.chips@");
      expect(newDetails.rootSystemName).toBe("VRSC");
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });

    test("creates instance with fqn that reduces to iaddress for space saving", () => {
      const item = new CompactAddressObject({
        version: new BN(CompactAddressObject.DEFAULT_VERSION),
        type: CompactAddressObject.TYPE_FQN,
        address: "bob91283472394872349824728934789234.token823984279847293847239487239847324.chips@",
        rootSystemName: "VRSC"
      });

      const detailsBuffer = item.toBuffer(); // this mutates the item to use iaddress internally

      const newDetails = new CompactAddressObject();
      newDetails.fromBuffer(detailsBuffer);
      expect(newDetails.version.toString()).toBe("1");
      expect(newDetails.rootSystemName).toBe("VRSC");
      expect(detailsBuffer.toString('hex')).toBe(newDetails.toBuffer().toString('hex'));
    });
  });
});
