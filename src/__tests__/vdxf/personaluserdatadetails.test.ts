import { BN } from "bn.js";
import { 
 PersonalUserDataDetails, PersonalUserDataDetailsJson
} from "../../vdxf/classes";
import { DataDescriptor } from "../../pbaas";


describe("PersonalUserDataDetails", () => {
  describe("constructor and basic properties", () => {

    test("creates instance with custom values", () => {
      const item = new PersonalUserDataDetails({
        version: new BN(PersonalUserDataDetails.DEFAULT_VERSION),
        flags: PersonalUserDataDetails.HAS_STATEMENTS.or(PersonalUserDataDetails.HAS_SIGNATURE),
        signableobjects: [DataDescriptor.fromJson({ label: "123", objectdata : Buffer.from([1,2,3]), flags: DataDescriptor.FLAG_LABEL_PRESENT})],
        statements: ["Statement 1", "Statement 2"],
        signature: ["key1", "key2"] //TODO
      });

      expect(item.version.toString()).toBe("1");
      expect(item.flags.toNumber()).toBe(PersonalUserDataDetails.HAS_STATEMENTS.toNumber());
      expect(item.signableObjects).toEqual([{ label: "123", objectdata: Buffer.from([1, 2, 3]), flags: DataDescriptor.FLAG_LABEL_PRESENT }]);
      expect(item.statements).toEqual(["Statement 1", "Statement 2"]);
      expect(item.signature).toEqual(["key1", "key2"]); //TODO


    });
  });
//TODO when verifiable signature data comes add tests

});
