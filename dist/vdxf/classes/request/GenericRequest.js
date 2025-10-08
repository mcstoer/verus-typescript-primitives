"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRequest = void 0;
const __1 = require("../../");
const bufferutils_1 = require("../../../utils/bufferutils");
const base64url_1 = require("base64url");
const bn_js_1 = require("bn.js");
const pbaas_1 = require("../../../pbaas");
const OrdinalVdxfObject_1 = require("../OrdinalVdxfObject");
const varuint_1 = require("../../../utils/varuint");
class GenericRequest {
    constructor(request = {
        details: [],
        flags: GenericRequest.BASE_FLAGS
    }) {
        this.signature = request.signature;
        this.details = request.details;
        this.createdat = request.createdat;
        if (request.flags)
            this.flags = request.flags;
        else
            this.flags = GenericRequest.BASE_FLAGS;
        if (request.version)
            this.version = request.version;
        else
            this.version = GenericRequest.VERSION_CURRENT;
        this.setFlags();
    }
    isValidVersion() {
        return this.version.gte(GenericRequest.VERSION_FIRSTVALID) && this.version.lte(GenericRequest.VERSION_LASTVALID);
    }
    isSigned() {
        return !!(this.flags.and(GenericRequest.FLAG_SIGNED).toNumber());
    }
    hasMultiDetails() {
        return !!(this.flags.and(GenericRequest.FLAG_MULTI_DETAILS).toNumber());
    }
    setSigned() {
        this.flags = this.version.xor(GenericRequest.FLAG_SIGNED);
    }
    setHasMultiDetails() {
        this.flags = this.version.xor(GenericRequest.FLAG_MULTI_DETAILS);
    }
    setHasCreatedAt() {
        this.flags = this.version.xor(GenericRequest.FLAG_HAS_CREATED_AT);
    }
    setFlags() {
        if (this.createdat)
            this.setHasCreatedAt();
        if (this.details && this.details.length > 1)
            this.setHasMultiDetails();
        if (this.signature)
            this.setSigned();
    }
    // private getRawDetailsSha256() {
    //   return createHash("sha256").update(this.details.toBuffer()).digest();
    // }
    // getDetailsHash(signedBlockheight: number, signatureVersion: number = 2) {
    //   if (this.isSigned()) {
    //     var heightBufferWriter = new bufferutils.BufferWriter(
    //       Buffer.allocUnsafe(4)
    //     );
    //     heightBufferWriter.writeUInt32(signedBlockheight);
    //     if (signatureVersion === 1) {
    //       return createHash("sha256")
    //         .update(VERUS_DATA_SIGNATURE_PREFIX)
    //         .update(fromBase58Check(this.system_id).hash)
    //         .update(heightBufferWriter.buffer)
    //         .update(fromBase58Check(this.signing_id).hash)
    //         .update(this.getRawDetailsSha256())
    //         .digest();
    //     } else {
    //       return createHash("sha256")
    //         .update(fromBase58Check(this.system_id).hash)
    //         .update(heightBufferWriter.buffer)
    //         .update(fromBase58Check(this.signing_id).hash)
    //         .update(VERUS_DATA_SIGNATURE_PREFIX)
    //         .update(this.getRawDetailsSha256())
    //         .digest();
    //     }
    //   } else return this.getRawDetailsSha256()
    // }
    getDetails(index = 0) {
        return this.details[index];
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.version.toNumber());
        length += varuint_1.default.encodingLength(this.flags.toNumber());
        if (this.isSigned()) {
            length += this.signature.getByteLength();
        }
        if (this.hasMultiDetails()) {
            length += varuint_1.default.encodingLength(this.details.length);
            for (const detail of this.details) {
                length += detail.getByteLength();
            }
        }
        else {
            length += this.getDetails().getByteLength();
        }
        return length;
    }
    toBuffer() {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeCompactSize(this.version.toNumber());
        writer.writeCompactSize(this.flags.toNumber());
        if (this.isSigned()) {
            writer.writeSlice(this.signature.toBuffer());
        }
        if (this.hasMultiDetails()) {
            writer.writeCompactSize(this.details.length);
            for (const detail of this.details) {
                writer.writeSlice(detail.toBuffer());
            }
        }
        else {
            writer.writeSlice(this.getDetails().toBuffer());
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        if (buffer.length == 0)
            throw new Error("Cannot create request from empty buffer");
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        this.version = new bn_js_1.BN(reader.readCompactSize());
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        if (this.isSigned()) {
            const _sig = new pbaas_1.SignatureData();
            reader.offset = _sig.fromBuffer(reader.buffer, reader.offset);
            this.signature = _sig;
        }
        if (this.hasMultiDetails()) {
            this.details = [];
            const numItems = reader.readCompactSize();
            for (let i = 0; i < numItems; i++) {
                const ord = OrdinalVdxfObject_1.OrdinalVdxfObject.createFromBuffer(reader.buffer, reader.offset);
                reader.offset = ord.offset;
                this.details.push(ord.obj);
            }
        }
        else {
            const ord = OrdinalVdxfObject_1.OrdinalVdxfObject.createFromBuffer(reader.buffer, reader.offset);
            reader.offset = ord.offset;
            this.details = [ord.obj];
        }
        return reader.offset;
    }
    toString() {
        return base64url_1.default.encode(this.toBuffer());
    }
    toWalletDeeplinkUri() {
        return `${__1.WALLET_VDXF_KEY.vdxfid.toLowerCase()}://x-callback-url/${__1.GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/${this.toString()}`;
    }
    static fromWalletDeeplinkUri(uri) {
        const split = uri.split(`${__1.GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/`);
        const inv = new GenericRequest();
        inv.fromBuffer(base64url_1.default.toBuffer(split[1]), 0);
        return inv;
    }
    toQrString() {
        return this.toString();
    }
    static fromQrString(qrstring) {
        const inv = new GenericRequest();
        inv.fromBuffer(base64url_1.default.toBuffer(qrstring), 0);
        return inv;
    }
    static fromJson(data) {
        return new GenericRequest();
        // let details: GenericRequestDetails;
        // if (type.eq(GenericRequest.TYPE_INVOICE)) {
        //   details = VerusPayInvoiceDetails.fromJson(data.details as VerusPayInvoiceDetailsJson);
        // } else {
        //   details = DataDescriptor.fromJson(data.details as DataDescriptorJson);
        // }
        // return new GenericRequest({
        //   details,
        //   signature: data.signature != null ? SignatureData.fromJson(data.signature) : undefined,
        //   version: new BN(data.version),
        //   type: new BN(data.type),
        //   flags: new BN(data.flags)
        // })
    }
    toJson() {
        const details = [];
        if (this.details != null) {
            for (const detail of this.details) {
                details.push(detail.toJson());
            }
        }
        return {
            signature: this.isSigned() ? this.signature.toJson() : undefined,
            details: details,
            version: this.version.toString(),
            flags: this.flags.toString()
        };
    }
}
exports.GenericRequest = GenericRequest;
GenericRequest.VERSION_CURRENT = new bn_js_1.BN(1, 10);
GenericRequest.VERSION_FIRSTVALID = new bn_js_1.BN(1, 10);
GenericRequest.VERSION_LASTVALID = new bn_js_1.BN(1, 10);
GenericRequest.BASE_FLAGS = new bn_js_1.BN(0, 10);
GenericRequest.FLAG_SIGNED = new bn_js_1.BN(1, 10);
GenericRequest.FLAG_HAS_CREATED_AT = new bn_js_1.BN(2, 10);
GenericRequest.FLAG_MULTI_DETAILS = new bn_js_1.BN(4, 10);
