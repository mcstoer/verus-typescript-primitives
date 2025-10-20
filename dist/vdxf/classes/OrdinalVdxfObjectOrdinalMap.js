"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdinalVdxfObjectOrdinalMap = void 0;
// Singleton class that exists to create a bidirectional map of ordinals <-> vdxf keys
class _OrdinalVdxfObjectOrdinalMap {
    constructor() {
        this.keyToOrdinalMap = new Map();
        this.ordinalToKeyMap = new Map();
    }
    updateOrdinalToKeyMap() {
        this.ordinalToKeyMap = new Map(Array.from(this.keyToOrdinalMap, a => a.reverse()));
    }
    registerOrdinal(ordinal, vdxfKey) {
        if (this.isRecognizedOrdinal(ordinal))
            throw new Error("Cannot register new ordinal for existing vdxfkey");
        if (this.vdxfKeyHasOrdinal(vdxfKey))
            throw new Error("Cannot register new key for existing ordinal");
        this.keyToOrdinalMap.set(vdxfKey, ordinal);
        this.updateOrdinalToKeyMap();
    }
    isRecognizedOrdinal(ordinal) {
        return this.ordinalToKeyMap.has(ordinal);
    }
    vdxfKeyHasOrdinal(vdxfKey) {
        return this.keyToOrdinalMap.has(vdxfKey);
    }
    getOrdinalForVdxfKey(vdxfKey) {
        return this.keyToOrdinalMap.get(vdxfKey);
    }
    getVdxfKeyForOrdinal(ordinal) {
        return this.ordinalToKeyMap.get(ordinal);
    }
}
exports.OrdinalVdxfObjectOrdinalMap = new _OrdinalVdxfObjectOrdinalMap();
