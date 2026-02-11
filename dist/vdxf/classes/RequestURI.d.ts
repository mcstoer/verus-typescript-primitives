import { BigNumber } from "../../utils/types/BigNumber";
import { ResponseURI, ResponseURIJson } from "./ResponseURI";
export type RequestURIJson = ResponseURIJson;
export declare class RequestURI extends ResponseURI {
    constructor(data?: {
        uri?: Buffer;
        type?: BigNumber;
    });
    static fromUriString(str: string): RequestURI;
    fromBuffer(buffer: Buffer, offset?: number): number;
    static fromJson(json: RequestURIJson): RequestURI;
    private assertPostType;
}
