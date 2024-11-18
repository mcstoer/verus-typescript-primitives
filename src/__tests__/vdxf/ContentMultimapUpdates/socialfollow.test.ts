import { BN } from "bn.js";
import {
  KNOWN_VDXFKEY_CMM_UPDATE_HAS_SENDER_ID,
  KNOWN_VDXFKEY_CMM_UPDATE_VERSION_CURRENT }
from "../../../vdxf/classes/ContentMultiMapUpdates/knownvdxfkey/KnownVDXFKeyCMMUpdateRequest";
import { 
  SocialFollowDetails,
  SocialFollowRequest
} from "../../../vdxf/classes/ContentMultiMapUpdates/knownvdxfkey/SocialFollowRequest";

function CMMUpdateRequestEqual(req1, req2) {
  expect(req1.flags).toStrictEqual(req2.flags);
  expect(req1.version).toStrictEqual(req2.version);
  expect(req1.vdxfkey).toBe(req2.vdxfkey);
  expect(req1.sender_id).toBe(req2.sender_id);
  expect(req1.details).toStrictEqual(req2.details);
}

describe('Social Follow Request', () => {
  const details = new SocialFollowDetails({follow_id: "iB5PRXMHLYcNtM8dfLB6KwfJrHU2mKDYuU"});

  const req = new SocialFollowRequest({
    sender_id: "iRFP92hn9kC8giUWtS15NSg7ST1LtySKLK", 
    details: details,
  });

  const reqNoSender = new SocialFollowRequest({
    details: details,
  });

  test('toBuffer and fromBuffer with a sender id', async () => {

    // Convert to and from buffer then compare.
    const buf = req.toBuffer();
    const _req = new SocialFollowRequest();
    _req.fromBuffer(buf);

    CMMUpdateRequestEqual(_req, req);
  });

  test('toBuffer and fromBuffer without a sender id', async () => {

    const buf = reqNoSender.toBuffer();
    const _req = new SocialFollowRequest();
    _req.fromBuffer(buf);

    CMMUpdateRequestEqual(_req, reqNoSender);
  });

  test('Deeplink URIs', async () => {
    const uri = req.toWalletDeeplinkUri();
    const _req = SocialFollowRequest.fromWalletDeeplinkUri(uri);

    CMMUpdateRequestEqual(_req, req);
  });

  test('QR Codes', async () => {

    const qrString = req.toQrString();
    const _req = SocialFollowRequest.fromQrString(qrString);

    CMMUpdateRequestEqual(_req, req);
  });

  test('Flags', async () => {
    expect(req.hasSenderId()).toBe(true);
    expect(reqNoSender.hasSenderId()).toBe(false);

    let reqAddSender = reqNoSender;

    // Add a sender ID and update the flags.
    reqAddSender.sender_id = "iRFP92hn9kC8giUWtS15NSg7ST1LtySKLK";
    reqAddSender.setFlags({senderIdFlag: true});

    expect(reqAddSender.hasSenderId()).toBe(true);

    // Remove the sender ID and update the flags
    let reqRemovedSender = reqAddSender;

    reqRemovedSender.sender_id = undefined;
    reqRemovedSender.setFlags({senderIdFlag: true});

    expect(reqRemovedSender.hasSenderId()).toBe(false);

    // Add the flag manually with the sender id.
    const reqWithSender = new SocialFollowRequest({
      flags: KNOWN_VDXFKEY_CMM_UPDATE_HAS_SENDER_ID,
      sender_id: "iRFP92hn9kC8giUWtS15NSg7ST1LtySKLK", 
      details: details,
    })

    expect(reqWithSender.hasSenderId()).toBe(true);
  });

  test('Versions', async () => {
    expect(req.getVersionNoFlags()).toBe(KNOWN_VDXFKEY_CMM_UPDATE_VERSION_CURRENT);
    expect(reqNoSender.getVersionNoFlags()).toBe(KNOWN_VDXFKEY_CMM_UPDATE_VERSION_CURRENT);

    expect(req.isValidVersion()).toBe(true);
    expect(reqNoSender.isValidVersion()).toBe(true);

    const invalidVersion = new BN(0, 10);
    const reqInvalidVersion = new SocialFollowRequest({
      version: invalidVersion,
      details: details,
    });

    expect(reqInvalidVersion.getVersionNoFlags()).toBe(invalidVersion);
    expect(reqInvalidVersion.isValidVersion()).toBe(false);
  });

});