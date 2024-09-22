
import { 
  VDXFObject,
    VerusIDSignature,
    VerusIDSignatureInterface,
    VerusIDSignatureJson,
    WALLET_VDXF_KEY 
} from "../../index";
import {
  UPDATE_IDENTITY_REQUEST_VDXF_KEY,
  IDENTITY_AUTH_SIG_VDXF_KEY 
} from "../../keys";
import { Hash160 } from "./../Hash160";
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION} from "../../../constants/vdxf";
import bufferutils from "../../../utils/bufferutils";
import { toBase58Check } from "../../../utils/address";
import { UpdateIdentityDetails, UpdateIdentityDetailsJson } from "./UpdateIdentityDetails";
import base64url from "base64url";

export interface UpdateIdentityRequestInterface {
  system_id?: string;
  signing_id?: string;
  signature?: VerusIDSignatureInterface;
  details: UpdateIdentityDetails;
}

export type UpdateIdentityRequestJson = {
  vdxfkey: string,
  system_id?: string;
  signing_id?: string;
  signature?: VerusIDSignatureJson;
  details: UpdateIdentityDetailsJson;
}

// UpdateIdentityRequest defines a request with details of an identity update.
export class UpdateIdentityRequest extends VDXFObject {
  system_id: string;
  signing_id: string;
  signature: VerusIDSignature;
  details: UpdateIdentityDetails;

  constructor(
      request: UpdateIdentityRequestInterface = {
          details: new UpdateIdentityDetails(),
      },
  ) {
    super(UPDATE_IDENTITY_REQUEST_VDXF_KEY.vdxfid);

    this.system_id = request.system_id;
    this.signing_id = request.signing_id;
    this.signature = request.signature
      ? new VerusIDSignature(
          request.signature,
          IDENTITY_AUTH_SIG_VDXF_KEY,
          false
        )
      : undefined;

    this.details = new UpdateIdentityDetails(request.details);
  }

  getDetailsHash(signedBlockheight: number, signatureVersion: number = 2) {
    return this.details.toSha256()
  }

  protected _dataByteLength(signer: string = this.signing_id): number {

    let length = 0;

    const _system_id = Hash160.fromAddress(this.system_id);
    length += _system_id.getByteLength();

    const _signing_id = Hash160.fromAddress(signer);
    length += _signing_id.getByteLength();

    length += this.signature.byteLength();
    length += this.details.getByteLength();

    return length;
  }

  dataByteLength(): number {
    return this._dataByteLength();
  }

  protected _toDataBuffer(signer: string = this.signing_id): Buffer {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.dataByteLength())
    );
  
    const _system_id = Hash160.fromAddress(this.system_id);
    writer.writeSlice(_system_id.toBuffer());

    const _signing_id = Hash160.fromAddress(signer);
    writer.writeSlice(_signing_id.toBuffer());

    writer.writeSlice(this.signature.toBuffer());

    writer.writeSlice(this.details.toBuffer());

    return writer.buffer;
  }

  toDataBuffer(): Buffer {
    return this._toDataBuffer();
  }

  protected _fromDataBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);
    const reqLength = reader.readCompactSize();

    if (reqLength == 0) {
      throw new Error("Cannot create an update identity request from an empty buffer");
    } else {
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
      
      const _details = new UpdateIdentityDetails();
      reader.offset = _details.fromBuffer(reader.buffer, reader.offset);
      this.details = _details;
    }

    return reader.offset;
  }

  fromDataBuffer(buffer: Buffer, offset?: number): number {
    return this._fromDataBuffer(buffer, offset);
  }

  toWalletDeeplinkUri(): string {
    if (this.signature == null) throw new Error("Update Identity Request must be signed before it can be used as a deep link")

    return `${WALLET_VDXF_KEY.vdxfid.toLowerCase()}://x-callback-url/${
      UPDATE_IDENTITY_REQUEST_VDXF_KEY.vdxfid
    }/?${UPDATE_IDENTITY_REQUEST_VDXF_KEY.vdxfid}=${this.toString()}`;
  }

  static fromWalletDeeplinkUri(uri: string): UpdateIdentityRequest {
    const split = uri.split(`${UPDATE_IDENTITY_REQUEST_VDXF_KEY.vdxfid}=`);
    const req = new UpdateIdentityRequest();
    req.fromBuffer(base64url.toBuffer(split[1]));

    return req;
  }

  toQrString(): string {
    return this.toString(true);
  }

  static fromQrString(qrstring: string): UpdateIdentityRequest {
    const req = new UpdateIdentityRequest();
    req.fromBuffer(base64url.toBuffer(qrstring));

    return req;
  }

  toJson() {
    return {
      vdxfkey: this.vdxfkey,
      system_id: this.system_id,
      signing_id: this.signing_id,
      signature: this.signature ? this.signature.toJson() : this.signature,
      details: this.details.toJson(),
    };
  }

  static fromJson(data: UpdateIdentityRequestJson): UpdateIdentityRequest {
    return new UpdateIdentityRequest({
      system_id: data.system_id,
      signing_id: data.signing_id,
      signature: data.signature != null ? VerusIDSignature.fromJson(data.signature) : undefined,
      details: UpdateIdentityDetails.fromJson(data.details),
    })
  }
}