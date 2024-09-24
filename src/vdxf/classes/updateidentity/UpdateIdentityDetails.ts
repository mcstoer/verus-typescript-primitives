
import { Identity, VdxfUniValue, VerusCLIVerusIDJson } from "../../../pbaas";
import createHash = require('create-hash');
import bufferutils from "../../../utils/bufferutils";
import varuint from '../../../utils/varuint';
import varint from '../../../utils/varint';

import { BN } from 'bn.js';

export type UpdateIdentityDetailsJson = {
  multimapKeylists: string
  identity: VerusCLIVerusIDJson
}

// UpdateIdentityDetails contains the identity that is should be updated
// and the multimap keylist used to deserialize the contentmultimap.
export class UpdateIdentityDetails {
  multimapKeylists: Array<Array<string> | null>
  identity: Identity;

  constructor(data?: {
    identity: Identity
  }) {
    if (data != null) {
      this.identity = data.identity;
      this.updateMultimapKeylists();
    }
  }

  // updateMultimapKeylists uses the contentmultimap to make the keylists.
  updateMultimapKeylists() {
    let keylists = []
    if (this.identity?.content_multimap?.kv_content.size > 0) {
      for (const [key, value] of this.identity.content_multimap.kv_content) {
        let keylist = []
        if (Array.isArray(value)) {
          for (const n of value) {
            // Check if there is a univalue stored.
            if (n instanceof VdxfUniValue) {
              keylist.push(key);
              break;
            }
          }
        }

        if (keylist.length > 0) {
          keylists.push(keylist)
        } else {
          keylists.push(null)
        }
      }
    }
    
    this.multimapKeylists = keylists;
  }

  toSha256(): Buffer {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  getByteLength(): number {
    let length = 0;
  
    const jsonString = JSON.stringify(this.multimapKeylists);
    const jsonBuf = Buffer.from(jsonString, 'utf8');

    length += varuint.encodingLength(jsonBuf.length);
    length += jsonBuf.length;
    length += this.identity.getByteLength();
  
    return length;
  }

  toBuffer(): Buffer {
    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()));

    this.updateMultimapKeylists();
    const jsonString = JSON.stringify(this.multimapKeylists);
    const jsonBuf = Buffer.from(jsonString, 'utf8');
    writer.writeVarSlice(jsonBuf);

    writer.writeSlice(this.identity.toBuffer());

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0) : number {
    const reader = new bufferutils.BufferReader(buffer, offset);

    // Use the keylist to deserialize the contentmultimap.
    const str = reader.readVarSlice().toString();
    this.multimapKeylists = JSON.parse(str);
    this.identity = new Identity();
    reader.offset = this.identity.fromBuffer(buffer, reader.offset, this.multimapKeylists);

    return reader.offset;
  }

  toJson(): UpdateIdentityDetailsJson {
    return {
      multimapKeylists: JSON.stringify(this.multimapKeylists),
      identity: this.identity.toJson(),
    }
  }

  static fromJson(data: UpdateIdentityDetailsJson): UpdateIdentityDetails {
    return new UpdateIdentityDetails({
      identity: data.identity != null ? Identity.fromJson(data.identity) : undefined
    })
}
}