export declare const fromBech32: (address: string) => {
    version: number;
    prefix: string;
    data: Buffer;
};
export declare const toBech32: (prefix: string, data: Buffer) => string;
export declare const convertBits: (data: Buffer, from: number, to: number, strictMode: boolean) => Buffer;
export declare const decodeSaplingAddress: (address: string) => {
    d: Buffer;
    pk_d: Buffer;
};
export declare const encodeSaplingAddress: (data: {
    d: Buffer;
    pk_d: Buffer;
}) => string;
export interface SaplingExtendedSpendingKeyData {
    depth: number;
    parentFVKTag: Buffer;
    childIndex: Buffer;
    chainCode: Buffer;
    ask: Buffer;
    nsk: Buffer;
    ovk: Buffer;
    dk: Buffer;
}
export interface SaplingExtendedViewingKeyData {
    depth: number;
    parentFVKTag: Buffer;
    childIndex: Buffer;
    chainCode: Buffer;
    ak: Buffer;
    nk: Buffer;
    ovk: Buffer;
    dk: Buffer;
}
export declare function decodeSaplingExtendedSpendingKey(encoded: string): SaplingExtendedSpendingKeyData;
export declare function encodeSaplingExtendedSpendingKey(data: SaplingExtendedSpendingKeyData, testnet?: boolean): string;
export declare function decodeSaplingExtendedViewingKey(encoded: string): SaplingExtendedViewingKeyData;
export declare function encodeSaplingExtendedViewingKey(data: SaplingExtendedViewingKeyData, testnet?: boolean): string;
