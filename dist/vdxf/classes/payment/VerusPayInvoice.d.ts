import { VDXFObject, VerusIDSignature, VerusIDSignatureInterface, VerusIDSignatureJson } from "../../";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "./VerusPayInvoiceDetails";
import { BigNumber } from "../../../utils/types/BigNumber";
export interface VerusPayInvoiceInterface {
    details: VerusPayInvoiceDetails;
    system_id?: string;
    signing_id?: string;
    signature?: VerusIDSignatureInterface;
    version?: BigNumber;
}
export type VerusPayInvoiceJson = {
    vdxfkey: string;
    details: VerusPayInvoiceDetailsJson;
    system_id?: string;
    signing_id?: string;
    signature?: VerusIDSignatureJson;
    version: string;
};
export declare class VerusPayInvoice extends VDXFObject {
    system_id: string;
    signing_id: string;
    signature?: VerusIDSignature;
    details: VerusPayInvoiceDetails;
    constructor(request?: VerusPayInvoiceInterface);
    getVersionNoFlags(): BigNumber;
    isValidVersion(): boolean;
    isSigned(): boolean;
    setSigned(): void;
    getDetailsHash(signedBlockheight: number, signatureVersion?: number): Buffer<ArrayBufferLike>;
    protected _dataByteLength(signer?: string): number;
    protected _toDataBuffer(signer?: string): Buffer;
    dataByteLength(): number;
    toDataBuffer(): Buffer;
    protected _fromDataBuffer(buffer: Buffer, offset?: number): number;
    fromDataBuffer(buffer: Buffer, offset?: number): number;
    toWalletDeeplinkUri(): string;
    static fromWalletDeeplinkUri(uri: string): VerusPayInvoice;
    toQrString(): string;
    static fromQrString(qrstring: string): VerusPayInvoice;
    static fromJson(data: VerusPayInvoiceJson): VerusPayInvoice;
    toJson(): VerusPayInvoiceJson;
}
