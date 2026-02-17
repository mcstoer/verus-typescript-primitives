export interface SerializableEntity {
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number, ...additionalArgs: any[]): number;
    getByteLength(): number;
}
export interface SerializableDataEntity {
    getDataByteLength(): number;
    toDataBuffer(): Buffer;
    fromDataBuffer(buffer: Buffer): void;
}
