import { BN } from "bn.js";
import { AppEncryptionRequestDetails, CompactIdAddressObject } from "../../vdxf/classes";
import { BigNumber } from "../../utils/types/BigNumber";

// Helper function to create TransferDestination from address string
function createCompactIdAddressObject(type: BigNumber, address: string): CompactIdAddressObject {
  const obj = new CompactIdAddressObject();
  obj.type = type;
  obj.address = address;
  return obj;
}

describe("AppEncryptionRequestDetails serialization tests", () => {
  test("creates valid AppEncryptionRequestDetails with zaddress", () => {
    const details = new AppEncryptionRequestDetails({
      version: AppEncryptionRequestDetails.DEFAULT_VERSION,
      flags: AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER
        .or(AppEncryptionRequestDetails.HAS_FROM_ADDRESS)
        .or(AppEncryptionRequestDetails.HAS_TO_ADDRESS),
      encryptToZAddress: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(42),
      secondaryDerivationNumber: new BN(234),      
      fromAddress: createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW"),
      toAddress: createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X"),
      requestID: "iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ"
    });

    const newDetails = new AppEncryptionRequestDetails();
    const buffer = details.toBuffer();
    newDetails.fromBuffer(buffer);
    const originalBuffer = details.toBuffer();
    const deserializedBuffer = newDetails.toBuffer();
    expect(originalBuffer.toString('hex')).toBe(deserializedBuffer.toString('hex'));


    expect(details.isValid()).toBe(true);
    expect(details.encryptToZAddress).toBe("zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4");
    expect(details.flags.toNumber()).toBe(1+2+4+8);
    expect(details.derivationNumber.toNumber()).toBe(42);
    expect(details.secondaryDerivationNumber?.toNumber()).toBe(234);
    expect(details.fromAddress?.address).toBe("i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW");
    expect(details.toAddress?.address).toBe("i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X");
    expect(details.requestID).toBe("iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ");
  });

  test("serializes and deserializes AppEncryptionRequestDetails correctly", () => {
    // Create the first AppEncryptionRequestDetails
    const originalDetails = new AppEncryptionRequestDetails({
      version: AppEncryptionRequestDetails.DEFAULT_VERSION,
      flags: AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER
      .or(AppEncryptionRequestDetails.HAS_FROM_ADDRESS)
      .or(AppEncryptionRequestDetails.HAS_TO_ADDRESS),
      encryptToZAddress: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(42),
      secondaryDerivationNumber: new BN(234),      
      fromAddress: createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW"),
      toAddress: createCompactIdAddressObject(CompactIdAddressObject.IS_IDENTITYID, "i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X"),
      requestID: "iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ"
  });

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
    expect(deserializedDetails.fromAddress?.type.toNumber()).toBe(originalDetails.fromAddress?.type.toNumber());
    expect(deserializedDetails.fromAddress?.address).toBe(originalDetails.fromAddress?.address);
    expect(deserializedDetails.toAddress?.type.toNumber()).toBe(originalDetails.toAddress?.type.toNumber());
    expect(deserializedDetails.toAddress?.address).toBe(originalDetails.toAddress?.address);
    expect(deserializedDetails.requestID).toBe(originalDetails.requestID);

    // Verify that serializing both instances produces the same buffer
    const originalBuffer = originalDetails.toBuffer();
    const deserializedBuffer = deserializedDetails.toBuffer();
    expect(originalBuffer.toString('hex')).toBe(deserializedBuffer.toString('hex'));
  });

  test("fromIAddress creates valid CompactIdAddressObject", () => {
    const iaddr = "iDZvpsGCfX6vMJxi3F7m26qCX2Ns6QtQYk";
    const compactObj = CompactIdAddressObject.fromIAddress(iaddr);

    expect(compactObj).toBeInstanceOf(CompactIdAddressObject);
    expect(compactObj.address).toBe(iaddr);
    expect(compactObj.type).toBe(CompactIdAddressObject.IS_IDENTITYID);

    const item = new CompactIdAddressObject();
    item.fromBuffer(compactObj.toBuffer());

    expect(compactObj.toBuffer().toString('hex')).toBe(item.toBuffer().toString('hex'));

  });

  test("toIAddress converts FQN to IAddress correctly", () => {
    const fqn = "myidentity.VRSC@";
    const compactObj = new CompactIdAddressObject({
      type: CompactIdAddressObject.IS_FQN,
      address: fqn,
      rootSystemName: "VRSC"
    });
    const iaddr = compactObj.toIAddress();

    expect(iaddr).toBe("iDZvpsGCfX6vMJxi3F7m26qCX2Ns6QtQYk");
    const item = new CompactIdAddressObject();
    item.fromBuffer(compactObj.toBuffer());

    expect(compactObj.toBuffer().toString('hex')).toBe(item.toBuffer().toString('hex'));

  });
});
