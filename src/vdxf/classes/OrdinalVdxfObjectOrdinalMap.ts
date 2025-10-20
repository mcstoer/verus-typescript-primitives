// Singleton class that exists to create a bidirectional map of ordinals <-> vdxf keys
class _OrdinalVdxfObjectOrdinalMap {
  private keyToOrdinalMap: Map<string, number>;
  private ordinalToKeyMap: Map<number, string>;

  constructor() {
    this.keyToOrdinalMap = new Map();
    this.ordinalToKeyMap = new Map();
  }

  private updateOrdinalToKeyMap() {
    this.ordinalToKeyMap = new Map(Array.from(this.keyToOrdinalMap, a => a.reverse() as [number,string]));
  }

  registerOrdinal(ordinal: number, vdxfKey: string): void {
    if (this.isRecognizedOrdinal(ordinal)) throw new Error("Cannot register new ordinal for existing vdxfkey");
    if (this.vdxfKeyHasOrdinal(vdxfKey)) throw new Error("Cannot register new key for existing ordinal");

    this.keyToOrdinalMap.set(vdxfKey, ordinal);
    this.updateOrdinalToKeyMap();
  }

  isRecognizedOrdinal(ordinal: number): boolean {
    return this.ordinalToKeyMap.has(ordinal);
  }

  vdxfKeyHasOrdinal(vdxfKey: string): boolean {
    return this.keyToOrdinalMap.has(vdxfKey);
  }

  getOrdinalForVdxfKey(vdxfKey: string): number {
    return this.keyToOrdinalMap.get(vdxfKey);
  }

  getVdxfKeyForOrdinal(ordinal: number): string {
    return this.ordinalToKeyMap.get(ordinal);
  }
}

export const OrdinalVdxfObjectOrdinalMap = new _OrdinalVdxfObjectOrdinalMap();