"use strict";
/**
 * AppEncryptionRequestDetails - Class for handling application requests for encrypted derived seeds
 *
 * This class is used when an application is requesting an encrypted derived seed from the user's master seed,
 * using specific parameters passed by the application. The request includes:
 * - A target encryption key (zaddress format)
 * - Derivation numbers for seed generation
 * - Optional source and destination addresses for context
 *
 * The user's wallet can use these parameters to derive a specific seed from their master seed
 * and encrypt it using the provided encryption key, ensuring the application receives only
 * the specific derived seed it needs without exposing the master seed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEncryptionRequestDetails = void 0;
const bn_js_1 = require("bn.js");
const varint_1 = require("../../../utils/varint");
const bufferutils_1 = require("../../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const sapling_1 = require("../../../utils/sapling");
const CompactIdAddressObject_1 = require("../CompactIdAddressObject");
const varuint_1 = require("../../../utils/varuint");
/**
 * Checks if a string is a valid hexadecimal address
 * @param flags - Optional flags for the request
 * @flag HAS_FROM_ADDRESS - Indicates if a from address is included
 * @flag HAS_TO_ADDRESS - Indicates if a to address is included
 * @flag HAS_OPTIONAL_SEED_DERIVATION - Indicates if an optional derivation number is included
 * @flag ADDRESSES_NOT_FQN - Indicates if addresses are in hex format rather than FQN
 *
 * @param encryptToZAddress - The encryption key to use for encrypting to
 * @param derivationNumber - The derivation number to validate
 * @param secondaryDerivationNumber - The optional derivation number to validate
 * @param fromAddress - The from address to be included in the encryption either
 * john.domain@ or [20-byte hex iaddress][20-byte hex system]
 * @param toAddress - The to address to be included in the encryption either
 * john.domain@ or [20-byte hex iaddress][20-byte hex system]
 */
class AppEncryptionRequestDetails {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || AppEncryptionRequestDetails.DEFAULT_VERSION;
        this.flags = (data === null || data === void 0 ? void 0 : data.flags) || new bn_js_1.BN(0);
        this.encryptToZAddress = (data === null || data === void 0 ? void 0 : data.encryptToZAddress) || '';
        this.derivationNumber = (data === null || data === void 0 ? void 0 : data.derivationNumber) || new bn_js_1.BN(0);
        this.secondaryDerivationNumber = data === null || data === void 0 ? void 0 : data.secondaryDerivationNumber;
        this.fromAddress = data === null || data === void 0 ? void 0 : data.fromAddress;
        this.toAddress = data === null || data === void 0 ? void 0 : data.toAddress;
        this.setFlags();
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    calcFlags() {
        let flags = new bn_js_1.BN(0);
        if (this.secondaryDerivationNumber != null) {
            flags = flags.or(AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER);
        }
        if (this.fromAddress != null) {
            flags = flags.or(AppEncryptionRequestDetails.HAS_FROM_ADDRESS);
        }
        if (this.toAddress != null) {
            flags = flags.or(AppEncryptionRequestDetails.HAS_TO_ADDRESS);
        }
        return flags;
    }
    isValid() {
        let valid = this.encryptToZAddress != null && this.encryptToZAddress.length > 0;
        valid && (valid = this.derivationNumber != null && this.derivationNumber.gte(new bn_js_1.BN(0)));
        valid && (valid = this.secondaryDerivationNumber == null || this.secondaryDerivationNumber.gte(new bn_js_1.BN(0)));
        return valid;
    }
    hasSecondarySeedDerivation(flags = this.flags) {
        return flags.and(AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER).gt(new bn_js_1.BN(0));
    }
    hasFromAddress(flags = this.flags) {
        return flags.and(AppEncryptionRequestDetails.HAS_FROM_ADDRESS).gt(new bn_js_1.BN(0));
    }
    hasToAddress(flags = this.flags) {
        return flags.and(AppEncryptionRequestDetails.HAS_TO_ADDRESS).gt(new bn_js_1.BN(0));
    }
    getByteLength() {
        const flags = this.calcFlags();
        let length = 0;
        length += varuint_1.default.encodingLength(flags.toNumber());
        // encryptToKey - zaddress encoding (43 bytes for sapling address data)
        length += 43; // Sapling address decoded data (11 + 32 bytes)
        length += varuint_1.default.encodingLength(this.derivationNumber.toNumber());
        if (this.hasSecondarySeedDerivation(flags)) {
            length += varint_1.default.encodingLength(this.secondaryDerivationNumber);
        }
        if (this.hasFromAddress(flags)) {
            length += this.fromAddress.getByteLength();
        }
        if (this.hasToAddress(flags)) {
            length += this.toAddress.getByteLength();
        }
        return length;
    }
    toBuffer() {
        const flags = this.calcFlags();
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        // Write flags
        writer.writeCompactSize(flags.toNumber());
        // Write encryptToAddress as decoded sapling address data
        const saplingData = (0, sapling_1.decodeSaplingAddress)(this.encryptToZAddress);
        writer.writeSlice(Buffer.concat([saplingData.d, saplingData.pk_d]));
        // Write mandatory derivation number
        writer.writeVarInt(this.derivationNumber);
        if (this.hasSecondarySeedDerivation(flags)) {
            writer.writeVarInt(this.secondaryDerivationNumber);
        }
        if (this.hasFromAddress(flags)) {
            writer.writeSlice(this.fromAddress.toBuffer());
        }
        if (this.hasToAddress(flags)) {
            writer.writeSlice(this.toAddress.toBuffer());
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        // Read flags
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        // Read encryptToAddress as 43-byte sapling data and encode as sapling address
        const saplingData = reader.readSlice(43);
        this.encryptToZAddress = (0, sapling_1.toBech32)('zs', saplingData);
        // Read mandatory derivation number
        this.derivationNumber = reader.readVarInt();
        // Read optional derivation number if flag is set
        if (this.hasSecondarySeedDerivation()) {
            this.secondaryDerivationNumber = reader.readVarInt();
        }
        // Read addresses based on flags
        if (this.hasFromAddress()) {
            const CompactId = new CompactIdAddressObject_1.CompactIdAddressObject();
            reader.offset = CompactId.fromBuffer(reader.buffer, reader.offset);
            this.fromAddress = CompactId;
        }
        if (this.hasToAddress()) {
            const CompactId = new CompactIdAddressObject_1.CompactIdAddressObject();
            reader.offset = CompactId.fromBuffer(reader.buffer, reader.offset);
            this.toAddress = CompactId;
        }
        return reader.offset;
    }
    toJson() {
        var _a;
        // Set flags before serialization
        const flags = this.calcFlags();
        return {
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            encrypttozaddress: this.encryptToZAddress,
            derivationnumber: this.derivationNumber.toNumber(),
            secondaryderivationnumber: (_a = this.secondaryDerivationNumber) === null || _a === void 0 ? void 0 : _a.toNumber(),
            fromaddress: this.fromAddress.toJson(),
            toaddress: this.toAddress.toJson()
        };
    }
    static fromJson(json) {
        const instance = new AppEncryptionRequestDetails();
        instance.version = new bn_js_1.BN(json.version);
        instance.flags = new bn_js_1.BN(json.flags);
        instance.encryptToZAddress = json.encrypttozaddress;
        instance.derivationNumber = new bn_js_1.BN(json.derivationnumber);
        instance.secondaryDerivationNumber = (json === null || json === void 0 ? void 0 : json.secondaryderivationnumber) ? new bn_js_1.BN(json.secondaryderivationnumber) : undefined;
        if (instance.hasFromAddress()) {
            instance.fromAddress = CompactIdAddressObject_1.CompactIdAddressObject.fromJson(json === null || json === void 0 ? void 0 : json.fromaddress);
        }
        if (instance.hasToAddress()) {
            instance.toAddress = CompactIdAddressObject_1.CompactIdAddressObject.fromJson(json === null || json === void 0 ? void 0 : json.toaddress);
        }
        return instance;
    }
}
exports.AppEncryptionRequestDetails = AppEncryptionRequestDetails;
AppEncryptionRequestDetails.VERSION_INVALID = new bn_js_1.BN(0);
AppEncryptionRequestDetails.FIRST_VERSION = new bn_js_1.BN(1);
AppEncryptionRequestDetails.LAST_VERSION = new bn_js_1.BN(1);
AppEncryptionRequestDetails.DEFAULT_VERSION = new bn_js_1.BN(1);
AppEncryptionRequestDetails.HAS_FROM_ADDRESS = new bn_js_1.BN(1);
AppEncryptionRequestDetails.HAS_TO_ADDRESS = new bn_js_1.BN(2);
AppEncryptionRequestDetails.HAS_SECONDARY_SEED_DERIVATION_NUMBER = new bn_js_1.BN(4);
