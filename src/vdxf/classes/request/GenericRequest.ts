import {
  WALLET_VDXF_KEY,
  GENERIC_REQUEST_DEEPLINK_VDXF_KEY,
  VDXFObject,
  VerusIDSignature,
  VerusIDSignatureInterface,
  VerusIDSignatureJson,
} from "../../";
import { IDENTITY_AUTH_SIG_VDXF_KEY } from "../../keys";
import { Hash160 } from "./../Hash160";
import bufferutils from "../../../utils/bufferutils";
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION, VERUS_DATA_SIGNATURE_PREFIX } from "../../../constants/vdxf";
import { fromBase58Check, toBase58Check } from "../../../utils/address";
import createHash = require("create-hash");
import base64url from "base64url";
import { BN } from 'bn.js';
import { BigNumber } from "../../../utils/types/BigNumber";
import { DataDescriptor, DataDescriptorJson } from "../../../pbaas";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "../payment/VerusPayInvoiceDetails";

export const GENERIC_REQUEST_VERSION_CURRENT = new BN(1, 10)
export const GENERIC_REQUEST_VERSION_FIRSTVALID = new BN(1, 10)
export const GENERIC_REQUEST_VERSION_LASTVALID = new BN(1, 10)

export const GENERIC_REQUEST_TYPE_DATA_DESCRIPTOR = new BN(0, 10)
export const GENERIC_REQUEST_TYPE_INVOICE = new BN(1, 0)

export const GENERIC_REQUEST_BASE_FLAGS = new BN(0, 0)
export const GENERIC_REQUEST_FLAG_SIGNED = new BN(1, 0)

export type GenericRequestDetails = DataDescriptor | VerusPayInvoiceDetails;
export type GenericRequestDetailsJson = DataDescriptorJson | VerusPayInvoiceDetailsJson;

export interface GenericRequestInterface {
  details: GenericRequestDetails;
  type?: BigNumber;
  flags?: BigNumber;
  system_id?: string;
  signing_id?: string;
  signature?: VerusIDSignatureInterface;
  version?: BigNumber;
}

export type GenericRequestJson = {
  vdxfkey: string,
  details: GenericRequestDetailsJson;
  system_id?: string;
  signing_id?: string;
  signature?: VerusIDSignatureJson;
  version: string;
  type?: string;
  flags?: string;
}

export class GenericRequest extends VDXFObject {
  system_id: string;
  signing_id: string;
  signature?: VerusIDSignature;
  details: GenericRequestDetails;
  type: BigNumber;
  flags: BigNumber;

  constructor(
    request: GenericRequestInterface = {
      details: new DataDescriptor(),
      type: GENERIC_REQUEST_TYPE_DATA_DESCRIPTOR,
      flags: GENERIC_REQUEST_BASE_FLAGS
    }
  ) {
    super(GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid);

    this.system_id = request.system_id;
    this.signing_id = request.signing_id;
    this.signature = request.signature
      ? new VerusIDSignature(
          request.signature,
          IDENTITY_AUTH_SIG_VDXF_KEY,
          false
        )
      : undefined;
    this.details = request.details;

    if (request.type) this.type = request.type;
    else this.type = GENERIC_REQUEST_TYPE_DATA_DESCRIPTOR;

    if (request.flags) this.flags = request.flags;
    else this.flags = GENERIC_REQUEST_BASE_FLAGS;

    if (request.version) this.version = request.version;
    else this.version = GENERIC_REQUEST_VERSION_CURRENT;
  }

  isValidVersion(): boolean {
    return this.version.gte(GENERIC_REQUEST_VERSION_FIRSTVALID) && this.version.lte(GENERIC_REQUEST_VERSION_LASTVALID);
  }

  isSigned() {
    return !!(this.flags.and(GENERIC_REQUEST_FLAG_SIGNED).toNumber());
  }

  isDataDescriptor() {
    return this.type.eq(GENERIC_REQUEST_TYPE_DATA_DESCRIPTOR);
  }

  isInvoice() {
    return this.type.eq(GENERIC_REQUEST_TYPE_INVOICE);
  }

  setSigned() {
    this.flags = this.version.xor(GENERIC_REQUEST_FLAG_SIGNED);
  }

  private getRawDetailsSha256() {
    return createHash("sha256").update(this.details.toBuffer()).digest();
  }

  getDetailsHash(signedBlockheight: number, signatureVersion: number = 2) {
    if (this.isSigned()) {
      var heightBufferWriter = new bufferutils.BufferWriter(
        Buffer.allocUnsafe(4)
      );
      heightBufferWriter.writeUInt32(signedBlockheight);
  
      if (signatureVersion === 1) {
        return createHash("sha256")
          .update(VERUS_DATA_SIGNATURE_PREFIX)
          .update(fromBase58Check(this.system_id).hash)
          .update(heightBufferWriter.buffer)
          .update(fromBase58Check(this.signing_id).hash)
          .update(this.getRawDetailsSha256())
          .digest();
      } else {
        return createHash("sha256")
          .update(fromBase58Check(this.system_id).hash)
          .update(heightBufferWriter.buffer)
          .update(fromBase58Check(this.signing_id).hash)
          .update(VERUS_DATA_SIGNATURE_PREFIX)
          .update(this.getRawDetailsSha256())
          .digest();
      }
    } else return this.getRawDetailsSha256()
  }

  protected _dataByteLength(signer: string = this.signing_id): number {
    if (this.isSigned()) {
      let length = 0;
  
      const _signature = this.signature
        ? this.signature
        : new VerusIDSignature(
            { signature: "" },
            IDENTITY_AUTH_SIG_VDXF_KEY,
            false
          );
  
      const _system_id = Hash160.fromAddress(this.system_id);
      length += _system_id.getByteLength();
  
      const _signing_id = Hash160.fromAddress(signer);
      length += _signing_id.getByteLength();

      length += _signature.byteLength();
      length += this.details.getByteLength();
  
      return length;
    } else return this.details.getByteLength()
  }

  protected _toDataBuffer(signer: string = this.signing_id): Buffer {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.dataByteLength())
    );

    if (this.isSigned()) {
      const _signing_id = Hash160.fromAddress(signer);
      const _signature = this.signature
        ? this.signature
        : new VerusIDSignature(
            { signature: "" },
            IDENTITY_AUTH_SIG_VDXF_KEY,
            false
          );
  
      const _system_id = Hash160.fromAddress(this.system_id);
      writer.writeSlice(_system_id.toBuffer());
  
      writer.writeSlice(_signing_id.toBuffer());
  
      writer.writeSlice(_signature.toBuffer());
    }

    writer.writeSlice(this.details.toBuffer());

    return writer.buffer;
  }

  dataByteLength(): number {
    return this._dataByteLength();
  }

  toDataBuffer(): Buffer {
    return this._toDataBuffer();
  }

  protected _fromDataBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);
    const reqLength = reader.readCompactSize();

    if (reqLength == 0) {
      throw new Error("Cannot create request from empty buffer");
    } else {
      if (this.isSigned()) {
        this.system_id = toBase58Check(
          reader.readSlice(HASH160_BYTE_LENGTH),
          I_ADDR_VERSION
        );
  
        this.signing_id = toBase58Check(
          reader.readSlice(HASH160_BYTE_LENGTH),
          I_ADDR_VERSION
        );
  
        const _sig = new VerusIDSignature(undefined, IDENTITY_AUTH_SIG_VDXF_KEY, false);
        reader.offset = _sig.fromBuffer(reader.buffer, reader.offset, IDENTITY_AUTH_SIG_VDXF_KEY.vdxfid);
        this.signature = _sig;
      }
      
      const _details = new VerusPayInvoiceDetails();
      reader.offset = _details.fromBuffer(reader.buffer, reader.offset);
      this.details = _details;
    }

    return reader.offset;
  }

  fromDataBuffer(buffer: Buffer, offset?: number): number {
    return this._fromDataBuffer(buffer, offset);
  }

  toWalletDeeplinkUri(): string {
    return `${WALLET_VDXF_KEY.vdxfid.toLowerCase()}://x-callback-url/${
      GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid
    }/${this.toString(false)}`;
  }

  static fromWalletDeeplinkUri(uri: string): GenericRequest {
    const split = uri.split(`${GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/`);
    const inv = new GenericRequest();
    inv.fromBuffer(base64url.toBuffer(split[1]), 0, GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid);

    return inv;
  }

  toQrString(): string {
    return this.toString(true);
  }

  static fromQrString(qrstring: string): GenericRequest {
    const inv = new GenericRequest();
    inv.fromBuffer(base64url.toBuffer(qrstring), 0);

    return inv;
  }

  static fromJson(data: GenericRequestJson): GenericRequest {
    const type: BigNumber = data.type ? new BN(data.type) : GENERIC_REQUEST_TYPE_DATA_DESCRIPTOR;

    let details: GenericRequestDetails;

    if (type.eq(GENERIC_REQUEST_TYPE_INVOICE)) {
      details = VerusPayInvoiceDetails.fromJson(data.details as VerusPayInvoiceDetailsJson);
    } else {
      details = DataDescriptor.fromJson(data.details as DataDescriptorJson);
    }

    return new GenericRequest({
      details,
      signature: data.signature != null ? VerusIDSignature.fromJson(data.signature) : undefined,
      signing_id: data.signing_id,
      system_id: data.system_id,
      version: new BN(data.version),
      type: new BN(data.type),
      flags: new BN(data.flags)
    })
  }

  toJson(): GenericRequestJson {
    return {
      vdxfkey: this.vdxfkey,
      system_id: this.system_id,
      signing_id: this.signing_id,
      signature: this.isSigned() ? this.signature.toJson() : this.signature,
      details: this.details.toJson(),
      version: this.version.toString(),
      type: this.type.toString(),
      flags: this.flags.toString()
    };
  }
}
