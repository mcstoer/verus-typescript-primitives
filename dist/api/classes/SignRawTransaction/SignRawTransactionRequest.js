"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignRawTransactionRequest = void 0;
const ApiRequest_1 = require("../../ApiRequest");
const cmds_1 = require("../../../constants/cmds");
class SignRawTransactionRequest extends ApiRequest_1.ApiRequest {
    constructor(chain, hexstring, prevtxs, sighashtype, branchid) {
        super(chain, cmds_1.SIGN_RAW_TRANSACTION);
        this.hexstring = hexstring;
        this.prevtxs = prevtxs;
        this.sighashtype = sighashtype;
        this.branchid = branchid;
    }
    getParams() {
        const params = [
            this.hexstring,
            this.prevtxs,
            this.sighashtype,
            this.branchid
        ];
        return params.filter((x) => x != null);
    }
    static fromJson(object) {
        return new SignRawTransactionRequest(object.chain, object.hexstring, object.prevtxs != null ? object.prevtxs : undefined, object.sighashtype != null ? object.sighashtype : undefined, object.branchid != null ? object.branchid : undefined);
    }
    toJson() {
        return {
            chain: this.chain,
            hexstring: this.hexstring,
            prevtxs: this.prevtxs,
            sighashtype: this.sighashtype,
            branchid: this.branchid,
        };
    }
}
exports.SignRawTransactionRequest = SignRawTransactionRequest;
