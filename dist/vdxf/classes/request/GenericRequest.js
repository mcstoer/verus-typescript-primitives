"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRequest = void 0;
const bn_js_1 = require("bn.js");
const GenericEnvelope_1 = require("../envelope/GenericEnvelope");
const SaplingPaymentAddress_1 = require("../../../pbaas/SaplingPaymentAddress");
const bufferutils_1 = require("../../../utils/bufferutils");
const keys_1 = require("../../keys");
const base64url_1 = require("base64url");
class GenericRequest extends GenericEnvelope_1.GenericEnvelope {
    constructor(envelope = {
        details: [],
        flags: GenericRequest.BASE_FLAGS
    }) {
        super(envelope);
        this.encryptResponseToAddress = envelope.encryptResponseToAddress;
        this.setFlags();
    }
    hasEncryptResponseToAddress() {
        return !!(this.flags.and(GenericRequest.FLAG_HAS_ENCRYPT_RESPONSE_TO_ADDRESS).toNumber());
    }
    setHasEncryptResponseToAddress() {
        this.flags = this.flags.or(GenericRequest.FLAG_HAS_ENCRYPT_RESPONSE_TO_ADDRESS);
    }
    setFlags() {
        super.setFlags();
        if (this.encryptResponseToAddress)
            this.setHasEncryptResponseToAddress();
    }
    getByteLength() {
        let length = super.getByteLength();
        if (this.hasEncryptResponseToAddress()) {
            length += this.encryptResponseToAddress.getByteLength();
        }
        return length;
    }
    toBufferOptionalSig(includeSig = true) {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.getByteLength()));
        const superBuf = super.toBufferOptionalSig(includeSig);
        writer.writeSlice(superBuf);
        if (this.hasEncryptResponseToAddress()) {
            writer.writeSlice(this.encryptResponseToAddress.toBuffer());
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        if (buffer.length == 0)
            throw new Error("Cannot create request from empty buffer");
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        reader.offset = super.fromBuffer(reader.buffer, reader.offset);
        if (this.hasEncryptResponseToAddress()) {
            this.encryptResponseToAddress = new SaplingPaymentAddress_1.SaplingPaymentAddress();
            reader.offset = this.encryptResponseToAddress.fromBuffer(reader.buffer, reader.offset);
        }
        return reader.offset;
    }
    toJson() {
        const parentJson = super.toJson();
        if (this.hasEncryptResponseToAddress()) {
            parentJson["encryptresponsetoaddress"] = this.encryptResponseToAddress.toAddressString();
        }
        return parentJson;
    }
    static fromWalletDeeplinkUri(uri) {
        const split = uri.split(`${keys_1.GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/`);
        const inv = new GenericRequest();
        inv.fromBuffer(base64url_1.default.toBuffer(split[1]), 0);
        return inv;
    }
    static fromQrString(qrstring) {
        const inv = new GenericRequest();
        inv.fromBuffer(base64url_1.default.toBuffer(qrstring), 0);
        return inv;
    }
}
exports.GenericRequest = GenericRequest;
GenericRequest.VERSION_CURRENT = new bn_js_1.BN(1, 10);
GenericRequest.VERSION_FIRSTVALID = new bn_js_1.BN(1, 10);
GenericRequest.VERSION_LASTVALID = new bn_js_1.BN(1, 10);
GenericRequest.BASE_FLAGS = GenericEnvelope_1.GenericEnvelope.BASE_FLAGS;
GenericRequest.FLAG_SIGNED = GenericEnvelope_1.GenericEnvelope.FLAG_SIGNED;
GenericRequest.FLAG_HAS_CREATED_AT = GenericEnvelope_1.GenericEnvelope.FLAG_HAS_CREATED_AT;
GenericRequest.FLAG_MULTI_DETAILS = GenericEnvelope_1.GenericEnvelope.FLAG_MULTI_DETAILS;
GenericRequest.FLAG_IS_TESTNET = GenericEnvelope_1.GenericEnvelope.FLAG_IS_TESTNET;
GenericRequest.FLAG_HAS_SALT = GenericEnvelope_1.GenericEnvelope.FLAG_HAS_SALT;
GenericRequest.FLAG_HAS_ENCRYPT_RESPONSE_TO_ADDRESS = new bn_js_1.BN(32, 10);
