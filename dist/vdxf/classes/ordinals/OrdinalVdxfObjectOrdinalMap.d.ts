import { OrdinalVdxfObjectClass } from "./OrdinalVdxfObject";
declare class _OrdinalVdxfObjectOrdinalMap {
    private keyToOrdinalMap;
    private ordinalToKeyMap;
    keyToOrdinalClass: Map<string, OrdinalVdxfObjectClass>;
    constructor();
    private updateOrdinalToKeyMap;
    registerOrdinal(ordinal: number, vdxfKey: string, ordinalClass: OrdinalVdxfObjectClass, throwOnDuplicate?: boolean): void;
    isRecognizedOrdinal(ordinal: number): boolean;
    vdxfKeyHasOrdinal(vdxfKey: string): boolean;
    hasClassForVdxfKey(vdxfKey: string): boolean;
    getOrdinalForVdxfKey(vdxfKey: string): number;
    getVdxfKeyForOrdinal(ordinal: number): string;
    getClassForVdxfKey(vdxfKey: string): OrdinalVdxfObjectClass;
}
export declare const OrdinalVdxfObjectOrdinalMap: _OrdinalVdxfObjectOrdinalMap;
export {};
