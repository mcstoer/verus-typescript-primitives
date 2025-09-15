import {
  WALLET_VDXF_KEY,
  GENERIC_REQUEST_DEEPLINK_VDXF_KEY,
  VDXFObject,
  VerusIDSignature
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
import { DataDescriptor, DataDescriptorJson, SignatureData, SignatureJsonDataInterface } from "../../../pbaas";
import { VerusPayInvoiceDetails, VerusPayInvoiceDetailsJson } from "../payment/VerusPayInvoiceDetails";
import varint from "../../../utils/varint";

export type GenericRequestDetails = DataDescriptor | VerusPayInvoiceDetails;
export type GenericRequestDetailsJson = DataDescriptorJson | VerusPayInvoiceDetailsJson;

export interface GenericRequestInterface {
  version?: BigNumber;
  flags?: BigNumber;
  type?: BigNumber;
  system_id?: string;
  signing_id?: string;
  signature?: SignatureData;
  details: GenericRequestDetails;
}

export type GenericRequestJson = {
  flags?: string;
  type?: string;
  vdxfkey: string,
  details: GenericRequestDetailsJson;
  system_id?: string;
  signing_id?: string;
  signature?: SignatureJsonDataInterface;
  version: string;
}

export class GenericRequest extends VDXFObject {
  flags: BigNumber;
  type: BigNumber;
  system_id?: string;
  signing_id?: string;
  signature?: SignatureData;
  details: GenericRequestDetails;

  static VERSION_CURRENT = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static TYPE_DATA_DESCRIPTOR = new BN(0, 10)
  static TYPE_INVOICE = new BN(1, 10)

  static BASE_FLAGS = new BN(0, 10)
  static FLAG_SIGNED = new BN(1, 10)

  constructor(
    request: GenericRequestInterface = {
      details: new DataDescriptor(),
      type: GenericRequest.TYPE_DATA_DESCRIPTOR,
      flags: GenericRequest.BASE_FLAGS
    }
  ) {
    super(GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid);

    this.system_id = request.system_id;
    this.signing_id = request.signing_id;
    this.signature = request.signature;

    this.details = request.details;

    if (request.type) this.type = request.type;
    else this.type = GenericRequest.TYPE_DATA_DESCRIPTOR;

    if (request.flags) this.flags = request.flags;
    else this.flags = GenericRequest.BASE_FLAGS;

    if (request.version) this.version = request.version;
    else this.version = GenericRequest.VERSION_CURRENT;
  }

  isValidVersion(): boolean {
    return this.version.gte(GenericRequest.VERSION_FIRSTVALID) && this.version.lte(GenericRequest.VERSION_LASTVALID);
  }

  isSigned() {
    return !!(this.flags.and(GenericRequest.FLAG_SIGNED).toNumber());
  }

  isDataDescriptor() {
    return this.type.eq(GenericRequest.TYPE_DATA_DESCRIPTOR);
  }

  isInvoice() {
    return this.type.eq(GenericRequest.TYPE_INVOICE);
  }

  setSigned() {
    this.flags = this.version.xor(GenericRequest.FLAG_SIGNED);
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
    let length = 0;

    length += varint.encodingLength(this.flags);
    length += varint.encodingLength(this.type);

    if (this.isSigned()) {  
      const _signature = this.signature
        ? this.signature
        : new SignatureData();
  
      const _system_id = Hash160.fromAddress(this.system_id);
      length += _system_id.getByteLength();
  
      const _signing_id = Hash160.fromAddress(signer);
      length += _signing_id.getByteLength();

      length += _signature.getByteLength()
    }

    length += this.details.getByteLength();

    return length;
  }

  protected _toDataBuffer(signer: string = this.signing_id): Buffer {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.dataByteLength())
    );

    writer.writeVarInt(this.flags);
    writer.writeVarInt(this.type);

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
    if (buffer.length == 0) throw new Error("Cannot create request from empty buffer");
    
    const reader = new bufferutils.BufferReader(buffer, offset);
    const reqLength = reader.readCompactSize();

    if (reqLength == 0) {
      throw new Error("Cannot create request from empty buffer");
    } else {
      this.flags = reader.readVarInt();
      this.type = reader.readVarInt();

      if (this.isSigned()) {
        this.system_id = toBase58Check(
          reader.readSlice(HASH160_BYTE_LENGTH),
          I_ADDR_VERSION
        );
  
        this.signing_id = toBase58Check(
          reader.readSlice(HASH160_BYTE_LENGTH),
          I_ADDR_VERSION
        );
  
        const _sig = new SignatureData();
        reader.offset = _sig.fromBuffer(reader.buffer, reader.offset);
        this.signature = _sig;
      }

      let _details;
      
      if (this.type.eq(GenericRequest.TYPE_INVOICE)) {
        _details = new VerusPayInvoiceDetails();
      } else if (this.type.eq(GenericRequest.TYPE_DATA_DESCRIPTOR)) {
        _details = new DataDescriptor();
      } else throw new Error("Unrecognized type")

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
    const type: BigNumber = data.type ? new BN(data.type) : GenericRequest.TYPE_DATA_DESCRIPTOR;

    let details: GenericRequestDetails;

    if (type.eq(GenericRequest.TYPE_INVOICE)) {
      details = VerusPayInvoiceDetails.fromJson(data.details as VerusPayInvoiceDetailsJson);
    } else {
      details = DataDescriptor.fromJson(data.details as DataDescriptorJson);
    }

    return new GenericRequest({
      details,
      signature: data.signature != null ? SignatureData.fromJson(data.signature) : undefined,
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
      signature: this.isSigned() ? this.signature.toJson() : undefined,
      details: this.details.toJson(),
      version: this.version.toString(),
      type: this.type.toString(),
      flags: this.flags.toString()
    };
  }
}
