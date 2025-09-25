"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestationDetails = exports.AttestationPair = void 0;
const bn_js_1 = require("bn.js");
const varint_1 = require("../../../utils/varint");
const varuint_1 = require("../../../utils/varuint");
const bufferutils_1 = require("../../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const MMRDescriptor_1 = require("../../../pbaas/MMRDescriptor");
const SignatureData_1 = require("../../../pbaas/SignatureData");
class AttestationPair {
    constructor(data) {
        if (data) {
            this.mmrDescriptor = data.mmrDescriptor || new MMRDescriptor_1.MMRDescriptor();
            this.signatureData = data.signatureData || new SignatureData_1.SignatureData();
        }
        else {
            this.mmrDescriptor = new MMRDescriptor_1.MMRDescriptor();
            this.signatureData = new SignatureData_1.SignatureData();
        }
    }
    static fromJson(data) {
        return new AttestationPair({
            mmrDescriptor: MMRDescriptor_1.MMRDescriptor.fromJson(data.mmrdescriptor),
            signatureData: SignatureData_1.SignatureData.fromJson(data.signaturedata)
        });
    }
    getByteLength() {
        return this.mmrDescriptor.getByteLength() + this.signatureData.getByteLength();
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeSlice(this.mmrDescriptor.toBuffer());
        writer.writeSlice(this.signatureData.toBuffer());
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        this.mmrDescriptor = new MMRDescriptor_1.MMRDescriptor();
        reader.offset = this.mmrDescriptor.fromBuffer(reader.buffer, reader.offset);
        this.signatureData = new SignatureData_1.SignatureData();
        reader.offset = this.signatureData.fromBuffer(reader.buffer, reader.offset);
        return reader.offset;
    }
    toJson() {
        return {
            mmrdescriptor: this.mmrDescriptor.toJson(),
            signaturedata: this.signatureData.toJson()
        };
    }
}
exports.AttestationPair = AttestationPair;
class AttestationDetails {
    constructor(data) {
        if (data) {
            this.version = data.version || AttestationDetails.DEFAULT_VERSION;
            this.flags = data.flags || new bn_js_1.BN(0);
            this.label = data.label;
            this.id = data.id;
            this.timestamp = data.timestamp;
            this.attestations = data.attestations || [];
        }
        else {
            this.version = AttestationDetails.DEFAULT_VERSION;
            this.flags = new bn_js_1.BN(0);
            this.attestations = [];
        }
    }
    static fromJson(data) {
        const newAttestationDetails = new AttestationDetails();
        if (data) {
            if (data.version)
                newAttestationDetails.version = new bn_js_1.BN(data.version);
            if (data.flags !== undefined)
                newAttestationDetails.flags = new bn_js_1.BN(data.flags);
            if (data.label)
                newAttestationDetails.label = data.label;
            if (data.id)
                newAttestationDetails.id = data.id;
            if (data.timestamp)
                newAttestationDetails.timestamp = new bn_js_1.BN(data.timestamp);
            if (data.attestations) {
                newAttestationDetails.attestations = data.attestations.map(attestation => AttestationPair.fromJson(attestation));
            }
        }
        return newAttestationDetails;
    }
    /**
     * Create AttestationDetails from a single Verus node response
     * @param nodeResponse - The JSON object from Verus node: {"signaturedata": ..., "mmrdescriptor": ...}
     * @param options - Optional metadata (label, id, timestamp)
     */
    static fromNodeResponse(nodeResponse, options) {
        const attestationPair = new AttestationPair({
            mmrDescriptor: MMRDescriptor_1.MMRDescriptor.fromJson(nodeResponse.mmrdescriptor),
            signatureData: SignatureData_1.SignatureData.fromJson(nodeResponse.signaturedata)
        });
        const attestationDetails = new AttestationDetails({
            attestations: [attestationPair]
        });
        // Set optional metadata
        if (options === null || options === void 0 ? void 0 : options.label) {
            attestationDetails.setLabel(options.label);
        }
        if (options === null || options === void 0 ? void 0 : options.id) {
            attestationDetails.setId(options.id);
        }
        if (options === null || options === void 0 ? void 0 : options.timestamp) {
            attestationDetails.setTimestamp(new bn_js_1.BN(options.timestamp));
        }
        // Update flags based on set metadata
        attestationDetails.setFlags();
        return attestationDetails;
    }
    /**
     * Create AttestationDetails from multiple Verus node responses
     * @param nodeResponses - Array of JSON objects from Verus node
     * @param options - Optional metadata (label, id, timestamp)
     */
    static fromNodeResponses(nodeResponses, options) {
        const attestationPairs = nodeResponses.map(response => new AttestationPair({
            mmrDescriptor: MMRDescriptor_1.MMRDescriptor.fromJson(response.mmrdescriptor),
            signatureData: SignatureData_1.SignatureData.fromJson(response.signaturedata)
        }));
        const attestationDetails = new AttestationDetails({
            attestations: attestationPairs
        });
        // Set optional metadata
        if (options === null || options === void 0 ? void 0 : options.label) {
            attestationDetails.setLabel(options.label);
        }
        if (options === null || options === void 0 ? void 0 : options.id) {
            attestationDetails.setId(options.id);
        }
        if (options === null || options === void 0 ? void 0 : options.timestamp) {
            attestationDetails.setTimestamp(new bn_js_1.BN(options.timestamp));
        }
        // Update flags based on set metadata
        attestationDetails.setFlags();
        return attestationDetails;
    }
    hasLabel() {
        return (this.flags.toNumber() & AttestationDetails.FLAG_LABEL) !== 0;
    }
    hasId() {
        return (this.flags.toNumber() & AttestationDetails.FLAG_ID) !== 0;
    }
    hasTimestamp() {
        return (this.flags.toNumber() & AttestationDetails.FLAG_TIMESTAMP) !== 0;
    }
    setLabel(label) {
        this.label = label;
    }
    setId(id) {
        this.id = id;
    }
    setTimestamp(timestamp) {
        this.timestamp = timestamp;
    }
    /**
     * Calculate flags based on the presence of optional fields
     */
    calcFlags() {
        let flags = new bn_js_1.BN(0);
        if (this.label && this.label.length > 0) {
            flags = flags.or(new bn_js_1.BN(AttestationDetails.FLAG_LABEL));
        }
        if (this.id && this.id.length > 0) {
            flags = flags.or(new bn_js_1.BN(AttestationDetails.FLAG_ID));
        }
        if (this.timestamp) {
            flags = flags.or(new bn_js_1.BN(AttestationDetails.FLAG_TIMESTAMP));
        }
        return flags;
    }
    /**
     * Set the flags based on calculated values from present fields
     */
    setFlags() {
        this.flags = this.calcFlags();
    }
    /**
     * Add a new attestation from a Verus node response
     * @param nodeResponse - The JSON object from Verus node: {"signaturedata": ..., "mmrdescriptor": ...}
     */
    addAttestation(nodeResponse) {
        const attestationPair = new AttestationPair({
            mmrDescriptor: MMRDescriptor_1.MMRDescriptor.fromJson(nodeResponse.mmrdescriptor),
            signatureData: SignatureData_1.SignatureData.fromJson(nodeResponse.signaturedata)
        });
        this.attestations.push(attestationPair);
    }
    /**
     * Add multiple attestations from Verus node responses
     * @param nodeResponses - Array of JSON objects from Verus node
     */
    addAttestations(nodeResponses) {
        const attestationPairs = nodeResponses.map(response => new AttestationPair({
            mmrDescriptor: MMRDescriptor_1.MMRDescriptor.fromJson(response.mmrdescriptor),
            signatureData: SignatureData_1.SignatureData.fromJson(response.signaturedata)
        }));
        this.attestations.push(...attestationPairs);
    }
    /**
     * Add an existing AttestationPair to this collection
     * @param attestationPair - The AttestationPair to add
     */
    addAttestationPair(attestationPair) {
        this.attestations.push(attestationPair);
    }
    /**
     * Get the number of attestations in this collection
     */
    getAttestationCount() {
        return this.attestations.length;
    }
    getByteLength() {
        this.setFlags();
        let length = 0;
        length += varint_1.default.encodingLength(this.version);
        length += varint_1.default.encodingLength(this.flags);
        if (this.hasLabel() && this.label) {
            const labelBuffer = Buffer.from(this.label, 'utf8');
            length += varuint_1.default.encodingLength(labelBuffer.length);
            length += labelBuffer.length;
        }
        if (this.hasId() && this.id) {
            const idBuffer = Buffer.from(this.id, 'utf8');
            length += varuint_1.default.encodingLength(idBuffer.length);
            length += idBuffer.length;
        }
        if (this.hasTimestamp() && this.timestamp) {
            length += varint_1.default.encodingLength(this.timestamp);
        }
        length += varuint_1.default.encodingLength(this.attestations.length);
        this.attestations.forEach((attestation) => {
            length += attestation.getByteLength();
        });
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.version);
        writer.writeVarInt(this.flags);
        if (this.hasLabel() && this.label) {
            const labelBuffer = Buffer.from(this.label, 'utf8');
            writer.writeVarSlice(labelBuffer);
        }
        if (this.hasId() && this.id) {
            const idBuffer = Buffer.from(this.id, 'utf8');
            writer.writeVarSlice(idBuffer);
        }
        if (this.hasTimestamp() && this.timestamp) {
            writer.writeVarInt(this.timestamp);
        }
        writer.writeCompactSize(this.attestations.length);
        this.attestations.forEach((attestation) => {
            writer.writeSlice(attestation.toBuffer());
        });
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        this.version = reader.readVarInt();
        this.flags = reader.readVarInt();
        if (this.hasLabel()) {
            this.label = reader.readVarSlice().toString('utf8');
        }
        if (this.hasId()) {
            this.id = reader.readVarSlice().toString('utf8');
        }
        if (this.hasTimestamp()) {
            this.timestamp = reader.readVarInt();
        }
        const attestationsLength = reader.readCompactSize();
        this.attestations = [];
        for (let i = 0; i < attestationsLength; i++) {
            const attestation = new AttestationPair();
            reader.offset = attestation.fromBuffer(reader.buffer, reader.offset);
            this.attestations.push(attestation);
        }
        return reader.offset;
    }
    isValid() {
        return this.version.gte(AttestationDetails.FIRST_VERSION) &&
            this.version.lte(AttestationDetails.LAST_VERSION) &&
            this.attestations.length > 0;
    }
    toJson() {
        this.setFlags(); // Ensure flags are set before converting to JSON
        const retval = {
            version: this.version.toNumber(),
            attestations: this.attestations.map((attestation) => attestation.toJson())
        };
        if (this.flags.gt(new bn_js_1.BN(0))) {
            retval.flags = this.flags.toNumber();
        }
        if (this.hasLabel() && this.label) {
            retval.label = this.label;
        }
        if (this.hasId() && this.id) {
            retval.id = this.id;
        }
        if (this.hasTimestamp() && this.timestamp) {
            retval.timestamp = this.timestamp.toNumber();
        }
        return retval;
    }
}
exports.AttestationDetails = AttestationDetails;
AttestationDetails.VERSION_INVALID = new bn_js_1.BN(0);
AttestationDetails.FIRST_VERSION = new bn_js_1.BN(1);
AttestationDetails.LAST_VERSION = new bn_js_1.BN(1);
AttestationDetails.DEFAULT_VERSION = new bn_js_1.BN(1);
// Flags
AttestationDetails.FLAG_LABEL = 1;
AttestationDetails.FLAG_ID = 2;
AttestationDetails.FLAG_TIMESTAMP = 4;
