import { ApiResponse } from "../../ApiResponse";
export declare class SignRawTransactionResponse extends ApiResponse {
    result: {
        hex: string;
        complete: boolean;
        errors?: Array<{
            txid: string;
            vout: number;
            scriptSig: string;
            sequence: number;
            error: string;
        }>;
    };
}
