"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VdxfUniValue = exports.VDXF_UNI_VALUE_VERSION_CURRENT = exports.VDXF_UNI_VALUE_VERSION_INVALID = void 0;
const varuint_1 = require("../utils/varuint");
const bufferutils_1 = require("../utils/bufferutils");
const address_1 = require("../utils/address");
const vdxf_1 = require("../constants/vdxf");
const bn_js_1 = require("bn.js");
const varint_1 = require("../utils/varint");
const string_1 = require("../utils/string");
const CurrencyValueMap_1 = require("./CurrencyValueMap");
const Rating_1 = require("./Rating");
const TransferDestination_1 = require("./TransferDestination");
const ContentMultiMapRemove_1 = require("./ContentMultiMapRemove");
const CrossChainDataRef_1 = require("./CrossChainDataRef");
const SignatureData_1 = require("./SignatureData");
const DataDescriptor_1 = require("./DataDescriptor");
const MMRDescriptor_1 = require("./MMRDescriptor");
const Credential_1 = require("./Credential");
const VDXF_Data = require("../vdxf/vdxfdatakeys");
exports.VDXF_UNI_VALUE_VERSION_INVALID = new bn_js_1.BN(0, 10);
exports.VDXF_UNI_VALUE_VERSION_CURRENT = new bn_js_1.BN(1, 10);
const { BufferWriter, BufferReader } = bufferutils_1.default;
;
// This UniValue class was adapted from C++ code for encoding JSON objects into bytes. It is not serialization and
// therefore doesn't have a fromBuffer function, as you can't reliably decode it, only encode.
class VdxfUniValue {
    constructor(data) {
        if (data === null || data === void 0 ? void 0 : data.values)
            this.values = data.values;
        if (data === null || data === void 0 ? void 0 : data.version)
            this.version = data.version;
        else
            this.version = exports.VDXF_UNI_VALUE_VERSION_CURRENT;
    }
    getByteLength() {
        let length = 0;
        for (const inner of this.values) {
            const key = Object.keys(inner)[0];
            const value = inner[key];
            // if we just have serialized data 
            if (key === "") {
                length += Buffer.from(value, "hex").length;
                continue;
            }
            if (key == VDXF_Data.DataByteKey.vdxfid) {
                length += 1;
                continue;
            }
            else if ((key == VDXF_Data.DataUint16Key.vdxfid) || (key == VDXF_Data.DataInt16Key.vdxfid)) {
                length += 2;
                continue;
            }
            else if ((key == VDXF_Data.DataInt32Key.vdxfid) || (key == VDXF_Data.DataUint32Key.vdxfid)) {
                length += 4;
                continue;
            }
            else if (key == VDXF_Data.DataInt64Key.vdxfid) {
                length += 8;
                continue;
            }
            else if (key == VDXF_Data.DataUint160Key.vdxfid) {
                length += vdxf_1.HASH160_BYTE_LENGTH;
                continue;
            }
            else if (key == VDXF_Data.DataUint256Key.vdxfid) {
                length += vdxf_1.HASH256_BYTE_LENGTH;
                continue;
            }
            length += vdxf_1.HASH160_BYTE_LENGTH;
            function totalStreamLength(bufLen) {
                const encodeStreamLen = varuint_1.default.encodingLength(bufLen + varuint_1.default.encodingLength(bufLen));
                return bufLen + encodeStreamLen;
            }
            if (key == VDXF_Data.DataStringKey.vdxfid) {
                const valBuf = Buffer.from(value, "utf-8");
                length += varint_1.default.encodingLength(new bn_js_1.BN(1));
                // NOTE: 3 is from ss type + ver + vdxfIdVersion 
                length += varuint_1.default.encodingLength(valBuf.length);
                length += totalStreamLength(valBuf.length);
            }
            else if (key == VDXF_Data.DataByteVectorKey.vdxfid) {
                const valBuf = Buffer.from(value, "hex");
                length += varint_1.default.encodingLength(new bn_js_1.BN(1));
                length += varuint_1.default.encodingLength(valBuf.length);
                length += totalStreamLength(valBuf.length);
            }
            else if (key == VDXF_Data.DataCurrencyMapKey.vdxfid) {
                const oneCurMap = new CurrencyValueMap_1.CurrencyValueMap(Object.assign(Object.assign({}, value), { multivalue: true }));
                length += varint_1.default.encodingLength(new bn_js_1.BN(1));
                length += totalStreamLength(oneCurMap.getByteLength());
            }
            else if (key == VDXF_Data.DataRatingsKey.vdxfid) {
                const oneRatingMap = new Rating_1.Rating(value);
                length += varint_1.default.encodingLength(oneRatingMap.version);
                length += totalStreamLength(oneRatingMap.getByteLength());
            }
            else if (key == VDXF_Data.CredentialKey.vdxfid) {
                const oneCredential = new Credential_1.Credential(value);
                length += varint_1.default.encodingLength(oneCredential.version);
                length += totalStreamLength(oneCredential.getByteLength());
            }
            else if (key == VDXF_Data.DataTransferDestinationKey.vdxfid) {
                const transferDest = new TransferDestination_1.TransferDestination(value);
                length += varint_1.default.encodingLength(transferDest.typeNoFlags());
                length += totalStreamLength(transferDest.getByteLength());
            }
            else if (key == VDXF_Data.ContentMultiMapRemoveKey.vdxfid) {
                const multiRemove = new ContentMultiMapRemove_1.ContentMultiMapRemove(value);
                length += varint_1.default.encodingLength(multiRemove.version);
                length += totalStreamLength(multiRemove.getByteLength());
            }
            else if (key == VDXF_Data.CrossChainDataRefKey.vdxfid) {
                const crossCh = value;
                length += varint_1.default.encodingLength(vdxf_1.VDXF_OBJECT_DEFAULT_VERSION);
                length += totalStreamLength(crossCh.getByteLength());
            }
            else if (key == VDXF_Data.DataDescriptorKey.vdxfid) {
                const descr = new DataDescriptor_1.DataDescriptor(value);
                length += varint_1.default.encodingLength(descr.version);
                length += totalStreamLength(descr.getByteLength());
            }
            else if (key == VDXF_Data.MMRDescriptorKey.vdxfid) {
                const descr = new MMRDescriptor_1.MMRDescriptor(value);
                length += varint_1.default.encodingLength(descr.version);
                length += totalStreamLength(descr.getByteLength());
            }
            else if (key == VDXF_Data.SignatureDataKey.vdxfid) {
                const sigData = new SignatureData_1.SignatureData(value);
                length += varint_1.default.encodingLength(sigData.version);
                length += totalStreamLength(sigData.getByteLength());
            }
            else {
                throw new Error("contentmap invalid or unrecognized vdxfkey for object type: " + key);
            }
        }
        return length;
    }
    toBuffer() {
        const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
        for (const inner of this.values) {
            const key = Object.keys(inner)[0];
            const value = inner[key];
            if (key === "") {
                writer.writeSlice(value);
                continue;
            }
            if (key == VDXF_Data.DataByteKey.vdxfid) {
                const oneByte = Buffer.from(value, "hex");
                if (oneByte.length != 1) {
                    throw new Error("contentmap: byte data must be exactly one byte");
                }
                writer.writeSlice(oneByte);
            }
            else if (key == VDXF_Data.DataInt16Key.vdxfid) {
                const oneShort = Buffer.alloc(2);
                oneShort.writeInt16LE(value.toNumber());
                writer.writeSlice(oneShort);
            }
            else if (key == VDXF_Data.DataUint16Key.vdxfid) {
                const oneUShort = Buffer.alloc(2);
                oneUShort.writeUInt16LE(value.toNumber());
                writer.writeSlice(oneUShort);
            }
            else if (key == VDXF_Data.DataInt32Key.vdxfid) {
                const oneInt = Buffer.alloc(4);
                oneInt.writeInt32LE(value.toNumber());
                writer.writeSlice(oneInt);
            }
            else if (key == VDXF_Data.DataUint32Key.vdxfid) {
                const oneUInt = Buffer.alloc(4);
                oneUInt.writeUInt32LE(value.toNumber());
                writer.writeSlice(oneUInt);
            }
            else if (key == VDXF_Data.DataInt64Key.vdxfid) {
                const oneInt64 = Buffer.alloc(8);
                oneInt64.writeBigInt64LE(BigInt(value.toString()));
                writer.writeSlice(oneInt64);
            }
            else if (key == VDXF_Data.DataUint160Key.vdxfid) {
                const oneKey = (0, address_1.fromBase58Check)(value).hash;
                writer.writeSlice(oneKey);
            }
            else if (key == VDXF_Data.DataUint256Key.vdxfid) {
                const oneHash = Buffer.from(value, "hex");
                if (oneHash.length != vdxf_1.HASH256_BYTE_LENGTH) {
                    throw new Error("contentmap: hash data must be exactly 32 bytes");
                }
                writer.writeVarSlice(oneHash.reverse());
            }
            else if (key == VDXF_Data.DataStringKey.vdxfid) {
                const valBuf = Buffer.from(value, "utf-8");
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(new bn_js_1.BN(1));
                writer.writeCompactSize(valBuf.length + varuint_1.default.encodingLength(valBuf.length));
                writer.writeVarSlice(valBuf);
            }
            else if (key == VDXF_Data.DataByteVectorKey.vdxfid) {
                const valBuf = Buffer.from(value, "hex");
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(new bn_js_1.BN(1));
                writer.writeCompactSize(varuint_1.default.encodingLength(valBuf.length) + valBuf.length);
                writer.writeVarSlice(valBuf);
            }
            else if (key == VDXF_Data.DataCurrencyMapKey.vdxfid) {
                const oneCurMap = new CurrencyValueMap_1.CurrencyValueMap(Object.assign(Object.assign({}, value), { multivalue: true }));
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(new bn_js_1.BN(1));
                writer.writeCompactSize(oneCurMap.getByteLength());
                writer.writeSlice(oneCurMap.toBuffer());
            }
            else if (key == VDXF_Data.DataRatingsKey.vdxfid) {
                const oneRatingMap = new Rating_1.Rating(value);
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(oneRatingMap.version);
                writer.writeCompactSize(oneRatingMap.getByteLength());
                writer.writeSlice(oneRatingMap.toBuffer());
            }
            else if (key == VDXF_Data.CredentialKey.vdxfid) {
                const oneCredential = value;
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(oneCredential.version);
                writer.writeCompactSize(oneCredential.getByteLength());
                writer.writeSlice(oneCredential.toBuffer());
            }
            else if (key == VDXF_Data.DataTransferDestinationKey.vdxfid) {
                const transferDest = new TransferDestination_1.TransferDestination(value);
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(transferDest.typeNoFlags());
                writer.writeCompactSize(transferDest.getByteLength());
                writer.writeSlice(transferDest.toBuffer());
            }
            else if (key == VDXF_Data.ContentMultiMapRemoveKey.vdxfid) {
                const transferDest = new ContentMultiMapRemove_1.ContentMultiMapRemove(value);
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(transferDest.version);
                writer.writeCompactSize(transferDest.getByteLength());
                writer.writeSlice(transferDest.toBuffer());
            }
            else if (key == VDXF_Data.CrossChainDataRefKey.vdxfid) {
                const transferDest = value;
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(vdxf_1.VDXF_OBJECT_DEFAULT_VERSION);
                writer.writeCompactSize(transferDest.getByteLength());
                writer.writeSlice(transferDest.toBuffer());
            }
            else if (key == VDXF_Data.DataDescriptorKey.vdxfid) {
                const descr = new DataDescriptor_1.DataDescriptor(value);
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(descr.version);
                writer.writeCompactSize(descr.getByteLength());
                writer.writeSlice(descr.toBuffer());
            }
            else if (key == VDXF_Data.MMRDescriptorKey.vdxfid) {
                const descr = new MMRDescriptor_1.MMRDescriptor(value);
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(descr.version);
                writer.writeCompactSize(descr.getByteLength());
                writer.writeSlice(descr.toBuffer());
            }
            else if (key == VDXF_Data.SignatureDataKey.vdxfid) {
                const sigData = new SignatureData_1.SignatureData(value);
                writer.writeSlice((0, address_1.fromBase58Check)(key).hash);
                writer.writeVarInt(sigData.version);
                writer.writeCompactSize(sigData.getByteLength());
                writer.writeSlice(sigData.toBuffer());
            }
            else {
                throw new Error("contentmap invalid or unrecognized vdxfkey for object type: " + key);
            }
        }
        return writer.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        this.values = [];
        let bytesLeft = reader.buffer.length - reader.offset;
        while (bytesLeft > vdxf_1.HASH160_BYTE_LENGTH) // size of uint160
         {
            let pSuccess = { value: false };
            let objectUni;
            const initialOffset = reader.offset;
            try {
                let checkVal;
                let version = new bn_js_1.BN(0);
                let objSize = 0;
                checkVal = (0, address_1.toBase58Check)(reader.readSlice(vdxf_1.HASH160_BYTE_LENGTH), vdxf_1.I_ADDR_VERSION);
                if (checkVal == VDXF_Data.DataCurrencyMapKey.vdxfid) {
                    const oneCurrencyMap = new CurrencyValueMap_1.CurrencyValueMap({ multivalue: true });
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = oneCurrencyMap.fromBuffer(reader.buffer, reader.offset);
                    if (oneCurrencyMap.isValid()) {
                        objectUni = { key: checkVal, value: oneCurrencyMap };
                    }
                }
                else if (checkVal == VDXF_Data.DataRatingsKey.vdxfid) {
                    const oneRatingObj = new Rating_1.Rating();
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = oneRatingObj.fromBuffer(reader.buffer, reader.offset);
                    if (oneRatingObj.isValid()) {
                        objectUni = { key: checkVal, value: oneRatingObj };
                    }
                }
                else if (checkVal == VDXF_Data.CredentialKey.vdxfid) {
                    const credentialObj = new Credential_1.Credential();
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = credentialObj.fromBuffer(reader.buffer, reader.offset);
                    if (credentialObj.isValid()) {
                        objectUni = { key: checkVal, value: credentialObj };
                    }
                }
                else if (checkVal == VDXF_Data.DataTransferDestinationKey.vdxfid) {
                    const oneTransferDest = new TransferDestination_1.TransferDestination();
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = oneTransferDest.fromBuffer(reader.buffer, reader.offset);
                    if (oneTransferDest.isValid()) {
                        objectUni = { key: checkVal, value: oneTransferDest };
                    }
                }
                else if (checkVal == VDXF_Data.ContentMultiMapRemoveKey.vdxfid) {
                    const contentMap = new ContentMultiMapRemove_1.ContentMultiMapRemove();
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = contentMap.fromBuffer(reader.buffer, reader.offset);
                    if (contentMap.isValid()) {
                        objectUni = { key: checkVal, value: contentMap };
                    }
                }
                else if (checkVal == VDXF_Data.DataStringKey.vdxfid) {
                    let stringVal;
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    stringVal = reader.readVarSlice().toString('utf8');
                    objectUni = { key: checkVal, value: stringVal };
                }
                else if (checkVal == VDXF_Data.DataByteVectorKey.vdxfid) {
                    let vecVal;
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    vecVal = reader.readVarSlice();
                    objectUni = { key: checkVal, value: vecVal.toString('hex') };
                }
                else if (checkVal == VDXF_Data.CrossChainDataRefKey.vdxfid) {
                    const dataRef = new CrossChainDataRef_1.CrossChainDataRef();
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = dataRef.fromBuffer(reader.buffer, reader.offset);
                    if (dataRef.isValid()) {
                        objectUni = { key: checkVal, value: dataRef };
                    }
                }
                else if (checkVal == VDXF_Data.DataDescriptorKey.vdxfid) {
                    const dataDescriptor = new DataDescriptor_1.DataDescriptor();
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = dataDescriptor.fromBuffer(reader.buffer, reader.offset);
                    if (dataDescriptor.isValid()) {
                        objectUni = { key: checkVal, value: dataDescriptor };
                    }
                }
                else if (checkVal == VDXF_Data.MMRDescriptorKey.vdxfid) {
                    const mmrDescriptor = new MMRDescriptor_1.MMRDescriptor();
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = mmrDescriptor.fromBuffer(reader.buffer, reader.offset);
                    if (mmrDescriptor.isValid()) {
                        objectUni = { key: checkVal, value: mmrDescriptor };
                    }
                }
                else if (checkVal == VDXF_Data.SignatureDataKey.vdxfid) {
                    const sigData = new SignatureData_1.SignatureData();
                    version = reader.readVarInt();
                    objSize = reader.readCompactSize();
                    reader.offset = sigData.fromBuffer(reader.buffer, reader.offset);
                    if (sigData.isValid()) {
                        objectUni = { key: checkVal, value: sigData };
                    }
                }
                // if we have an object that we recognized, encode it
                if (objectUni && objectUni.key && objectUni.value) {
                    if (pSuccess != null) {
                        pSuccess.value = true;
                    }
                }
                else {
                    if (pSuccess != null) {
                        pSuccess.value = false;
                    }
                }
            }
            catch (e) {
                if (pSuccess != null) {
                    pSuccess.value = false;
                }
            }
            bytesLeft = reader.buffer.length - reader.offset;
            if ((pSuccess === null || pSuccess === void 0 ? void 0 : pSuccess.value) && (pSuccess === null || pSuccess === void 0 ? void 0 : pSuccess.value)) {
                this.values.push({ [objectUni.key]: objectUni.value });
            }
            else {
                // add the remaining data as a hex string
                reader.offset = initialOffset;
                this.values.push({ [""]: reader.readSlice(reader.buffer.length - reader.offset) });
                bytesLeft = 0;
                break;
            }
        }
        if (bytesLeft && bytesLeft <= vdxf_1.HASH160_BYTE_LENGTH) {
            this.values.push({ [""]: reader.readSlice(bytesLeft) });
        }
        return reader.offset;
    }
    static fromJson(obj) {
        const arrayItem = new Array;
        if (!Array.isArray(obj)) {
            if (typeof (obj) != 'object') {
                if (typeof (obj) != 'string')
                    throw new Error('Not JSON string as expected');
                if ((0, string_1.isHexString)(obj)) {
                    arrayItem.push({ [""]: Buffer.from(obj, "hex") });
                    return new VdxfUniValue({
                        values: arrayItem
                    });
                }
                arrayItem.push({ [""]: Buffer.from(obj, "utf-8") });
                return new VdxfUniValue({
                    values: arrayItem
                });
            }
            if (obj.serializedhex) {
                if (!(0, string_1.isHexString)(obj.serializedhex)) {
                    throw new Error("contentmap: If the \"serializedhex\" key is present, it's data must be only valid hex and complete");
                }
                arrayItem.push({ [""]: Buffer.from(obj.serializedhex, "hex") });
                return new VdxfUniValue({
                    values: arrayItem
                });
            }
            if (obj.serializedbase64) {
                try {
                    arrayItem.push({ [""]: Buffer.from(obj.serializedbase64, "base64") });
                    return new VdxfUniValue({
                        values: arrayItem
                    });
                }
                catch (e) {
                    throw new Error("contentmap: If the \"serializedbase64\" key is present, it's data must be only valid base64 and complete");
                }
            }
            if (obj.message) {
                arrayItem.push({ [""]: Buffer.from(obj.message, "utf-8") });
                return new VdxfUniValue({
                    values: arrayItem
                });
            }
        }
        if (!Array.isArray(obj)) {
            obj = [obj];
        }
        // this should be an object with "vdxfkey" as the key and {object} as the json object to serialize
        for (let i = 0; i < obj.length; i++) {
            if (typeof (obj[i]) != 'object') {
                if (typeof (obj[i]) != 'string')
                    throw new Error('Not JSON string as expected');
                if ((0, string_1.isHexString)(obj[i])) {
                    arrayItem.push({ [""]: Buffer.from(obj[i], "hex") });
                    continue;
                }
                arrayItem.push({ [""]: Buffer.from(obj[i], "utf-8") });
                continue;
            }
            const oneValKeys = Object.keys(obj[i]);
            const oneValValues = Object.values(obj[i]);
            for (let k = 0; k < oneValKeys.length; k++) {
                const objTypeKey = oneValKeys[k];
                if (objTypeKey == VDXF_Data.DataByteKey.vdxfid) {
                    const oneByte = Buffer.from(oneValValues[k], "hex");
                    if (oneByte.length != 1) {
                        throw new Error("contentmap: byte data must be exactly one byte");
                    }
                    arrayItem.push({ [objTypeKey]: oneByte });
                }
                else if (objTypeKey == VDXF_Data.DataInt16Key.vdxfid) {
                    const oneShort = Buffer.alloc(2);
                    oneShort.writeInt16LE(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: oneShort });
                }
                else if (objTypeKey == VDXF_Data.DataUint16Key.vdxfid) {
                    const oneUShort = Buffer.alloc(2);
                    oneUShort.writeUInt16LE(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: oneUShort });
                }
                else if (objTypeKey == VDXF_Data.DataInt32Key.vdxfid) {
                    const oneInt = Buffer.alloc(4);
                    oneInt.writeInt32LE(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: oneInt });
                }
                else if (objTypeKey == VDXF_Data.DataUint32Key.vdxfid) {
                    const oneUInt = Buffer.alloc(4);
                    oneUInt.writeUInt32LE(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: oneUInt });
                }
                else if (objTypeKey == VDXF_Data.DataInt64Key.vdxfid) {
                    const oneInt64 = Buffer.alloc(8);
                    oneInt64.writeIntLE(oneValValues[k], 0, 8);
                    arrayItem.push({ [objTypeKey]: oneInt64 });
                }
                else if (objTypeKey == VDXF_Data.DataUint160Key.vdxfid) {
                    (0, address_1.fromBase58Check)(oneValValues[k]).hash;
                    arrayItem.push({ [objTypeKey]: oneValValues[k] });
                }
                else if (objTypeKey == VDXF_Data.DataUint256Key.vdxfid) {
                    const oneHash = Buffer.from(oneValValues[k], "hex");
                    if (oneHash.length != vdxf_1.HASH256_BYTE_LENGTH) {
                        throw new Error("contentmap: hash data must be exactly 32 bytes");
                    }
                    arrayItem.push({ [objTypeKey]: oneHash });
                }
                else if (objTypeKey == VDXF_Data.DataStringKey.vdxfid) {
                    arrayItem.push({ [objTypeKey]: oneValValues[k] });
                }
                else if (objTypeKey == VDXF_Data.DataByteVectorKey.vdxfid) {
                    if (!(0, string_1.isHexString)(oneValValues[k])) {
                        throw new Error("contentmap: bytevector data must be valid hex");
                    }
                    arrayItem.push({ [objTypeKey]: Buffer.from(oneValValues[k], "hex") });
                }
                else if (objTypeKey == VDXF_Data.DataCurrencyMapKey.vdxfid) {
                    const oneCurMap = CurrencyValueMap_1.CurrencyValueMap.fromJson(oneValValues[k], true);
                    arrayItem.push({ [objTypeKey]: oneCurMap });
                }
                else if (objTypeKey == VDXF_Data.DataRatingsKey.vdxfid) {
                    const oneRatingMap = Rating_1.Rating.fromJson(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: oneRatingMap });
                }
                else if (objTypeKey == VDXF_Data.DataTransferDestinationKey.vdxfid) {
                    const transferDest = TransferDestination_1.TransferDestination.fromJson(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: transferDest });
                }
                else if (objTypeKey == VDXF_Data.ContentMultiMapRemoveKey.vdxfid) {
                    const content = ContentMultiMapRemove_1.ContentMultiMapRemove.fromJson(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: content });
                }
                else if (objTypeKey == VDXF_Data.CrossChainDataRefKey.vdxfid) {
                    const crossChainRefKey = CrossChainDataRef_1.CrossChainDataRef.fromJson(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: crossChainRefKey });
                }
                else if (objTypeKey == VDXF_Data.DataDescriptorKey.vdxfid) {
                    const descriptor = DataDescriptor_1.DataDescriptor.fromJson(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: descriptor });
                }
                else if (objTypeKey == VDXF_Data.MMRDescriptorKey.vdxfid) {
                    const mmrDescriptor = MMRDescriptor_1.MMRDescriptor.fromJson(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: mmrDescriptor });
                }
                else if (objTypeKey == VDXF_Data.SignatureDataKey.vdxfid) {
                    const sigData = SignatureData_1.SignatureData.fromJson(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: sigData });
                }
                else if (objTypeKey == VDXF_Data.CredentialKey.vdxfid) {
                    const oneCredential = Credential_1.Credential.fromJson(oneValValues[k]);
                    arrayItem.push({ [objTypeKey]: oneCredential });
                }
                else {
                    throw new Error("Unknown vdxfkey: " + oneValValues[k]);
                }
            }
        }
        return new VdxfUniValue({
            values: arrayItem
        });
    }
    toJson() {
        let ret = [];
        for (const inner of this.values) {
            const key = Object.keys(inner)[0];
            const value = inner[key];
            if (key === "" && Buffer.isBuffer(value)) {
                ret.push(value.toString('hex'));
            }
            else if (Buffer.isBuffer(value)) {
                ret.push({ [key]: value.toString('hex') });
            }
            else if (typeof (value) === 'string') {
                ret.push({ [key]: value });
            }
            else if (value instanceof bn_js_1.BN) {
                ret.push({ [key]: value.toString(10) });
            }
            else {
                ret.push({ [key]: value.toJson() });
            }
        }
        if (ret && ret.length == 1) {
            return ret[0];
        }
        return ret;
    }
}
exports.VdxfUniValue = VdxfUniValue;
