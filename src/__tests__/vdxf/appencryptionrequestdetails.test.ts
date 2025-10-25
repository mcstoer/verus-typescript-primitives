import { BN } from "bn.js";
import { AppEncryptionRequestDetails, AppEncryptionRequestDetailsJson, CompactIdAddressObject } from "../../vdxf/classes";
import { TransferDestination } from "../../pbaas/TransferDestination";
import { BigNumber } from "../../utils/types/BigNumber";

// Helper function to create TransferDestination from address string
function createCompactIdAddressObject(type: number, address: string): CompactIdAddressObject {
  const obj = new CompactIdAddressObject();
  obj.type = type;
  obj.address = address;
  return obj;
}


describe("AppEncryptionRequestDetails serialization tests", () => {
  test("creates valid AppEncryptionRequestDetails with zaddress", () => {
    const details = new AppEncryptionRequestDetails();
    details.version = AppEncryptionRequestDetails.DEFAULT_VERSION;
    details.flags = AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER
      .or(AppEncryptionRequestDetails.HAS_FROM_ADDRESS)
      .or(AppEncryptionRequestDetails.HAS_TO_ADDRESS);
    details.encryptToZAddress = "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4";
    details.derivationNumber = new BN(42);
    details.secondaryDerivationNumber = new BN(234);
    
    details.fromAddress = createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW");
    details.toAddress = createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X");

    expect(details.isValid()).toBe(true);
    expect(details.encryptToZAddress).toBe("zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4");
    expect(details.flags.toNumber()).toBe(1+2+4);
    expect(details.derivationNumber.toNumber()).toBe(42);
    expect(details.secondaryDerivationNumber?.toNumber()).toBe(234);
    expect(details.fromAddress?.address).toBe("i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW");
    expect(details.toAddress?.address).toBe("i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X");
  });

  test("serializes and deserializes AppEncryptionRequestDetails correctly", () => {
    // Create the first AppEncryptionRequestDetails
    const originalDetails = new AppEncryptionRequestDetails();
    originalDetails.version = AppEncryptionRequestDetails.DEFAULT_VERSION;
    originalDetails.flags = AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER
      .or(AppEncryptionRequestDetails.HAS_FROM_ADDRESS)
      .or(AppEncryptionRequestDetails.HAS_TO_ADDRESS);
    originalDetails.encryptToZAddress = "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4";
    originalDetails.derivationNumber = new BN(42);
    originalDetails.secondaryDerivationNumber = new BN(234);
    
    originalDetails.fromAddress = createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW");
    originalDetails.toAddress = createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X");

    // Serialize to buffer
    const buffer = originalDetails.toBuffer();

    // Create a new instance and deserialize from buffer
    const deserializedDetails = new AppEncryptionRequestDetails();
    deserializedDetails.fromBuffer(buffer);

    // Verify both instances are valid
    expect(originalDetails.isValid()).toBe(true);
    expect(deserializedDetails.isValid()).toBe(true);

    // Verify all properties match
    expect(deserializedDetails.version.toNumber()).toBe(originalDetails.version.toNumber());
    expect(deserializedDetails.flags.toNumber()).toBe(originalDetails.flags.toNumber());
    expect(deserializedDetails.encryptToZAddress).toBe(originalDetails.encryptToZAddress);
    expect(deserializedDetails.derivationNumber.toNumber()).toBe(originalDetails.derivationNumber.toNumber());
    expect(deserializedDetails.secondaryDerivationNumber?.toNumber()).toBe(originalDetails.secondaryDerivationNumber?.toNumber());
    expect(deserializedDetails.fromAddress?.type).toBe(originalDetails.fromAddress?.type);
    expect(deserializedDetails.fromAddress?.address).toBe(originalDetails.fromAddress?.address);
    expect(deserializedDetails.toAddress?.type).toBe(originalDetails.toAddress?.type);
    expect(deserializedDetails.toAddress?.address).toBe(originalDetails.toAddress?.address);

    // Verify that serializing both instances produces the same buffer
    const originalBuffer = originalDetails.toBuffer();
    const deserializedBuffer = deserializedDetails.toBuffer();
    expect(originalBuffer.equals(deserializedBuffer)).toBe(true);
  });

});
