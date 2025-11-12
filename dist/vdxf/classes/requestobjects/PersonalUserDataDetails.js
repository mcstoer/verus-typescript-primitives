"use strict";
/**
 * PersonalUserDataDetails - Class for handling personal user data transfer requests
 *
 * This class is used when an application is requesting to transfer or receive personal
 * user data. The request includes:
 * - Data objects as DataDescriptor instances containing the user's personal data
 * - Optional statements array for additional context or transfer conditions
 * - Optional signature data for verification of the transfer
 * - Flags indicating transfer direction and optional components
 *
 * The user's wallet can use these parameters to present the data transfer request
 * to the user, showing what personal data is being transferred, any associated
 * statements or conditions, and whether it's for the user's signature or being
 * transmitted to/from the user. This enables secure, user-controlled personal
 * data sharing with clear visibility into what data is being transferred.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalUserDataDetails = void 0;
const bn_js_1 = require("bn.js");
const varuint_1 = require("../../../utils/varuint");
const bufferutils_1 = require("../../../utils/bufferutils");
const { BufferReader, BufferWriter } = bufferutils_1.default;
const pbaas_1 = require("../../../pbaas");
const VerifiableSignatureData_1 = require("../../../vdxf/classes/VerifiableSignatureData");
class PersonalUserDataDetails {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || PersonalUserDataDetails.DEFAULT_VERSION;
        this.flags = (data === null || data === void 0 ? void 0 : data.flags) || new bn_js_1.BN(0);
        this.signableObjects = (data === null || data === void 0 ? void 0 : data.signableObjects) || [];
        this.statements = (data === null || data === void 0 ? void 0 : data.statements) || [];
        this.signature = (data === null || data === void 0 ? void 0 : data.signature) || undefined;
        this.setFlags();
    }
    setFlags() {
        this.flags = this.calcFlags();
    }
    calcFlags() {
        let flags = new bn_js_1.BN(0);
        if (this.statements && this.statements.length > 0) {
            flags = flags.or(PersonalUserDataDetails.HAS_STATEMENTS);
        }
        if (this.signature) {
            flags = flags.or(PersonalUserDataDetails.HAS_SIGNATURE);
        }
        return flags;
    }
    hasStatements() {
        return this.flags.and(PersonalUserDataDetails.HAS_STATEMENTS).eq(PersonalUserDataDetails.HAS_STATEMENTS);
    }
    hasSignature() {
        return this.flags.and(PersonalUserDataDetails.HAS_SIGNATURE).eq(PersonalUserDataDetails.HAS_SIGNATURE);
    }
    isValid() {
        let valid = this.version.gte(PersonalUserDataDetails.FIRST_VERSION) &&
            this.version.lte(PersonalUserDataDetails.LAST_VERSION);
        // Check that we have signable objects
        valid && (valid = this.signableObjects.length > 0);
        if (this.hasStatements()) {
            valid && (valid = this.statements !== undefined && this.statements.length > 0);
        }
        if (this.hasSignature()) {
            valid && (valid = this.signature !== undefined); // TODO: && this.signature.isValid();
        }
        return valid;
    }
    getByteLength() {
        let length = 0;
        length += varuint_1.default.encodingLength(this.flags.toNumber());
        // Add length for signableObjects array
        length += varuint_1.default.encodingLength(this.signableObjects.length);
        for (const obj of this.signableObjects) {
            length += obj.getByteLength();
        }
        // Add signer length if present
        if (this.hasStatements()) {
            length += varuint_1.default.encodingLength(this.statements.length);
            for (const stmt of this.statements) {
                length += varuint_1.default.encodingLength(Buffer.byteLength(stmt, 'utf8'));
                length += Buffer.byteLength(stmt, 'utf8');
            }
        }
        if (this.hasSignature() && this.signature) {
            length += this.signature.getByteLength();
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeCompactSize(this.flags.toNumber());
        // Write signableObjects array
        writer.writeCompactSize(this.signableObjects.length);
        for (const obj of this.signableObjects) {
            writer.writeSlice(obj.toBuffer());
        }
        // Write statements if present    
        if (this.hasStatements()) {
            writer.writeCompactSize(this.statements.length);
            for (const stmt of this.statements) {
                writer.writeVarSlice(Buffer.from(stmt, 'utf8'));
            }
        }
        if (this.hasSignature() && this.signature) {
            writer.writeSlice(this.signature.toBuffer());
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new BufferReader(buffer, offset);
        this.flags = new bn_js_1.BN(reader.readCompactSize());
        // Read signableObjects array
        const objectCount = reader.readCompactSize();
        this.signableObjects = [];
        for (let i = 0; i < objectCount; i++) {
            const obj = new pbaas_1.DataDescriptor();
            reader.offset = obj.fromBuffer(reader.buffer, reader.offset);
            this.signableObjects.push(obj);
        }
        // Read statements if flag is set
        if (this.hasStatements()) {
            this.statements = [];
            const statementCount = reader.readCompactSize();
            for (let i = 0; i < statementCount; i++) {
                const stmt = reader.readVarSlice().toString('utf8');
                this.statements.push(stmt);
            }
        }
        if (this.hasSignature()) {
            const signature = new VerifiableSignatureData_1.VerifiableSignatureData();
            reader.offset = signature.fromBuffer(reader.buffer, reader.offset);
            this.signature = signature;
        }
        return reader.offset;
    }
    toJson() {
        const flags = this.calcFlags();
        return {
            version: this.version.toNumber(),
            flags: flags.toNumber(),
            signableobjects: this.signableObjects.map(obj => obj.toJson()),
            statements: this.statements,
            signature: this.signature ? this.signature.toJson() : undefined
        };
    }
    static fromJson(json) {
        const instance = new PersonalUserDataDetails();
        instance.version = new bn_js_1.BN(json.version);
        instance.flags = new bn_js_1.BN(json.flags);
        const dataDescriptorObjects = [];
        for (const objJson of json.signableobjects) {
            const dataDescriptor = pbaas_1.DataDescriptor.fromJson(objJson);
            dataDescriptorObjects.push(dataDescriptor);
        }
        instance.signableObjects = dataDescriptorObjects;
        instance.statements = json.statements || [];
        instance.signature = json.signature ? VerifiableSignatureData_1.VerifiableSignatureData.fromJson(json.signature) : undefined;
        return instance;
    }
}
exports.PersonalUserDataDetails = PersonalUserDataDetails;
PersonalUserDataDetails.VERSION_INVALID = new bn_js_1.BN(0);
PersonalUserDataDetails.FIRST_VERSION = new bn_js_1.BN(1);
PersonalUserDataDetails.LAST_VERSION = new bn_js_1.BN(1);
PersonalUserDataDetails.DEFAULT_VERSION = new bn_js_1.BN(1);
// types of data to sign
PersonalUserDataDetails.HAS_STATEMENTS = new bn_js_1.BN(1);
PersonalUserDataDetails.HAS_SIGNATURE = new bn_js_1.BN(2);
PersonalUserDataDetails.FOR_USERS_SIGNATURE = new bn_js_1.BN(4);
PersonalUserDataDetails.FOR_TRANSMITTAL_TO_USER = new bn_js_1.BN(8);
PersonalUserDataDetails.HAS_URL_FOR_DOWNLOAD = new bn_js_1.BN(16);
