"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityUpdateResponse = exports.IdentityUpdateRequest = exports.IdentityUpdateEnvelope = exports.IDENTITY_UPDATE_VERSION_MASK = exports.IDENTITY_UPDATE_VERSION_SIGNED = exports.IDENTITY_UPDATE_VERSION_LASTVALID = exports.IDENTITY_UPDATE_VERSION_FIRSTVALID = exports.IDENTITY_UPDATE_VERSION_CURRENT = void 0;
const __1 = require("../..");
const keys_1 = require("../../keys");
const bufferutils_1 = require("../../../utils/bufferutils");
const vdxf_1 = require("../../../constants/vdxf");
const createHash = require("create-hash");
const base64url_1 = require("base64url");
const bn_js_1 = require("bn.js");
const IdentityUpdateRequestDetails_1 = require("./IdentityUpdateRequestDetails");
const pbaas_1 = require("../../../pbaas");
const IdentityUpdateResponseDetails_1 = require("./IdentityUpdateResponseDetails");
exports.IDENTITY_UPDATE_VERSION_CURRENT = new bn_js_1.BN(1, 10);
exports.IDENTITY_UPDATE_VERSION_FIRSTVALID = new bn_js_1.BN(1, 10);
exports.IDENTITY_UPDATE_VERSION_LASTVALID = new bn_js_1.BN(1, 10);
exports.IDENTITY_UPDATE_VERSION_SIGNED = new bn_js_1.BN('80000000', 16);
exports.IDENTITY_UPDATE_VERSION_MASK = exports.IDENTITY_UPDATE_VERSION_SIGNED;
class IdentityUpdateEnvelope extends __1.VDXFObject {
    constructor(vdxfkey, request = {
        details: undefined
    }) {
        super(vdxfkey);
        if (request.version)
            this.version = request.version;
        else
            this.version = exports.IDENTITY_UPDATE_VERSION_CURRENT;
        if (!request.details) {
            this.details = this.createEmptyDetails();
        }
        this.systemid = request.systemid;
        this.signingid = request.signingid;
        if (request.signature) {
            this.signature = new __1.VerusIDSignature({ signature: request.signature }, keys_1.IDENTITY_AUTH_SIG_VDXF_KEY, false);
            this.setSigned();
        }
        this.details = request.details;
    }
    createEmptyDetails() {
        if (this.vdxfkey === keys_1.IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid) {
            return new IdentityUpdateRequestDetails_1.IdentityUpdateRequestDetails();
        }
        else if (this.vdxfkey === keys_1.IDENTITY_UPDATE_RESPONSE_VDXF_KEY.vdxfid) {
            return new IdentityUpdateResponseDetails_1.IdentityUpdateResponseDetails();
        }
        else
            throw new Error("Unrecognized vdxf key for identity update");
    }
    getVersionNoFlags() {
        return this.version.and(exports.IDENTITY_UPDATE_VERSION_MASK.notn(exports.IDENTITY_UPDATE_VERSION_MASK.bitLength()));
    }
    isValidVersion() {
        return this.getVersionNoFlags().gte(exports.IDENTITY_UPDATE_VERSION_FIRSTVALID) && this.getVersionNoFlags().lte(exports.IDENTITY_UPDATE_VERSION_LASTVALID);
    }
    isSigned() {
        return !!(this.version.and(exports.IDENTITY_UPDATE_VERSION_SIGNED).toNumber());
    }
    setSigned() {
        this.version = this.version.or(exports.IDENTITY_UPDATE_VERSION_SIGNED);
    }
    getDetailsHash(signedBlockheight, signatureVersion = 2) {
        if (this.isSigned()) {
            var heightBufferWriter = new bufferutils_1.default.BufferWriter(Buffer.allocUnsafe(4));
            heightBufferWriter.writeUInt32(signedBlockheight);
            if (signatureVersion === 1) {
                return createHash("sha256")
                    .update(vdxf_1.VERUS_DATA_SIGNATURE_PREFIX)
                    .update(this.systemid.toBuffer())
                    .update(heightBufferWriter.buffer)
                    .update(this.signingid.toBuffer())
                    .update(this.details.toSha256())
                    .digest();
            }
            else {
                return createHash("sha256")
                    .update(this.systemid.toBuffer())
                    .update(heightBufferWriter.buffer)
                    .update(this.signingid.toBuffer())
                    .update(vdxf_1.VERUS_DATA_SIGNATURE_PREFIX)
                    .update(this.details.toSha256())
                    .digest();
            }
        }
        else
            return this.details.toSha256();
    }
    _dataByteLength(signer = this.signingid) {
        if (this.isSigned()) {
            let length = 0;
            const _signature = this.signature
                ? this.signature
                : new __1.VerusIDSignature({ signature: "" }, keys_1.IDENTITY_AUTH_SIG_VDXF_KEY, false);
            length += this.systemid.getByteLength();
            length += signer.getByteLength();
            length += _signature.byteLength();
            length += this.details.getByteLength();
            return length;
        }
        else
            return this.details.getByteLength();
    }
    _toDataBuffer(signer = this.signingid) {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.dataByteLength()));
        if (this.isSigned()) {
            const _signature = this.signature
                ? this.signature
                : new __1.VerusIDSignature({ signature: "" }, keys_1.IDENTITY_AUTH_SIG_VDXF_KEY, false);
            writer.writeSlice(this.systemid.toBuffer());
            writer.writeSlice(signer.toBuffer());
            writer.writeSlice(_signature.toBuffer());
        }
        writer.writeSlice(this.details.toBuffer());
        return writer.buffer;
    }
    dataByteLength() {
        return this._dataByteLength();
    }
    toDataBuffer() {
        return this._toDataBuffer();
    }
    _fromDataBuffer(buffer, offset) {
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        const reqLength = reader.readCompactSize();
        if (reqLength == 0) {
            throw new Error("Cannot create request from empty buffer");
        }
        else {
            if (this.isSigned()) {
                this.systemid = new pbaas_1.IdentityID();
                reader.offset = this.systemid.fromBuffer(reader.buffer, reader.offset);
                this.signingid = new pbaas_1.IdentityID();
                reader.offset = this.signingid.fromBuffer(reader.buffer, reader.offset);
                const _sig = new __1.VerusIDSignature(undefined, keys_1.IDENTITY_AUTH_SIG_VDXF_KEY, false);
                reader.offset = _sig.fromBuffer(reader.buffer, reader.offset, keys_1.IDENTITY_AUTH_SIG_VDXF_KEY.vdxfid);
                this.signature = _sig;
            }
            const _details = this.createEmptyDetails();
            reader.offset = _details.fromBuffer(reader.buffer, reader.offset);
            this.details = _details;
        }
        return reader.offset;
    }
    fromDataBuffer(buffer, offset) {
        return this._fromDataBuffer(buffer, offset);
    }
    toWalletDeeplinkUri() {
        return `${__1.WALLET_VDXF_KEY.vdxfid.toLowerCase()}://x-callback-url/${keys_1.IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid}/${this.toString(false)}`;
    }
    static fromWalletDeeplinkUri(vdxfkey, uri) {
        const split = uri.split(`${keys_1.IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid}/`);
        const inv = new IdentityUpdateEnvelope(vdxfkey);
        inv.fromBuffer(base64url_1.default.toBuffer(split[1]), 0, keys_1.IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid);
        return inv;
    }
    toQrString() {
        return this.toString(true);
    }
    static fromQrString(vdxfkey, qrstring) {
        const inv = new IdentityUpdateEnvelope(vdxfkey);
        inv.fromBuffer(base64url_1.default.toBuffer(qrstring), 0);
        return inv;
    }
    toJson() {
        return {
            systemid: this.systemid ? this.systemid.toAddress() : undefined,
            signingid: this.signingid ? this.signingid.toAddress() : undefined,
            signature: this.signature ? this.signature.signature : undefined,
            details: this.details ? this.details.toJson() : undefined
        };
    }
    static internalFromJson(json, ctor, detailsFromJson) {
        return new ctor({
            systemid: json.systemid ? pbaas_1.IdentityID.fromAddress(json.systemid) : undefined,
            signingid: json.signingid ? pbaas_1.IdentityID.fromAddress(json.signingid) : undefined,
            signature: json.signature,
            details: json.details ? detailsFromJson(json.details) : undefined
        });
    }
}
exports.IdentityUpdateEnvelope = IdentityUpdateEnvelope;
class IdentityUpdateRequest extends IdentityUpdateEnvelope {
    constructor(request) {
        super(keys_1.IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid, request);
    }
    static fromWalletDeeplinkUri(uri) {
        return IdentityUpdateEnvelope.fromWalletDeeplinkUri(keys_1.IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid, uri);
    }
    static fromQrString(qrstring) {
        return IdentityUpdateEnvelope.fromQrString(keys_1.IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid, qrstring);
    }
    static fromJson(json) {
        return IdentityUpdateEnvelope.internalFromJson(json, IdentityUpdateRequest, IdentityUpdateRequestDetails_1.IdentityUpdateRequestDetails.fromJson);
    }
}
exports.IdentityUpdateRequest = IdentityUpdateRequest;
class IdentityUpdateResponse extends IdentityUpdateEnvelope {
    constructor(response) {
        super(keys_1.IDENTITY_UPDATE_RESPONSE_VDXF_KEY.vdxfid, response);
    }
    static fromWalletDeeplinkUri(uri) {
        return IdentityUpdateEnvelope.fromWalletDeeplinkUri(keys_1.IDENTITY_UPDATE_RESPONSE_VDXF_KEY.vdxfid, uri);
    }
    static fromQrString(qrstring) {
        return IdentityUpdateEnvelope.fromQrString(keys_1.IDENTITY_UPDATE_RESPONSE_VDXF_KEY.vdxfid, qrstring);
    }
    static fromJson(json) {
        return IdentityUpdateEnvelope.internalFromJson(json, IdentityUpdateResponse, IdentityUpdateResponseDetails_1.IdentityUpdateResponseDetails.fromJson);
    }
}
exports.IdentityUpdateResponse = IdentityUpdateResponse;
