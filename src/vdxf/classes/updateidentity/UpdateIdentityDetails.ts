
import { Identity, VerusCLIVerusIDJson } from "../../../pbaas";
import createHash = require('create-hash');
import bufferutils from "../../../utils/bufferutils";

export type UpdateIdentityDetailsJson = {
    identity: VerusCLIVerusIDJson
}

// UpdateIdentityDetails contains the identity that is should be updated.
export class UpdateIdentityDetails {
    identity: Identity;

    constructor(data?: {
        identity: Identity
    }) {
        this.identity = data.identity;
    }

    toSha256(): Buffer {
        return createHash("sha256").update(this.toBuffer()).digest();
    }

    getByteLength(): number {
        let length = 0;

        length += this.identity.getByteLength();

        return length;
    }

    toBuffer(): Buffer {
        const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()));

        writer.writeSlice(this.identity.toBuffer());

        return writer.buffer;
    }

    fromBuffer(buffer: Buffer, offset: number = 0) : number {
        const reader = new bufferutils.BufferReader(buffer, offset);

        this.identity = new Identity();
        reader.offset =this.identity.fromBuffer(buffer, reader.offset);

        return reader.offset;
    }

    toJson(): UpdateIdentityDetailsJson {
        return {
            identity: this.identity.toJson(),
        }
    }

    static fromJson(data: UpdateIdentityDetailsJson): UpdateIdentityDetails {
        return new UpdateIdentityDetails({
            identity: data.identity != null ? Identity.fromJson(data.identity) : undefined
        })
    }


}