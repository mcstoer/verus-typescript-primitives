import base64url from "base64url";
import { KnownVDXFKeyCMMUpdateDetails, KnownVDXFKeyCMMUpdateRequest } from "./KnownVDXFKeyCMMUpdateRequest";
import { SOCIAL_FOLLOW } from "../../../keys";
import { BigNumber } from "../../../../utils/types/BigNumber";
import { Hash160 } from "../../Hash160";
import bufferutils from "../../../../utils/bufferutils";
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from "../../../../constants/vdxf";
import { toBase58Check } from "../../../../utils/address";

export class SocialFollowDetails implements KnownVDXFKeyCMMUpdateDetails {
  follow_id: string

  constructor(data?:{
    follow_id: string
  }
  ) {
    if (data != null) {
      this.follow_id = data.follow_id
    } 
  }

  getByteLength(): number {
    let length = 0;

    const _follow_id = Hash160.fromAddress(this.follow_id);
    length += _follow_id.getByteLength();

    return length;
  }

  toBuffer () {
    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()));

    const _follow_id = Hash160.fromAddress(this.follow_id);
    writer.writeSlice(_follow_id.toBuffer());

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number) {
    const reader = new bufferutils.BufferReader(buffer, offset);

    this.follow_id = toBase58Check(
      reader.readSlice(HASH160_BYTE_LENGTH),
      I_ADDR_VERSION
    );

    return reader.offset;
  }
}

export interface SocialFollowRequestInterface {
  flags?: BigNumber,
  version?: BigNumber,
  sender_id?: string;
  details: SocialFollowDetails;
}

export class SocialFollowRequest extends KnownVDXFKeyCMMUpdateRequest {

  constructor(
    request: SocialFollowRequestInterface = {
      details: new SocialFollowDetails()
    }
  ) {
    super({
      flags: request.flags,
      version: request.version,
      vdxfkey: SOCIAL_FOLLOW.vdxfid,
      sender_id: request.sender_id,
      details: request.details,
    })
  }
  
  static fromWalletDeeplinkUri(uri: string): SocialFollowRequest {
    const split = uri.split(`${SOCIAL_FOLLOW.vdxfid}/`);
    const inv = new SocialFollowRequest();
    inv.fromBuffer(base64url.toBuffer(split[1]), 0, SOCIAL_FOLLOW.vdxfid);

    return inv;
  }

  static fromQrString(qrstring: string): SocialFollowRequest {
    const req = new SocialFollowRequest();
    req.fromBuffer(base64url.toBuffer(qrstring));

    return req;
  }
}