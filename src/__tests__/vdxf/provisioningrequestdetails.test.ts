import { BN } from "bn.js";
import { ProvisionIdentity as ProvisioningIdentity } from "../../vdxf/classes";

describe("ProvisioningIdentity", () => {
  describe("constructor and basic properties", () => {
    test("creates instance with minimal values", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB"
      });

      expect(identity.version.toString()).toBe("1");
      expect(identity.flags.toString()).toBe("0");
      expect(identity.parentId).toBe("iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB");
      expect(identity.systemId).toBe(undefined);
      expect(identity.identityId).toBe(undefined);
      expect(identity.fqn).toBe(undefined);
      expect(identity.webhook).toBe(undefined);
    });

    test("creates instance with all values", () => {
      const identity = new ProvisioningIdentity({
        version: new BN(1),
        flags: new BN(31), // All flags set
        systemId: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB", 
        identityId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        fqn: "test.identity",
        webhook: "https://webhook.example.com"
      });

      expect(identity.version.toString()).toBe("1");
      expect(identity.flags.toString()).toBe("31");
      expect(identity.systemId).toBe("iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq");
      expect(identity.parentId).toBe("iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB");
      expect(identity.identityId).toBe("iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB");
      expect(identity.fqn).toBe("test.identity");
      expect(identity.webhook).toBe("https://webhook.example.com");
    });
  });

  describe("flag management", () => {
    test("sets FLAG_HAS_IDENTITYID when identity ID is provided", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        identityId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB"
      });

      identity.setFlags();
      const hasIdentityFlag = identity.flags.and(ProvisioningIdentity.FLAG_HAS_IDENTITYID);
      expect(hasIdentityFlag.eq(ProvisioningIdentity.FLAG_HAS_IDENTITYID)).toBe(true);
    });

    test("sets FLAG_HAS_FQN when FQN is provided", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        fqn: "test.identity"
      });

      identity.setFlags();
      const hasFqnFlag = identity.flags.and(ProvisioningIdentity.FLAG_HAS_FQN);
      expect(hasFqnFlag.eq(ProvisioningIdentity.FLAG_HAS_FQN)).toBe(true);
    });

    test("sets FLAG_HAS_WEBHOOK when webhook is provided", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        webhook: "https://example.com/webhook"
      });

      identity.setFlags();
      const hasWebhookFlag = identity.flags.and(ProvisioningIdentity.FLAG_HAS_WEBHOOK);
      expect(hasWebhookFlag.eq(ProvisioningIdentity.FLAG_HAS_WEBHOOK)).toBe(true);
    });

    test("sets FLAG_PARENT_AS_FQN when parentId is not a valid address", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: "invalid.parent.name"
      });

      identity.setFlags();
      const hasParentFqnFlag = identity.flags.and(ProvisioningIdentity.FLAG_PARENT_AS_FQN);
      expect(hasParentFqnFlag.eq(ProvisioningIdentity.FLAG_PARENT_AS_FQN)).toBe(true);
    });

    test("sets FLAG_SYSTEM_AS_SIGNATURE when systemId is not provided", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB"
      });

      identity.setFlags();
      const hasSystemSignatureFlag = identity.flags.and(ProvisioningIdentity.FLAG_SYSTEM_AS_SIGNATURE);
      expect(hasSystemSignatureFlag.eq(ProvisioningIdentity.FLAG_SYSTEM_AS_SIGNATURE)).toBe(true);
    });

    test("sets multiple flags when multiple values are provided", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        identityId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        fqn: "test.identity",
        webhook: "https://example.com/webhook"
      });

      identity.setFlags();
      const hasIdentityFlag = identity.flags.and(ProvisioningIdentity.FLAG_HAS_IDENTITYID);
      const hasFqnFlag = identity.flags.and(ProvisioningIdentity.FLAG_HAS_FQN);
      const hasWebhookFlag = identity.flags.and(ProvisioningIdentity.FLAG_HAS_WEBHOOK);
      const hasSystemSignatureFlag = identity.flags.and(ProvisioningIdentity.FLAG_SYSTEM_AS_SIGNATURE);
      
      expect(hasIdentityFlag.eq(ProvisioningIdentity.FLAG_HAS_IDENTITYID)).toBe(true);
      expect(hasFqnFlag.eq(ProvisioningIdentity.FLAG_HAS_FQN)).toBe(true);
      expect(hasWebhookFlag.eq(ProvisioningIdentity.FLAG_HAS_WEBHOOK)).toBe(true);
      expect(hasSystemSignatureFlag.eq(ProvisioningIdentity.FLAG_SYSTEM_AS_SIGNATURE)).toBe(true);
    });
  });

  describe("validation", () => {
    test("validates with minimal data", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB"
      });

      expect(identity.isValid()).toBe(true);
    });

    test("validates with all data provided", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        systemId: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        identityId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        fqn: "test.identity",
        webhook: "https://example.com/webhook"
      });

      expect(identity.isValid()).toBe(true);
    });

    test("fails validation without parentId", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0)
      });

      expect(identity.isValid()).toBe(false);
    });

    test("fails validation with empty parentId", () => {
      const identity = new ProvisioningIdentity({
        flags: new BN(0),
        parentId: ""
      });

      expect(identity.isValid()).toBe(false);
    });
  });

  describe("serialization", () => {
    test("roundtrip serialization with buffer", () => {
      const original = new ProvisioningIdentity({
        flags: new BN(0),
        systemId: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        identityId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        fqn: "test.identity",
        webhook: "https://example.com/webhook"
      });

      const buffer = original.toBuffer();
      const deserialized = new ProvisioningIdentity();
      deserialized.fromBuffer(buffer);

      expect(deserialized.systemId).toBe(original.systemId);
      expect(deserialized.parentId).toBe(original.parentId);
      expect(deserialized.identityId).toBe(original.identityId);
      expect(deserialized.fqn).toBe(original.fqn);
      expect(deserialized.webhook).toBe(original.webhook);
    });

    test("roundtrip serialization with JSON", () => {
      const original = new ProvisioningIdentity({
        flags: new BN(0),
        systemId: "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq",
        parentId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        identityId: "iKjrTCwoPFRk44fAi2nYNbPG16ZUQjv1NB",
        fqn: "test.identity",
        webhook: "https://example.com/webhook"
      });

      const json = original.toJson();
      const deserialized = ProvisioningIdentity.fromJson(json);

      expect(deserialized.systemId).toBe(original.systemId);
      expect(deserialized.parentId).toBe(original.parentId);
      expect(deserialized.identityId).toBe(original.identityId);
      expect(deserialized.fqn).toBe(original.fqn);
      expect(deserialized.webhook).toBe(original.webhook);
    });
  });
});
