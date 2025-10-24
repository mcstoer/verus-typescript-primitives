import {
  WALLET_VDXF_KEY,
  VDXFObject,
  VerusIDSignature,
  VerusIDSignatureJson,
} from "../..";
import { IDENTITY_AUTH_SIG_VDXF_KEY, IDENTITY_UPDATE_REQUEST_VDXF_KEY, IDENTITY_UPDATE_RESPONSE_VDXF_KEY } from "../../keys";
import bufferutils from "../../../utils/bufferutils";
import { VERUS_DATA_SIGNATURE_PREFIX } from "../../../constants/vdxf";
import createHash = require("create-hash");
import base64url from "base64url";
import { BN } from 'bn.js';
import { BigNumber } from "../../../utils/types/BigNumber";
import { IdentityUpdateRequestDetails, IdentityUpdateRequestDetailsJson } from "./IdentityUpdateRequestDetails";
import { IdentityID } from "../../../pbaas";
import { IdentityUpdateResponseDetails, IdentityUpdateResponseDetailsJson } from "./IdentityUpdateResponseDetails";

export const IDENTITY_UPDATE_VERSION_CURRENT = new BN(1, 10)
export const IDENTITY_UPDATE_VERSION_FIRSTVALID = new BN(1, 10)
export const IDENTITY_UPDATE_VERSION_LASTVALID = new BN(1, 10)
export const IDENTITY_UPDATE_VERSION_SIGNED = new BN('80000000', 16)
export const IDENTITY_UPDATE_VERSION_MASK = IDENTITY_UPDATE_VERSION_SIGNED;

export type IdentityUpdateDetails = IdentityUpdateRequestDetails | IdentityUpdateResponseDetails;
export type IdentityUpdateDetailsJson = IdentityUpdateRequestDetailsJson | IdentityUpdateResponseDetailsJson;

export interface IdentityUpdateEnvelopeInterface {
  details: IdentityUpdateDetails;
  systemid?: IdentityID;
  signingid?: IdentityID;
  signature?: string;
  version?: BigNumber;
}

export interface IdentityUpdateEnvelopeJson {
  details: IdentityUpdateDetailsJson;
  systemid?: string;
  signingid?: string;
  signature?: string;
  version?: string;
}

export class IdentityUpdateEnvelope extends VDXFObject {
  systemid: IdentityID;
  signingid: IdentityID;
  signature?: VerusIDSignature;
  details: IdentityUpdateDetails;

  constructor(
    vdxfkey: string,
    request: IdentityUpdateEnvelopeInterface = {
      details: undefined
    }
  ) {
    super(vdxfkey);

    if (request.version) this.version = request.version;
    else this.version = IDENTITY_UPDATE_VERSION_CURRENT;

    if (!request.details) {
      this.details = this.createEmptyDetails();
    }

    this.systemid = request.systemid;
    this.signingid = request.signingid;

    if (request.signature) {
      this.signature = new VerusIDSignature(
        { signature: request.signature },
        IDENTITY_AUTH_SIG_VDXF_KEY,
        false
      );

      this.setSigned()
    }

    this.details = request.details;
  }

  private createEmptyDetails(): IdentityUpdateDetails {
    if (this.vdxfkey === IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid) {
      return new IdentityUpdateRequestDetails();
    } else if (this.vdxfkey === IDENTITY_UPDATE_RESPONSE_VDXF_KEY.vdxfid) {
      return new IdentityUpdateResponseDetails();
    } else throw new Error("Unrecognized vdxf key for identity update");
  }

  getVersionNoFlags(): BigNumber {
    return this.version.and(IDENTITY_UPDATE_VERSION_MASK.notn(IDENTITY_UPDATE_VERSION_MASK.bitLength()))
  }

  isValidVersion(): boolean {
    return this.getVersionNoFlags().gte(IDENTITY_UPDATE_VERSION_FIRSTVALID) && this.getVersionNoFlags().lte(IDENTITY_UPDATE_VERSION_LASTVALID);
  }

  isSigned() {
    return !!(this.version.and(IDENTITY_UPDATE_VERSION_SIGNED).toNumber());
  }

  setSigned() {
    this.version = this.version.or(IDENTITY_UPDATE_VERSION_SIGNED);
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
          .update(this.systemid.toBuffer())
          .update(heightBufferWriter.buffer)
          .update(this.signingid.toBuffer())
          .update(this.details.toSha256())
          .digest();
      } else {
        return createHash("sha256")
          .update(this.systemid.toBuffer())
          .update(heightBufferWriter.buffer)
          .update(this.signingid.toBuffer())
          .update(VERUS_DATA_SIGNATURE_PREFIX)
          .update(this.details.toSha256())
          .digest();
      }
    } else return this.details.toSha256()
  }

  protected _dataByteLength(signer: IdentityID = this.signingid): number {
    if (this.isSigned()) {
      let length = 0;
  
      const _signature = this.signature
        ? this.signature
        : new VerusIDSignature(
            { signature: "" },
            IDENTITY_AUTH_SIG_VDXF_KEY,
            false
          );
  
      length += this.systemid.getByteLength();
  
      length += signer.getByteLength();

      length += _signature.byteLength();
      length += this.details.getByteLength();
  
      return length;
    } else return this.details.getByteLength()
  }

  protected _toDataBuffer(signer: IdentityID = this.signingid): Buffer {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.dataByteLength())
    );

    if (this.isSigned()) {
      const _signature = this.signature
        ? this.signature
        : new VerusIDSignature(
            { signature: "" },
            IDENTITY_AUTH_SIG_VDXF_KEY,
            false
          );
  
      writer.writeSlice(this.systemid.toBuffer());
  
      writer.writeSlice(signer.toBuffer());
  
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
        this.systemid = new IdentityID();
        reader.offset = this.systemid.fromBuffer(reader.buffer, reader.offset);
  
        this.signingid = new IdentityID();
        reader.offset = this.signingid.fromBuffer(reader.buffer, reader.offset);
  
        const _sig = new VerusIDSignature(undefined, IDENTITY_AUTH_SIG_VDXF_KEY, false);
        reader.offset = _sig.fromBuffer(reader.buffer, reader.offset, IDENTITY_AUTH_SIG_VDXF_KEY.vdxfid);
        this.signature = _sig;
      }
      
      const _details = this.createEmptyDetails();
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
      IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid
    }/${this.toString(false)}`;
  }

  static fromWalletDeeplinkUri(vdxfkey: string, uri: string): IdentityUpdateEnvelope {
    const split = uri.split(`${IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid}/`);
    const inv = new IdentityUpdateEnvelope(vdxfkey);
    inv.fromBuffer(base64url.toBuffer(split[1]), 0, IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid);

    return inv;
  }

  toQrString(): string {
    return this.toString(true);
  }

  static fromQrString(vdxfkey: string, qrstring: string): IdentityUpdateEnvelope {
    const inv = new IdentityUpdateEnvelope(vdxfkey);
    inv.fromBuffer(base64url.toBuffer(qrstring), 0);

    return inv;
  }

  toJson(): IdentityUpdateEnvelopeJson {
    return {
      systemid: this.systemid ? this.systemid.toAddress() : undefined,
      signingid: this.signingid ? this.signingid.toAddress() : undefined,
      signature: this.signature ? this.signature.signature : undefined,
      details: this.details ? this.details.toJson() : undefined
    }
  }

  protected static internalFromJson<T>(
    json: IdentityUpdateEnvelopeJson, 
    ctor: new (...args: any[]) => T,
    detailsFromJson: (json: IdentityUpdateDetailsJson) => IdentityUpdateDetails
  ): T {
    return new ctor({
      systemid: json.systemid ? IdentityID.fromAddress(json.systemid) : undefined,
      signingid: json.signingid ? IdentityID.fromAddress(json.signingid) : undefined,
      signature: json.signature,
      details: json.details ? detailsFromJson(json.details) : undefined
    });
  }
}

export class IdentityUpdateRequest extends IdentityUpdateEnvelope {
  constructor(request?: IdentityUpdateEnvelopeInterface) {
    super(IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid, request);
  }

  static fromWalletDeeplinkUri(uri: string): IdentityUpdateRequest {
    return (IdentityUpdateEnvelope.fromWalletDeeplinkUri(IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid, uri) as IdentityUpdateRequest);
  }

  static fromQrString(qrstring: string): IdentityUpdateRequest {
    return (IdentityUpdateEnvelope.fromQrString(IDENTITY_UPDATE_REQUEST_VDXF_KEY.vdxfid, qrstring) as IdentityUpdateRequest);
  }

  static fromJson(json: IdentityUpdateEnvelopeJson) {
    return IdentityUpdateEnvelope.internalFromJson<IdentityUpdateRequest>(json, IdentityUpdateRequest, IdentityUpdateRequestDetails.fromJson);
  }
}

export class IdentityUpdateResponse extends IdentityUpdateEnvelope {
  constructor(response?: IdentityUpdateEnvelopeInterface) {
    super(IDENTITY_UPDATE_RESPONSE_VDXF_KEY.vdxfid, response);
  }

  static fromWalletDeeplinkUri(uri: string): IdentityUpdateEnvelope {
    return IdentityUpdateEnvelope.fromWalletDeeplinkUri(IDENTITY_UPDATE_RESPONSE_VDXF_KEY.vdxfid, uri);
  }

  static fromQrString(qrstring: string): IdentityUpdateResponse {
    return (IdentityUpdateEnvelope.fromQrString(IDENTITY_UPDATE_RESPONSE_VDXF_KEY.vdxfid, qrstring) as IdentityUpdateResponse);
  }

  static fromJson(json: IdentityUpdateEnvelopeJson) {
    return IdentityUpdateEnvelope.internalFromJson<IdentityUpdateResponse>(json, IdentityUpdateResponse, IdentityUpdateResponseDetails.fromJson);
  }
}
