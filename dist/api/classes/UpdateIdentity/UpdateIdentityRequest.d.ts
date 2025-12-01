import { ApiRequest } from "../../ApiRequest";
import { ApiPrimitiveJson, RequestParams } from "../../ApiPrimitive";
import { VerusCLIVerusIDJsonWithData } from "../../../vdxf/classes";
export declare class UpdateIdentityRequest extends ApiRequest {
    jsonidentity: VerusCLIVerusIDJsonWithData;
    returntx?: boolean;
    tokenupdate?: boolean;
    feeoffer?: number;
    sourceoffunds?: string;
    constructor(chain: string, jsonidentity: VerusCLIVerusIDJsonWithData, returntx?: boolean, tokenupdate?: boolean, feeoffer?: number, sourceoffunds?: string);
    getParams(): RequestParams;
    static fromJson(object: ApiPrimitiveJson): UpdateIdentityRequest;
    toJson(): ApiPrimitiveJson;
}
