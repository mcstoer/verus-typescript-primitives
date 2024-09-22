
import { Identity, IDENTITY_VERSION_PBAAS } from "../../pbaas/Identity";
import { UpdateIdentityRequest } from "../../vdxf/classes/updateidentity/UpdateIdentityRequest";
import { UpdateIdentityDetails } from "../../vdxf/classes/updateidentity/UpdateIdentityDetails";
import { BN } from 'bn.js';
import { KeyID } from "../../pbaas/KeyID";
import { IdentityID } from "../../pbaas/IdentityID";
import { ContentMultiMap } from "../../pbaas/ContentMultiMap";

describe('Serializes and deserializes Update Identity Request', () => {
  test('Create and serialize then deserialize' , async () => {

    const contentmap = new Map();
    contentmap.set("iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j", Buffer.alloc(32));
    contentmap.set("iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c", Buffer.alloc(32));

    const identity = new Identity({
      version: IDENTITY_VERSION_PBAAS,
      min_sigs: new BN(1),
      primary_addresses: [
        KeyID.fromAddress("RQVsJRf98iq8YmRQdehzRcbLGHEx6YfjdH"),
        KeyID.fromAddress("RP4Qct9197i5vrS11qHVtdyRRoAHVNJS47")
      ],
      parent: IdentityID.fromAddress("iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"),
      system_id: IdentityID.fromAddress("iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq"),
      name: "TestID",
      content_map: contentmap,
      content_multimap: ContentMultiMap.fromJson({
        iPsFBfFoCcxtuZNzE8yxPQhXVn4dmytf8j: [
          { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' },
          { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' },
          { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' },
          { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' }
        ],
        iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq: '6868686868686868686868686868686868686868',
        i5v3h9FWVdRFbNHU7DfcpGykQjRaHtMqu7: [
          '6868686868686868686868686868686868686868',
          '6868686868686868686868686868686868686868',
          '6868686868686868686868686868686868686868'
        ],
        i81XL8ZpuCo9jmWLv5L5ikdxrGuHrrpQLz: { iK7a5JNJnbeuYWVHCDRpJosj3irGJ5Qa8c: 'Test String 123454321' }
      }),
      recovery_authority: IdentityID.fromAddress("i81XL8ZpuCo9jmWLv5L5ikdxrGuHrrpQLz"),
      revocation_authority: IdentityID.fromAddress("i5v3h9FWVdRFbNHU7DfcpGykQjRaHtMqu7"),
      unlock_after: new BN("123456", 10)
    })

    const details = new UpdateIdentityDetails({
        identity: identity
    })

    // Need to have system_id, signing_id, signature and details.
    const req = new UpdateIdentityRequest({
      system_id: "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV",
      signing_id: "iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU",
      signature: {
        signature:
          "AYG2IQABQSAN1fp6A9NIVbxvKuOVLLU+0I+G3oQGbRtS6u4Eampfb217Cdf5FCMScQhV9kMxtjI9GWzpchmjuiTB2tctk6qT",
      },
      details: details
    })

    // Convert to and from buffer then compare.
    const buf = req.toBuffer();
    const _req = new UpdateIdentityRequest();
    _req.fromBuffer(buf);

    expect(_req.system_id).toBe(req.system_id);
    expect(_req.signing_id).toBe(req.signing_id);
    expect(_req.signature).toStrictEqual(req.signature);
    expect(_req.details).toStrictEqual(req.details);

  })
});