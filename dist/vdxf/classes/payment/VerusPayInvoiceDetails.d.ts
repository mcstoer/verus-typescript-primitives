import { BigNumber } from '../../../utils/types/BigNumber';
import { TransferDestination, TransferDestinationJson } from '../../../pbaas/TransferDestination';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
export declare const VERUSPAY_INVALID: import("bn.js");
export declare const VERUSPAY_VALID: import("bn.js");
export declare const VERUSPAY_ACCEPTS_CONVERSION: import("bn.js");
export declare const VERUSPAY_ACCEPTS_NON_VERUS_SYSTEMS: import("bn.js");
export declare const VERUSPAY_EXPIRES: import("bn.js");
export declare const VERUSPAY_ACCEPTS_ANY_DESTINATION: import("bn.js");
export declare const VERUSPAY_ACCEPTS_ANY_AMOUNT: import("bn.js");
export declare const VERUSPAY_EXCLUDES_VERUS_BLOCKCHAIN: import("bn.js");
export declare const VERUSPAY_IS_TESTNET: import("bn.js");
export type VerusPayInvoiceDetailsJson = {
    flags?: string;
    amount?: string;
    destination?: TransferDestinationJson;
    requestedcurrencyid: string;
    expiryheight?: string;
    maxestimatedslippage?: string;
    acceptedsystems?: Array<string>;
};
export declare class VerusPayInvoiceDetails implements SerializableEntity {
    flags: BigNumber;
    amount: BigNumber;
    destination: TransferDestination;
    requestedcurrencyid: string;
    expiryheight: BigNumber;
    maxestimatedslippage: BigNumber;
    acceptedsystems: Array<string>;
    constructor(data?: {
        flags?: BigNumber;
        amount?: BigNumber;
        destination?: TransferDestination;
        requestedcurrencyid: string;
        expiryheight?: BigNumber;
        maxestimatedslippage?: BigNumber;
        acceptedsystems?: Array<string>;
    });
    setFlags(flags: {
        acceptsConversion?: boolean;
        acceptsNonVerusSystems?: boolean;
        expires?: boolean;
        acceptsAnyAmount?: boolean;
        acceptsAnyDestination?: boolean;
        excludesVerusBlockchain?: boolean;
        isTestnet?: boolean;
    }): void;
    getFlagsJson(): {
        [key: string]: boolean;
    };
    toSha256(): Buffer<ArrayBufferLike>;
    acceptsConversion(): boolean;
    acceptsNonVerusSystems(): boolean;
    acceptsAnyAmount(): boolean;
    acceptsAnyDestination(): boolean;
    expires(): boolean;
    excludesVerusBlockchain(): boolean;
    isTestnet(): boolean;
    isValid(): boolean;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    static fromJson(data: VerusPayInvoiceDetailsJson): VerusPayInvoiceDetails;
    toJson(): VerusPayInvoiceDetailsJson;
}
