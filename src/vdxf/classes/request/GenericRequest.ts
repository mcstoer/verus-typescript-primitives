import {
  WALLET_VDXF_KEY,
  GENERIC_REQUEST_DEEPLINK_VDXF_KEY
} from "../../";
import bufferutils from "../../../utils/bufferutils";
import base64url from "base64url";
import { BN } from 'bn.js';
import { BigNumber } from "../../../utils/types/BigNumber";
import { SignatureData, SignatureJsonDataInterface } from "../../../pbaas";
import { OrdinalVdxfObject, OrdinalVdxfObjectJson } from "../OrdinalVdxfObject";
import varuint from "../../../utils/varuint";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";

export interface GenericRequestInterface {
  version?: BigNumber;
  flags?: BigNumber;
  createdat?: BigNumber;
  signature?: SignatureData;
  details: Array<OrdinalVdxfObject>;
}

export type GenericRequestJson = {
  version: string;
  flags?: string;
  createdat?: BigNumber;
  details: Array<OrdinalVdxfObjectJson>;
  signature?: SignatureJsonDataInterface;
}

export class GenericRequest implements SerializableEntity {
  version: BigNumber;
  flags: BigNumber;
  createdat?: BigNumber;
  signature?: SignatureData;
  details: Array<OrdinalVdxfObject>;

  static VERSION_CURRENT = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static BASE_FLAGS = new BN(0, 10)
  static FLAG_SIGNED = new BN(1, 10)
  static FLAG_HAS_CREATED_AT = new BN(2, 10)
  static FLAG_MULTI_DETAILS = new BN(4, 10)

  constructor(
    request: GenericRequestInterface = {
      details: [],
      flags: GenericRequest.BASE_FLAGS
    }
  ) {
    this.signature = request.signature;
    this.details = request.details;
    this.createdat = request.createdat;

    if (request.flags) this.flags = request.flags;
    else this.flags = GenericRequest.BASE_FLAGS;

    if (request.version) this.version = request.version;
    else this.version = GenericRequest.VERSION_CURRENT;

    this.setFlags();
  }

  isValidVersion(): boolean {
    return this.version.gte(GenericRequest.VERSION_FIRSTVALID) && this.version.lte(GenericRequest.VERSION_LASTVALID);
  }

  isSigned() {
    return !!(this.flags.and(GenericRequest.FLAG_SIGNED).toNumber());
  }

  hasMultiDetails() {
    return !!(this.flags.and(GenericRequest.FLAG_MULTI_DETAILS).toNumber());
  }

  setSigned() {
    this.flags = this.version.xor(GenericRequest.FLAG_SIGNED);
  }

  setHasMultiDetails() {
    this.flags = this.version.xor(GenericRequest.FLAG_MULTI_DETAILS);
  }

  setHasCreatedAt() {
    this.flags = this.version.xor(GenericRequest.FLAG_HAS_CREATED_AT);
  }

  setFlags() {
    if (this.createdat) this.setHasCreatedAt();
    if (this.details && this.details.length > 1) this.setHasMultiDetails();
    if (this.signature) this.setSigned();
  }

  // private getRawDetailsSha256() {
  //   return createHash("sha256").update(this.details.toBuffer()).digest();
  // }

  // getDetailsHash(signedBlockheight: number, signatureVersion: number = 2) {
  //   if (this.isSigned()) {
  //     var heightBufferWriter = new bufferutils.BufferWriter(
  //       Buffer.allocUnsafe(4)
  //     );
  //     heightBufferWriter.writeUInt32(signedBlockheight);
  
  //     if (signatureVersion === 1) {
  //       return createHash("sha256")
  //         .update(VERUS_DATA_SIGNATURE_PREFIX)
  //         .update(fromBase58Check(this.system_id).hash)
  //         .update(heightBufferWriter.buffer)
  //         .update(fromBase58Check(this.signing_id).hash)
  //         .update(this.getRawDetailsSha256())
  //         .digest();
  //     } else {
  //       return createHash("sha256")
  //         .update(fromBase58Check(this.system_id).hash)
  //         .update(heightBufferWriter.buffer)
  //         .update(fromBase58Check(this.signing_id).hash)
  //         .update(VERUS_DATA_SIGNATURE_PREFIX)
  //         .update(this.getRawDetailsSha256())
  //         .digest();
  //     }
  //   } else return this.getRawDetailsSha256()
  // }

  getDetails(index = 0): OrdinalVdxfObject {
    return this.details[index];
  }

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.version.toNumber());
    length += varuint.encodingLength(this.flags.toNumber());

    if (this.isSigned()) {  
      length += this.signature!.getByteLength()
    }

    if (this.hasMultiDetails()) {
      length += varuint.encodingLength(this.details.length);
      
      for (const detail of this.details) {
        length += detail.getByteLength();
      }
    } else {
      length += this.getDetails().getByteLength();
    }

    return length;
  }

  toBuffer(): Buffer {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.getByteLength())
    );

    writer.writeCompactSize(this.version.toNumber());
    writer.writeCompactSize(this.flags.toNumber());

    if (this.isSigned()) {
      writer.writeSlice(this.signature!.toBuffer());
    }

    if (this.hasMultiDetails()) {
      writer.writeCompactSize(this.details.length);
      
      for (const detail of this.details) {
        writer.writeSlice(detail.toBuffer());
      }
    } else {
      writer.writeSlice(this.getDetails().toBuffer());
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    if (buffer.length == 0) throw new Error("Cannot create request from empty buffer");
    
    const reader = new bufferutils.BufferReader(buffer, offset);
    
    this.version = new BN(reader.readCompactSize());
    this.flags = new BN(reader.readCompactSize());

    if (this.isSigned()) {
      const _sig = new SignatureData();
      reader.offset = _sig.fromBuffer(reader.buffer, reader.offset);
      this.signature = _sig;
    }

    if (this.hasMultiDetails()) {
      this.details = [];

      const numItems = reader.readCompactSize();

      for (let i = 0; i < numItems; i++) {
        const ord = OrdinalVdxfObject.createFromBuffer(reader.buffer, reader.offset);

        reader.offset = ord.offset;
        this.details.push(ord.obj);
      }
    } else {
      const ord = OrdinalVdxfObject.createFromBuffer(reader.buffer, reader.offset);

      reader.offset = ord.offset;
      this.details = [ord.obj]
    }

    return reader.offset;
  }

  toString() {
    return base64url.encode(this.toBuffer());
  }

  toWalletDeeplinkUri(): string {
    return `${WALLET_VDXF_KEY.vdxfid.toLowerCase()}://x-callback-url/${
      GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid
    }/${this.toString()}`;
  }

  static fromWalletDeeplinkUri(uri: string): GenericRequest {
    const split = uri.split(`${GENERIC_REQUEST_DEEPLINK_VDXF_KEY.vdxfid}/`);

    const inv = new GenericRequest();
    inv.fromBuffer(base64url.toBuffer(split[1]), 0);

    return inv;
  }

  toQrString(): string {
    return this.toString();
  }

  static fromQrString(qrstring: string): GenericRequest {
    const inv = new GenericRequest();
    inv.fromBuffer(base64url.toBuffer(qrstring), 0);

    return inv;
  }

  static fromJson(data: GenericRequestJson): GenericRequest {
    return new GenericRequest();
    // let details: GenericRequestDetails;

    // if (type.eq(GenericRequest.TYPE_INVOICE)) {
    //   details = VerusPayInvoiceDetails.fromJson(data.details as VerusPayInvoiceDetailsJson);
    // } else {
    //   details = DataDescriptor.fromJson(data.details as DataDescriptorJson);
    // }

    // return new GenericRequest({
    //   details,
    //   signature: data.signature != null ? SignatureData.fromJson(data.signature) : undefined,
    //   version: new BN(data.version),
    //   type: new BN(data.type),
    //   flags: new BN(data.flags)
    // })
  }

  toJson(): GenericRequestJson {
    const details = [];

    if (this.details != null) {
      for (const detail of this.details) {
        details.push(detail.toJson())
      }
    }
    
    return {
      signature: this.isSigned() ? this.signature.toJson() : undefined,
      details: details,
      version: this.version.toString(),
      flags: this.flags.toString()
    };
  }
}