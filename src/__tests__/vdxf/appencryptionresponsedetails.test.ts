import { AppEncryptionResponseDetails } from '../../vdxf/classes/response/AppEncryptionResponseDetails';
import { SaplingExtendedViewingKey } from '../../pbaas/SaplingExtendedViewingKey';
import { SaplingExtendedSpendingKey } from '../../pbaas/SaplingExtendedSpendingKey';
import { SaplingPaymentAddress } from '../../pbaas/SaplingPaymentAddress';
import { BN } from 'bn.js';

describe('AppEncryptionResponseDetails', () => {
  const testViewingKey = 'zxviews1q0njl87fqqqqpq8vghkp6nz9wx48mwelukvhx3yfwg7msatglv4xy8rrh87k9z472edvlrt950qyy6r766dxnpqktxug7t2wy80s4ug325dwp9hf4vw9a6ethf2mwc9wan28p88dq8q2e8sdlw2mhffg6hy92tjyuquz7a8reqdz905x6xt6kqdx5wn7jvas0733hends8q6s8k87emn6m060xdnhgmvn4zmx0ssrwve84lzxkqu2dnfq5qsjwrtlject0an0k282rsnx0kq4';
  const testSpendingKey = 'secret-extended-key-main1q0njl87fqqqqpq8vghkp6nz9wx48mwelukvhx3yfwg7msatglv4xy8rrh87k9z472el95h53ym2tku2dazny0j2vfukgmp6fu3k7edzcx9n8egesc32sdy3xr4s2ep4skgc7t5j5zds4ws7hf2nuszf7ltfn2nc5rk3k77gyeqdz905x6xt6kqdx5wn7jvas0733hends8q6s8k87emn6m060xdnhgmvn4zmx0ssrwve84lzxkqu2dnfq5qsjwrtlject0an0k282rs0gws78';
  const testAddress = 'zs1anxaua04mnl7dz2mjpflhw0mt73uxy9rjac53lgduk02kh3lnf0hxufk9d76j5uep5j55f5h5rk';
  const testRequestID = 'iD4CrjbJBZmwEZQ4bCWgbHx9tBHGP9mdSQ';

  it('should create with minimal data', () => {
    const response = new AppEncryptionResponseDetails({
      version: new BN(1),
      extendedViewingKey: SaplingExtendedViewingKey.fromKeyString(testViewingKey),
      address: SaplingPaymentAddress.fromAddressString(testAddress)
    });

    expect(response.extendedViewingKey).toBeInstanceOf(SaplingExtendedViewingKey);
    expect(response.address).toBeInstanceOf(SaplingPaymentAddress);
    expect(response.containsRequestID()).toBe(false);
    expect(response.containsExtendedSpendingKey()).toBe(false);
  });

  it('should create with requestID', () => {
    const response = new AppEncryptionResponseDetails({
      version: new BN(1),
      requestID: testRequestID,
      extendedViewingKey: SaplingExtendedViewingKey.fromKeyString(testViewingKey),
      address: SaplingPaymentAddress.fromAddressString(testAddress)
    });

    expect(response.requestID).toBe(testRequestID);
    expect(response.containsRequestID()).toBe(true);
    expect(response.containsExtendedSpendingKey()).toBe(false);
  });

  it('should create with extended spending key', () => {
    const response = new AppEncryptionResponseDetails({
      version: new BN(1),
      extendedViewingKey: SaplingExtendedViewingKey.fromKeyString(testViewingKey),
      address: SaplingPaymentAddress.fromAddressString(testAddress),
      extendedSpendingKey: SaplingExtendedSpendingKey.fromKeyString(testSpendingKey)
    });

    expect(response.extendedSpendingKey).toBeInstanceOf(SaplingExtendedSpendingKey);
    expect(response.containsRequestID()).toBe(false);
    expect(response.containsExtendedSpendingKey()).toBe(true);
  });

  it('should create with all optional fields', () => {
    const response = new AppEncryptionResponseDetails({
      version: new BN(1),
      requestID: testRequestID,
      extendedViewingKey: SaplingExtendedViewingKey.fromKeyString(testViewingKey),
      address: SaplingPaymentAddress.fromAddressString(testAddress),
      extendedSpendingKey: SaplingExtendedSpendingKey.fromKeyString(testSpendingKey)
    });

    expect(response.requestID).toBe(testRequestID);
    expect(response.containsRequestID()).toBe(true);
    expect(response.extendedSpendingKey).toBeInstanceOf(SaplingExtendedSpendingKey);
    expect(response.containsExtendedSpendingKey()).toBe(true);
  });

  it('should serialize and deserialize via buffer (minimal)', () => {
    const response = new AppEncryptionResponseDetails({
      version: new BN(1),
      extendedViewingKey: SaplingExtendedViewingKey.fromKeyString(testViewingKey),
      address: SaplingPaymentAddress.fromAddressString(testAddress)
    });

    const buffer = response.toBuffer();
    const response2 = new AppEncryptionResponseDetails();
    response2.fromBuffer(buffer);

    expect(response2.containsRequestID()).toBe(false);
    expect(response2.containsExtendedSpendingKey()).toBe(false);
    expect(response2.extendedViewingKey.toKeyString()).toBe(testViewingKey);
    expect(response2.address.toAddressString()).toBe(testAddress);
  });

  it('should serialize and deserialize via buffer (with requestID)', () => {
    const response = new AppEncryptionResponseDetails({
      version: new BN(1),
      requestID: testRequestID,
      extendedViewingKey: SaplingExtendedViewingKey.fromKeyString(testViewingKey),
      address: SaplingPaymentAddress.fromAddressString(testAddress)
    });

    const buffer = response.toBuffer();
    const response2 = new AppEncryptionResponseDetails();
    response2.fromBuffer(buffer);

    expect(response2.requestID).toBe(testRequestID);
    expect(response2.containsRequestID()).toBe(true);
    expect(response2.extendedViewingKey.toKeyString()).toBe(testViewingKey);
    expect(response2.address.toAddressString()).toBe(testAddress);
  });

  it('should serialize and deserialize via buffer (with spending key)', () => {
    const response = new AppEncryptionResponseDetails({
      version: new BN(1),
      extendedViewingKey: SaplingExtendedViewingKey.fromKeyString(testViewingKey),
      address: SaplingPaymentAddress.fromAddressString(testAddress),
      extendedSpendingKey: SaplingExtendedSpendingKey.fromKeyString(testSpendingKey)
    });

    const buffer = response.toBuffer();
    const response2 = new AppEncryptionResponseDetails();
    response2.fromBuffer(buffer);

    expect(response2.containsExtendedSpendingKey()).toBe(true);
    expect(response2.extendedSpendingKey).toBeDefined();
    expect(response2.extendedSpendingKey!.toKeyString()).toBe(testSpendingKey);
  });

  it('should serialize and deserialize via JSON', () => {
    const response = new AppEncryptionResponseDetails({
      version: new BN(1),
      requestID: testRequestID,
      extendedViewingKey: SaplingExtendedViewingKey.fromKeyString(testViewingKey),
      address: SaplingPaymentAddress.fromAddressString(testAddress),
      extendedSpendingKey: SaplingExtendedSpendingKey.fromKeyString(testSpendingKey)
    });

    const json = response.toJson();
    const response2 = AppEncryptionResponseDetails.fromJson(json);

    expect(response2.requestID).toBe(testRequestID);
    expect(response2.containsRequestID()).toBe(true);
    expect(response2.extendedViewingKey.toKeyString()).toBe(testViewingKey);
    expect(response2.address.toAddressString()).toBe(testAddress);
    expect(response2.extendedSpendingKey).toBeDefined();
    expect(response2.extendedSpendingKey!.toKeyString()).toBe(testSpendingKey);
    expect(response2.containsExtendedSpendingKey()).toBe(true);
  });
});
