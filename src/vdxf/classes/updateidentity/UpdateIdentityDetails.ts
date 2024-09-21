
import bufferutils from "../../../utils/bufferutils";

export type UpdateIdentityDetailsJson = {

}

export class UpdateIdentityDetails {
    constructor(data?: {
    }) {

    }

    toJson() {

    }

    static fromJson(data: UpdateIdentityDetailsJson): UpdateIdentityDetails {
        return new UpdateIdentityDetails({

        })
    }

    fromBuffer(buffer: Buffer, offset: number = 0) : number {
        const reader = new bufferutils.BufferReader(buffer, offset);

        return reader.offset;
    }

    toSha256() {

    }

    getByteLength(): number {
        return 0;
    }

    toBuffer(): Buffer {
        return Buffer.alloc(0);
    }
}