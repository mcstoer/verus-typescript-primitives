"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossChainProof = exports.CHAIN_OBJECT_TYPES = void 0;
const varint_1 = require("../utils/varint");
const bufferutils_1 = require("../utils/bufferutils");
const bn_js_1 = require("bn.js");
const EvidenceData_1 = require("./EvidenceData");
const VDXF_Data = require("../vdxf/vdxfdatakeys");
const { BufferReader, BufferWriter } = bufferutils_1.default;
var CHAIN_OBJECT_TYPES;
(function (CHAIN_OBJECT_TYPES) {
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_INVALID"] = 0] = "CHAINOBJ_INVALID";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_HEADER"] = 1] = "CHAINOBJ_HEADER";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_HEADER_REF"] = 2] = "CHAINOBJ_HEADER_REF";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_TRANSACTION_PROOF"] = 3] = "CHAINOBJ_TRANSACTION_PROOF";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_PROOF_ROOT"] = 4] = "CHAINOBJ_PROOF_ROOT";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_COMMITMENTDATA"] = 5] = "CHAINOBJ_COMMITMENTDATA";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_RESERVETRANSFER"] = 6] = "CHAINOBJ_RESERVETRANSFER";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_RESERVED"] = 7] = "CHAINOBJ_RESERVED";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_CROSSCHAINPROOF"] = 8] = "CHAINOBJ_CROSSCHAINPROOF";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_NOTARYSIGNATURE"] = 9] = "CHAINOBJ_NOTARYSIGNATURE";
    CHAIN_OBJECT_TYPES[CHAIN_OBJECT_TYPES["CHAINOBJ_EVIDENCEDATA"] = 10] = "CHAINOBJ_EVIDENCEDATA"; // flexible evidence data
})(CHAIN_OBJECT_TYPES || (exports.CHAIN_OBJECT_TYPES = CHAIN_OBJECT_TYPES = {}));
;
class CrossChainProof {
    constructor(data) {
        this.version = (data === null || data === void 0 ? void 0 : data.version) || new bn_js_1.BN(1, 10);
        this.chain_objects = (data === null || data === void 0 ? void 0 : data.chain_objects) || [];
    }
    static knownVDXFKeys() {
        const keys = new Map();
        keys.set(VDXF_Data.EvidenceDataKey.vdxfid, CHAIN_OBJECT_TYPES.CHAINOBJ_EVIDENCEDATA);
        return keys;
    }
    getByteLength() {
        let byteLength = 0;
        byteLength += 4; // version uint32
        byteLength += varint_1.default.encodingLength(new bn_js_1.BN(this.chain_objects.length));
        for (let i = 0; i < this.chain_objects.length; i++) {
            byteLength += 2; // objtype uint16
            byteLength += this.chain_objects[i].getByteLength();
        }
        return byteLength;
    }
    toBuffer() {
        const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()));
        bufferWriter.writeUInt32(this.version.toNumber());
        bufferWriter.writeVarInt(new bn_js_1.BN(this.chain_objects.length));
        for (let i = 0; i < this.chain_objects.length; i++) {
            bufferWriter.writeUInt16(this.chain_objects[i].type.toNumber());
            bufferWriter.writeSlice(this.chain_objects[i].toBuffer());
        }
        return bufferWriter.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.version = new bn_js_1.BN(reader.readUInt32());
        this.chain_objects = [];
        const chain_objectsLength = reader.readVarInt().toNumber();
        for (let i = 0; i < chain_objectsLength; i++) {
            const objType = reader.readUInt16();
            //TODO: Implement all proof types
            if (objType != CHAIN_OBJECT_TYPES.CHAINOBJ_EVIDENCEDATA)
                throw new Error("Invalid chain object type");
            const obj = new EvidenceData_1.EvidenceData();
            reader.offset = obj.fromBuffer(reader.buffer, reader.offset);
            this.chain_objects.push(obj);
        }
        return reader.offset;
    }
    isValid() {
        for (let i = 0; i < this.chain_objects.length; i++) {
            if (!this.chain_objects[i].isValid())
                return false;
        }
        return this.chain_objects.length > 0;
    }
    toJson() {
        const outputChainObjects = [];
        //TODO: Implement all proof types
        for (let i = 0; i < this.chain_objects.length; i++) {
            if (!(this.chain_objects[i] instanceof EvidenceData_1.EvidenceData))
                throw new Error("Invalid chain object type");
            outputChainObjects.push({ vdxftype: VDXF_Data.EvidenceDataKey.vdxfid, value: this.chain_objects[i].toJson() });
        }
        return {
            version: this.version.toString(10),
            chainobjects: outputChainObjects
        };
    }
    //TODO: Implement all proof types
    static fromJson(data) {
        let chainObjects = [];
        for (let i = 0; i < data.chainobjects.length; i++) {
            if (!CrossChainProof.knownVDXFKeys().get(data.chainobjects[i].vdxftype))
                throw new Error("Invalid chain object type");
            const vdxftype = CrossChainProof.knownVDXFKeys().get(data.chainobjects[i].vdxftype);
            switch (vdxftype) {
                case CHAIN_OBJECT_TYPES.CHAINOBJ_EVIDENCEDATA:
                    chainObjects.push(EvidenceData_1.EvidenceData.fromJson({ hex: data.chainobjects[i].value.hex }));
                    break;
                default:
                    throw new Error("Invalid chain object type");
            }
        }
        return new CrossChainProof({
            version: new bn_js_1.BN(data.version, 10),
            chain_objects: chainObjects
        });
    }
}
exports.CrossChainProof = CrossChainProof;
CrossChainProof.VERSION_INVALID = new bn_js_1.BN(0);
CrossChainProof.VERSION_FIRST = new bn_js_1.BN(1);
CrossChainProof.VERSION_CURRENT = new bn_js_1.BN(1);
CrossChainProof.VERSION_LAST = new bn_js_1.BN(1);
