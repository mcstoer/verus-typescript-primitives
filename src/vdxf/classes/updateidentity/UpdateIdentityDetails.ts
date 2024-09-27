
import { Identity, VerusCLIVerusIDJson } from "../../../pbaas";
import createHash = require('create-hash');
import bufferutils from "../../../utils/bufferutils";
import varuint from '../../../utils/varuint';

export type UpdateIdentityDetailsJson = {
  identity: VerusCLIVerusIDJson
  contentmultimap: object
}

// UpdateIdentityDetails contains the identity without any contentmultimap data
//  that is should be updated and the contentmultimap object that will be added 
// to the identity once the request is confirmed.
export class UpdateIdentityDetails {
  identity: Identity;
  contentmultimap: object;

  constructor(data?: {
    identity: Identity,
    contentmultimap?: object
  }) {
    if (data != null) {
      this.identity = data.identity;
      this.contentmultimap = data.contentmultimap ?? {};
    }
  }

  toSha256(): Buffer {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  getByteLength(): number {
    let length = 0;
  
    length += this.identity.getByteLength();
    const jsonString = JSON.stringify(this.contentmultimap);
    const jsonBuf = Buffer.from(jsonString, 'utf8');

    length += varuint.encodingLength(jsonBuf.length);
    length += jsonBuf.length;
  
    return length;
  }

  toBuffer(): Buffer {
    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeSlice(this.identity.toBuffer());

    // Add the contentmultimap data as a JSON string so that
    // the structure can be deserialized later.
    const jsonString = JSON.stringify(this.contentmultimap);
    const jsonBuf = Buffer.from(jsonString, 'utf8');
    writer.writeVarSlice(jsonBuf);

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0) : number {
    const reader = new bufferutils.BufferReader(buffer, offset);

    this.identity = new Identity();
    reader.offset = this.identity.fromBuffer(buffer, reader.offset);
    // Use the keylist to deserialize the contentmultimap.
    const str = reader.readVarSlice().toString();
    this.contentmultimap = JSON.parse(str);
   
    return reader.offset;
  }

  toJson(): UpdateIdentityDetailsJson {
    return {
      identity: this.identity.toJson(),
      contentmultimap: this.contentmultimap,
    }
  }

  static fromJson(data: UpdateIdentityDetailsJson): UpdateIdentityDetails {
    return new UpdateIdentityDetails({
      identity: data.identity != null ? Identity.fromJson(data.identity) : undefined,
      contentmultimap: data.contentmultimap ?? {}
    })
}
}