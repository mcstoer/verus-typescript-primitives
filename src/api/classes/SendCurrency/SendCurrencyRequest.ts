import { ApiRequest } from "../../ApiRequest";
import { ApiPrimitiveJson, RequestParams } from "../../ApiPrimitive";
import { SEND_CURRENCY } from "../../../constants/cmds";

type output = {
  currency: string;
  amount: number;
  convertto?: string;
  exportto?: string;
  exportid?: boolean;
  exportcurrency?: boolean;
  feecurrency?: string;
  via?: string;
  address: string;
  refundto?: string;
  memo?: string;
  preconvert?: boolean;
  burn?: boolean;
  mintnew?: boolean;
}

export class SendCurrencyRequest extends ApiRequest {
  fromaddress: string;
  outputs: Array<output>;
  minconf?: number;
  feeamount?: number;
  returntxtemplate?: boolean;

  constructor(chain: string, fromaddress: string, outputs: Array<output>, minconf?: number, feeamount?: number, returntxtemplate?: boolean) {
    super(chain, SEND_CURRENCY);
    this.fromaddress = fromaddress;
    this.outputs = outputs;
    this.minconf = minconf;
    this.feeamount = feeamount;
    this.returntxtemplate = returntxtemplate;
  }

  getParams(): RequestParams {
    const params = [
      this.fromaddress,
      this.outputs,
      this.minconf,
      this.feeamount,
      this.returntxtemplate
    ];

    if (this.returntxtemplate) return params
    else return params.filter((x) => x != null);
  }

  static fromJson(object: ApiPrimitiveJson): SendCurrencyRequest {
    return new SendCurrencyRequest(
      object.chain as string,
      object.fromaddress as string,
      object.outputs != null ? (object.utxos as Array<output>) : undefined,
      object.minconf != null ? (object.minconf as number) : undefined,
      object.feeamount != null ? (object.feeamount as number) : undefined,
      object.returntxtemplate != null ? (object.returntxtemplate as boolean) : undefined,
    );
  }

  toJson(): ApiPrimitiveJson {
    return {
      chain: this.chain,
      fromaddress: this.fromaddress,
      outputs: this.outputs,
      minconf: this.minconf,
      feeamount: this.feeamount,
      returntxtemplate: this.returntxtemplate,
    };
  }
}
