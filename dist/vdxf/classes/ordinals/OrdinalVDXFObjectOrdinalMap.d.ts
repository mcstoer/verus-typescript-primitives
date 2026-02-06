import { OrdinalVDXFObjectClass } from "./OrdinalVDXFObject";
declare class _OrdinalVDXFObjectOrdinalMap {
    private keyToOrdinalMap;
    private ordinalToKeyMap;
    keyToOrdinalClass: Map<string, OrdinalVDXFObjectClass>;
    constructor();
    private updateOrdinalToKeyMap;
    registerOrdinal(ordinal: number, vdxfKey: string, ordinalClass: OrdinalVDXFObjectClass, throwOnDuplicate?: boolean): void;
    isRecognizedOrdinal(ordinal: number): boolean;
    vdxfKeyHasOrdinal(vdxfKey: string): boolean;
    hasClassForVdxfKey(vdxfKey: string): boolean;
    getOrdinalForVdxfKey(vdxfKey: string): number;
    getVdxfKeyForOrdinal(ordinal: number): string;
    getClassForVdxfKey(vdxfKey: string): OrdinalVDXFObjectClass;
}
export declare const OrdinalVDXFObjectOrdinalMap: _OrdinalVDXFObjectOrdinalMap;
export {};
