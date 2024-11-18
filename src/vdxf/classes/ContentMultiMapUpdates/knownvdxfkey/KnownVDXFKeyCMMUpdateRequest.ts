import { VDXFObject, WALLET_VDXF_KEY } from "../../..";
import { BN } from "bn.js";
import { BigNumber } from "../../../../utils/types/BigNumber";
import bufferutils from "../../../../utils/bufferutils";
import varint from "../../../../utils/varint";
import { Hash160 } from "../../Hash160";
import { toBase58Check } from "../../../../utils/address";
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from "../../../../constants/vdxf";

// Flags
export const KNOWN_VDXFKEY_CMM_UPDATE_HAS_SENDER_ID = new BN(1, 10)

// Versions
export const KNOWN_VDXFKEY_CMM_UPDATE_VERSION_CURRENT = new BN(1, 10);
export const KNOWN_VDXFKEY_CMM_UPDATE_VERSION_FIRSTVALID = new BN(1, 10);
export const KNOWN_VDXFKEY_CMM_UPDATE_VERSION_LASTVALID = new BN(1, 10);

export interface KnownVDXFKeyCMMUpdateDetails {
  getByteLength(): number;
  toBuffer();
  fromBuffer(buffer: Buffer, offset: number);
}

export interface KnownVDXFKeyCMMUpdateRequestInterface {
  flags?: BigNumber,
  version?: BigNumber,
  vdxfkey: string;
  sender_id?: string;
  details: KnownVDXFKeyCMMUpdateDetails;
}

export abstract class KnownVDXFKeyCMMUpdateRequest extends VDXFObject {

  flags: BigNumber;
  version: BigNumber;
  // The sender id is the i-address that was logged into the app that send the request.
  // This can be used to speed up the process of selecting an identity to use.
  // Since an app may not require login, this doesn't always need to appear.
  sender_id?: string; 
  details: KnownVDXFKeyCMMUpdateDetails;

  constructor(
    request : KnownVDXFKeyCMMUpdateRequestInterface
  ) {
    super(request.vdxfkey)

    if (request.flags) {
      this.flags = request.flags;
    } else {
      this.flags = new BN(0, 10);
      if (request.sender_id) {
        this.setFlags({senderIdFlag: true});
      }
    }
    this.version = request.version ?? KNOWN_VDXFKEY_CMM_UPDATE_VERSION_CURRENT;
    this.sender_id = request.sender_id;
    this.details = request.details;
  }

  setFlags(flags: {
    senderIdFlag: boolean
  }) {
    if (flags.senderIdFlag) {
      this.flags = this.flags.xor(KNOWN_VDXFKEY_CMM_UPDATE_HAS_SENDER_ID);
    } 
  }

  hasSenderId () {
    return !!(this.flags.and(KNOWN_VDXFKEY_CMM_UPDATE_HAS_SENDER_ID).toNumber());
  }

  getVersionNoFlags(): BigNumber {
    return this.version;
  }

  isValidVersion(): boolean {
    return this.getVersionNoFlags().gte(KNOWN_VDXFKEY_CMM_UPDATE_VERSION_FIRSTVALID)
      && this.getVersionNoFlags().lte(KNOWN_VDXFKEY_CMM_UPDATE_VERSION_LASTVALID);
  }

  protected _dataByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);
    length += varint.encodingLength(this.version);

    if (this.hasSenderId()) {
      const _sender_id = Hash160.fromAddress(this.sender_id);
      length += _sender_id.getByteLength();
    }

    length += this.details.getByteLength();

    return length;
  }

  dataByteLength(): number {
    return this._dataByteLength();
  }

  protected _toDataBuffer(): Buffer {
    const writer = new bufferutils.BufferWriter(
      Buffer.alloc(this.dataByteLength())
    );

    writer.writeVarInt(this.flags);
    writer.writeVarInt(this.version);

    if (this.hasSenderId()) {
      const _sender_id = Hash160.fromAddress(this.sender_id);
      writer.writeSlice(_sender_id.toBuffer());
    }

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
      throw new Error("Cannot create request from empty buffer");
    } else {
      this.flags = reader.readVarInt();
      this.version = reader.readVarInt();

      // The flags should indicate if a sender id was included.
      if (this.hasSenderId()) {
        this.sender_id = toBase58Check(
          reader.readSlice(HASH160_BYTE_LENGTH),
          I_ADDR_VERSION
        );
      }

      // The details must be non-null due to the requirement of the class.
      reader.offset = this.details.fromBuffer(reader.buffer, reader.offset);
    }

    return reader.offset;
  }

  fromDataBuffer(buffer: Buffer, offset?: number): number {
    return this._fromDataBuffer(buffer, offset);
  }

  toWalletDeeplinkUri(): string {
    return `${WALLET_VDXF_KEY.vdxfid.toLowerCase()}://x-callback-url/${
      this.vdxfkey
    }/${this.toString(false)}`;
  }

  toQrString(): string {
    return this.toString(true);
  }

  // Since each individual type of request can return its own type and requires the vdxfkey to decode,
  // fromWalletDeepLinkUri and fromQrString should be handled by the implementing classes.
}
