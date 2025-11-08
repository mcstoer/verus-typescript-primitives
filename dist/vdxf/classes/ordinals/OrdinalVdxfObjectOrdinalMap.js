"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdinalVdxfObjectOrdinalMap = void 0;
// Singleton class that exists to create a bidirectional map of ordinals <-> vdxf keys
class _OrdinalVdxfObjectOrdinalMap {
    constructor() {
        this.keyToOrdinalMap = new Map();
        this.ordinalToKeyMap = new Map();
        this.keyToOrdinalClass = new Map();
    }
    updateOrdinalToKeyMap() {
        this.ordinalToKeyMap = new Map(Array.from(this.keyToOrdinalMap, a => a.reverse()));
    }
    registerOrdinal(ordinal, vdxfKey, ordinalClass, throwOnDuplicate = true) {
        if (this.isRecognizedOrdinal(ordinal) || this.vdxfKeyHasOrdinal(vdxfKey)) {
            if (throwOnDuplicate)
                throw new Error("Cannot overwrite existing ordinal");
            else
                return;
        }
        this.keyToOrdinalMap.set(vdxfKey, ordinal);
        this.keyToOrdinalClass.set(vdxfKey, ordinalClass);
        this.updateOrdinalToKeyMap();
    }
    isRecognizedOrdinal(ordinal) {
        return this.ordinalToKeyMap.has(ordinal);
    }
    vdxfKeyHasOrdinal(vdxfKey) {
        return this.keyToOrdinalMap.has(vdxfKey);
    }
    hasClassForVdxfKey(vdxfKey) {
        return this.keyToOrdinalClass.has(vdxfKey);
    }
    getOrdinalForVdxfKey(vdxfKey) {
        return this.keyToOrdinalMap.get(vdxfKey);
    }
    getVdxfKeyForOrdinal(ordinal) {
        return this.ordinalToKeyMap.get(ordinal);
    }
    getClassForVdxfKey(vdxfKey) {
        return this.keyToOrdinalClass.get(vdxfKey);
    }
}
exports.OrdinalVdxfObjectOrdinalMap = new _OrdinalVdxfObjectOrdinalMap();
