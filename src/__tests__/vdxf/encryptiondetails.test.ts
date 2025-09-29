import { BN } from "bn.js";
import { EncryptionDetails, EncryptionType, SeedDerivationMethod } from "../../vdxf/classes";
import { TransferDestination } from "../../pbaas/TransferDestination";

// Helper function to create TransferDestination from address string
function createTransferDestination(address: string): TransferDestination {
  return TransferDestination.fromJson({ 
    type: 4, // DEST_ID
    address: address 
  });
}

const PUBKEY ="03cf9368077ddaaa635d2b524644548b656d8609473f1e267cc1599b595bc7ddc7"

describe("EncryptionDetails serialization tests", () => {
  test("creates valid EncryptionDetails with zaddress", () => {
    const details = new EncryptionDetails({
      type: EncryptionType.TYPE_ZADDRESS,
      key: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(42),
      seedDerivationMethod: new BN(SeedDerivationMethod.BOTH_ADDRESSES),
      fromAddress: createTransferDestination("iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4"),
      toAddress: createTransferDestination("i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X")
    });

    expect(details.isValid()).toBe(true);
    expect(details.type).toBe(EncryptionType.TYPE_ZADDRESS);
    expect(details.derivationNumber.toNumber()).toBe(42);
    expect(details.seedDerivationMethod?.toNumber()).toBe(SeedDerivationMethod.BOTH_ADDRESSES);
  });

  test("validates required addresses based on derivation method", () => {
    // FROM_ADDRESS_ONLY requires fromAddress
    const fromOnly = new EncryptionDetails({
      type: EncryptionType.TYPE_ZADDRESS,
      key: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(1),
      seedDerivationMethod: new BN(SeedDerivationMethod.FROM_ADDRESS_ONLY),
      fromAddress: createTransferDestination("iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4")
    });
    expect(fromOnly.isValid()).toBe(true);

    // TO_ADDRESS_ONLY requires toAddress
    const toOnly = new EncryptionDetails({
      type: EncryptionType.TYPE_ZADDRESS,
      key: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(1),
      seedDerivationMethod: new BN(SeedDerivationMethod.TO_ADDRESS_ONLY),
      toAddress: createTransferDestination("iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4")
    });
    expect(toOnly.isValid()).toBe(true);

    // BOTH_ADDRESSES requires both
    const both = new EncryptionDetails({
      type: EncryptionType.TYPE_ZADDRESS,
      key: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(1),
      seedDerivationMethod: new BN(SeedDerivationMethod.BOTH_ADDRESSES),
      fromAddress: createTransferDestination("i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW"),
      toAddress: createTransferDestination("i84T3MWcb6zWcwgNZoU3TXtrUn9EqM84A4")
    });
    expect(both.isValid()).toBe(true);
  });

  test("fails validation with missing required addresses", () => {
    // FROM_ADDRESS_ONLY without fromAddress should fail
    const invalidFromOnly = new EncryptionDetails({
      type: EncryptionType.TYPE_ZADDRESS,
      key: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(1),
      seedDerivationMethod: new BN(SeedDerivationMethod.FROM_ADDRESS_ONLY)
    });
    expect(invalidFromOnly.isValid()).toBe(false);

    // BOTH_ADDRESSES with only one address should fail
    const invalidBoth = new EncryptionDetails({
      type: EncryptionType.TYPE_ZADDRESS,
      key: "zs1sthrnsx5vmpmdl3pcd0paltcq9jf56hjjzu87shf90mt54y3szde6zaauvxw5sfuqh565arhmh4",
      derivationNumber: new BN(1),
      seedDerivationMethod: new BN(SeedDerivationMethod.BOTH_ADDRESSES),
      fromAddress: createTransferDestination("iJ5LnijKvp1wkL4hB3EsJ5kjcE4T8VL4hD")
    });
    expect(invalidBoth.isValid()).toBe(false);
  });

  test("roundtrip serialization with pubkey hash", () => {
    const original = new EncryptionDetails({
      type: EncryptionType.TYPE_PUBKEY,
      key: PUBKEY,
      derivationNumber: new BN(42),
      seedDerivationMethod: new BN(SeedDerivationMethod.BOTH_ADDRESSES),
      fromAddress: createTransferDestination("i7LaXD2cdy1zeh33eHzZaEPyueT4yQmBfW"),
      toAddress: createTransferDestination("i84T3MWcb6zWcwgNZoU3TXtrUn9EqM84A4")
    });

    const buffer = original.toBuffer();
    const deserialized = new EncryptionDetails();
    deserialized.fromBuffer(buffer);

    expect(deserialized.type).toBe(original.type);
    expect(deserialized.key).toBe(original.key);
    expect(deserialized.derivationNumber.toString()).toBe(original.derivationNumber.toString());
    expect(deserialized.seedDerivationMethod?.toString()).toBe(original.seedDerivationMethod?.toString());
    expect(deserialized.fromAddress?.toBuffer().toString('hex')).toBe(original.fromAddress?.toBuffer().toString('hex'));
    expect(deserialized.toAddress?.toBuffer().toString('hex')).toBe(original.toAddress?.toBuffer().toString('hex'));
  });

  test("roundtrip JSON serialization", () => {
    const original = new EncryptionDetails({
      type: EncryptionType.TYPE_PUBKEY,
      key: PUBKEY,
      derivationNumber: new BN(42),
      seedDerivationMethod: new BN(SeedDerivationMethod.FROM_ADDRESS_ONLY),
      fromAddress: createTransferDestination("i84T3MWcb6zWcwgNZoU3TXtrUn9EqM84A4")
    });

    const json = original.toJSON();
    expect(json.type).toBe(EncryptionType.TYPE_PUBKEY);
    expect(json.derivationnumber).toBe(42);
    expect(json.seedderivationmethod).toBe(SeedDerivationMethod.FROM_ADDRESS_ONLY);
    expect(json.fromaddress?.address).toBeDefined();
    expect(json.fromaddress?.type).toBeDefined();

    const fromJson = EncryptionDetails.fromJSON(json);
    expect(fromJson.toBuffer().toString("hex")).toBe(original.toBuffer().toString("hex"));
  });

  test("validates key format", () => {
    // Valid pubkey hash format
    const validPubkey = new EncryptionDetails({
      type: EncryptionType.TYPE_PUBKEY,
      key: PUBKEY,
      derivationNumber: new BN(1)
    });
    expect(validPubkey.isKeyFormatValid()).toBe(true);

    // Invalid pubkey hash format
    const invalidPubkey = new EncryptionDetails({
      type: EncryptionType.TYPE_PUBKEY,
      key: "invalid_address",
      derivationNumber: new BN(1)
    });
    expect(invalidPubkey.isKeyFormatValid()).toBe(false);
    expect(invalidPubkey.isValid()).toBe(false);
  });

  test("handles NONE derivation method", () => {
    const details = new EncryptionDetails({
      type: EncryptionType.TYPE_PUBKEY,
      key: PUBKEY,
      derivationNumber: new BN(1),
      seedDerivationMethod: new BN(SeedDerivationMethod.NONE)
    });

    expect(details.isValid()).toBe(true);
    expect(details.seedDerivationMethod?.toNumber()).toBe(SeedDerivationMethod.NONE);
    expect(details.seedDerivationMethod == null || details.seedDerivationMethod.eq(new BN(SeedDerivationMethod.NONE))).toBe(true);
  });
});
