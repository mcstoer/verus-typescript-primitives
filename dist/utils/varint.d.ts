import { BigNumber } from './types/BigNumber';
declare function encode(number: BigNumber, buffer: Buffer, offset: number): {
    buffer: Buffer;
    bytes: number;
};
declare function decode(buffer: Buffer, offset: number): {
    decoded: BigNumber;
    bytes: number;
};
declare const _default: {
    encode: typeof encode;
    decode: typeof decode;
    encodingLength: (number: BigNumber) => number;
};
export default _default;
