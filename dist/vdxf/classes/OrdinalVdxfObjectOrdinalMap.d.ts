declare class _OrdinalVdxfObjectOrdinalMap {
    private keyToOrdinalMap;
    private ordinalToKeyMap;
    constructor();
    private updateOrdinalToKeyMap;
    registerOrdinal(ordinal: number, vdxfKey: string): void;
    isRecognizedOrdinal(ordinal: number): boolean;
    vdxfKeyHasOrdinal(vdxfKey: string): boolean;
    getOrdinalForVdxfKey(vdxfKey: string): number;
    getVdxfKeyForOrdinal(ordinal: number): string;
}
export declare const OrdinalVdxfObjectOrdinalMap: _OrdinalVdxfObjectOrdinalMap;
export {};
