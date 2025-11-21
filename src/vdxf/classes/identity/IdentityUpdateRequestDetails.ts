import varuint from '../../../utils/varuint'
import bufferutils from '../../../utils/bufferutils'
import { fromBase58Check, nameAndParentAddrToIAddr, toBase58Check } from '../../../utils/address';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../../constants/vdxf';
import createHash = require('create-hash');
import { PartialIdentity } from '../../../pbaas/PartialIdentity';
import { PartialSignData, PartialSignDataCLIJson, PartialSignDataJson } from '../../../pbaas/PartialSignData';
import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import { ContentMultiMapJsonValue, IdentityID, VerusCLIVerusIDJson, VerusCLIVerusIDJsonBase } from '../../../pbaas';
import { ResponseUri, ResponseUriJson } from '../ResponseUri';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { UINT_256_LENGTH } from '../../../constants/pbaas';

const { BufferReader, BufferWriter } = bufferutils;

export type SignDataMap = Map<string, PartialSignData>;

export type VerusCLIVerusIDJsonWithData = VerusCLIVerusIDJsonBase<{ [key: string]: ContentMultiMapJsonValue | { data: PartialSignDataCLIJson } }>

export type IdentityUpdateRequestDetailsJson = {
  flags?: string;
  requestid?: string;
  identity?: VerusCLIVerusIDJson;
  expiryheight?: string;
  systemid?: string;
  responseuris?: Array<ResponseUriJson>;
  signdatamap?: { [key: string]: PartialSignDataJson };
  txid?: string;
}

export class IdentityUpdateRequestDetails implements SerializableEntity {
  flags?: BigNumber;
  requestID?: string;                 // ID of request, to be referenced in response
  identity?: PartialIdentity;         // Parts of the identity to update
  expiryHeight?: BigNumber;           // Time after which update request will no longer be accepted
  systemID?: IdentityID;              // System that identity should be updated on (will default to VRSC/VRSCTEST if not present, depending on testnet flag)
  responseURIs?: Array<ResponseUri>;  // Array of uris + type to send response to (type can be post, redirect, etc. depending on how response is expected to be received)
  signDataMap?: SignDataMap;          // Map of data to pass to signdata
  txid?: Buffer;                      // 32 byte transaction ID of transaction that must be spent to update identity, on same system asked for in request
                                      // stored in natural order, if displayed as text make sure to reverse!

  static IDENTITY_UPDATE_REQUEST_VALID = new BN(0, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA = new BN(1, 10);
  static IDENTITY_UPDATE_REQUEST_EXPIRES = new BN(2, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_RESPONSE_URIS = new BN(4, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_REQUEST_ID = new BN(8, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM = new BN(16, 10);
  static IDENTITY_UPDATE_REQUEST_CONTAINS_TXID = new BN(32, 10);
  static IDENTITY_UPDATE_REQUEST_IS_TESTNET = new BN(64, 10);

  constructor (data?: {
    flags?: BigNumber,
    requestID?: string,
    identity?: PartialIdentity,
    expiryHeight?: BigNumber,
    systemID?: IdentityID,
    txid?: Buffer,
    responseURIs?: Array<ResponseUri>,
    signDataMap?: SignDataMap
  }) {
    this.flags = data && data.flags ? data.flags : new BN("0", 10);

    if (data?.requestID) {
      if (!this.containsRequestID()) this.toggleContainsRequestID();
      this.requestID = data.requestID;
    }

    if (data?.identity) {
      this.identity = data.identity;
    }

    if (data?.expiryHeight) {
      if (!this.expires()) this.toggleExpires();
      this.expiryHeight = data.expiryHeight;
    }

    if (data?.systemID) {
      if (!this.containsSystem()) this.toggleContainsSystem();
      this.systemID = data.systemID;
    }

    if (data?.txid) {
      if (!this.containsTxid()) this.toggleContainsTxid();
      this.txid = data.txid;
    }

    if (data?.responseURIs) {
      if (!this.containsResponseUris()) this.toggleContainsResponseUris();
      this.responseURIs = data.responseURIs;
    }

    if (data?.signDataMap) {
      if (!this.containsSignData()) this.toggleContainsSignData();
      this.signDataMap = data.signDataMap;
    }
  }

  expires() {
    return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_EXPIRES).toNumber());
  }

  containsSignData() {
    return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA).toNumber());
  }

  containsSystem() {
    return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM).toNumber());
  }

  containsRequestID() {
    return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_REQUEST_ID).toNumber());
  }

  containsTxid() {
    return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_TXID).toNumber());
  }

  containsResponseUris() {
    return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_RESPONSE_URIS).toNumber());
  }

  isTestnet() {
    return !!(this.flags.and(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_IS_TESTNET).toNumber());
  }

  toggleExpires() {
    this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_EXPIRES);
  }

  toggleContainsSignData() {
    this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA);
  }

  toggleContainsSystem() {
    this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM);
  }

  toggleContainsRequestID() {
    this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_REQUEST_ID);
  }

  toggleContainsTxid() {
    this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_TXID);
  }

  toggleContainsResponseUris() {
    this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_CONTAINS_RESPONSE_URIS);
  }

  toggleIsTestnet() {
    this.flags = this.flags.xor(IdentityUpdateRequestDetails.IDENTITY_UPDATE_REQUEST_IS_TESTNET);
  }

  toSha256() {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  getIdentityAddress() {
    if (this.identity.name === "VRSC" || this.identity.name === "VRSCTEST") {
      return nameAndParentAddrToIAddr(this.identity.name);
    } else if (this.identity.parent) {
      return this.identity.getIdentityAddress();
    } else if (this.isTestnet()) {
      return nameAndParentAddrToIAddr(this.identity.name, nameAndParentAddrToIAddr("VRSCTEST"));
    } else {
      return nameAndParentAddrToIAddr(this.identity.name, nameAndParentAddrToIAddr("VRSC"));
    }
  }

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.flags.toNumber());

    if (this.containsRequestID()) {
      length += HASH160_BYTE_LENGTH;
    }

    length += this.identity.getByteLength();

    if (this.expires()) length += varuint.encodingLength(this.expiryHeight.toNumber());

    if (this.containsSystem()) length += this.systemID.getByteLength();

    if (this.containsTxid()) {
      length += UINT_256_LENGTH;
    }

    if (this.containsResponseUris()) {
      length += varuint.encodingLength(this.responseURIs.length);
      length += this.responseURIs.reduce(
        (sum: number, current: ResponseUri) => sum + current.getByteLength(),
        0
      );
    }

    if (this.containsSignData()) {
      length += varuint.encodingLength(this.signDataMap.size);
      for (const [key, value] of this.signDataMap.entries()) {
        length += fromBase58Check(key).hash.length;
        length += value.getByteLength();
      }
    }

    return length;
  }

  toBuffer() {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeCompactSize(this.flags.toNumber());

    if (this.containsRequestID()) {
      writer.writeSlice(fromBase58Check(this.requestID).hash);
    }
    
    writer.writeSlice(this.identity.toBuffer());

    if (this.expires()) writer.writeCompactSize(this.expiryHeight.toNumber());

    if (this.containsSystem()) writer.writeSlice(this.systemID.toBuffer());

    if (this.containsTxid()) {
      if (this.txid.length !== UINT_256_LENGTH) throw new Error("invalid txid length");

      writer.writeSlice(this.txid);
    }

    if (this.containsResponseUris()) {
      writer.writeArray(this.responseURIs.map((x) => x.toBuffer()));
    }

    if (this.containsSignData()) {
      writer.writeCompactSize(this.signDataMap.size);
      for (const [key, value] of this.signDataMap.entries()) {
        writer.writeSlice(fromBase58Check(key).hash);
        writer.writeSlice(value.toBuffer());
      }
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0, parseVdxfObjects: boolean = true) {
    const reader = new BufferReader(buffer, offset);

    this.flags = new BN(reader.readCompactSize());

    if (this.containsRequestID()) {
      this.requestID = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);
    }

    this.identity = new PartialIdentity();
    reader.offset = this.identity.fromBuffer(reader.buffer, reader.offset, parseVdxfObjects);
    
    if (this.expires()) {
      this.expiryHeight = new BN(reader.readCompactSize());
    }

    if (this.containsSystem()) {
      this.systemID = new IdentityID();
      reader.offset = this.systemID.fromBuffer(reader.buffer, reader.offset);
    }

    if (this.containsTxid()) {
      this.txid = reader.readSlice(UINT_256_LENGTH);
    }

    if (this.containsResponseUris()) {
      this.responseURIs = [];
      const urisLength = reader.readCompactSize();

      for (let i = 0; i < urisLength; i++) {
        const uri = new ResponseUri();
        reader.offset = uri.fromBuffer(
          reader.buffer,
          reader.offset
        );
        this.responseURIs.push(uri);
      }
    }

    if (this.containsSignData()) {
      this.signDataMap = new Map();

      const size = reader.readCompactSize();

      for (let i = 0; i < size; i++) {
        const key = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);
        const value = new PartialSignData();

        reader.offset = value.fromBuffer(reader.buffer, reader.offset);
        
        this.signDataMap.set(key, value);
      }
    }

    return reader.offset;
  }

  toJson(): IdentityUpdateRequestDetailsJson {
    let signDataJson: { [key: string]: PartialSignDataJson };
    
    if (this.signDataMap) {
      signDataJson = {};
      
      for (const [key, psd] of this.signDataMap.entries()) {
        signDataJson[key] = psd.toJson();
      }
    }

    return {
      flags: this.flags ? this.flags.toString(10) : undefined,
      requestid: this.containsRequestID() ? this.requestID : undefined,
      identity: this.identity ? this.identity.toJson() : undefined,
      expiryheight: this.expiryHeight ? this.expiryHeight.toString(10) : undefined,
      systemid: this.systemID ? this.systemID.toAddress() : undefined,
      txid: this.txid ? (Buffer.from(this.txid.toString('hex'), 'hex').reverse()).toString('hex') : undefined,
      responseuris: this.responseURIs ? this.responseURIs.map(x => x.toJson()) : undefined,
      signdatamap: signDataJson
    }
  }

  static fromJson(json: IdentityUpdateRequestDetailsJson): IdentityUpdateRequestDetails {
    let signDataMap: SignDataMap;

    if (json.signdatamap) {
      signDataMap = new Map();

      for (const key in json.signdatamap) {
        signDataMap.set(key, PartialSignData.fromJson(json.signdatamap[key]))
      }
    }

    return new IdentityUpdateRequestDetails({
      flags: json.flags ? new BN(json.flags, 10) : undefined,
      requestID: json.requestid,
      identity: json.identity ? PartialIdentity.fromJson(json.identity) : undefined,
      expiryHeight: json.expiryheight ? new BN(json.expiryheight, 10) : undefined,
      systemID: json.systemid ? IdentityID.fromAddress(json.systemid) : undefined,
      responseURIs: json.responseuris ? json.responseuris.map(x => ResponseUri.fromJson(x)) : undefined,
      signDataMap,
      txid: json.txid ? Buffer.from(json.txid, 'hex').reverse() : undefined,
    })
  }

  toCLIJson(): VerusCLIVerusIDJsonWithData {
    if (!this.identity) throw new Error("No identity details to update");

    const idJson = (this.identity.toJson() as VerusCLIVerusIDJsonWithData);

    if (this.containsSignData()) {
      for (const [key, psd] of this.signDataMap.entries()) {
        idJson.contentmultimap[key] = {
          "data": psd.toCLIJson()
        }
      }
    }

    return idJson;
  }

  static fromCLIJson(
    json: VerusCLIVerusIDJsonWithData, 
    details?: IdentityUpdateRequestDetailsJson
  ): IdentityUpdateRequestDetails {
    let identity: PartialIdentity;
    let signDataMap: SignDataMap;

    if (json.contentmultimap) {
      const cmm = { ...json.contentmultimap };

      for (const key in cmm) {
        if (cmm[key]['data']) {
          if (!signDataMap) signDataMap = new Map();

          const psd = PartialSignData.fromCLIJson(cmm[key]['data']);
          signDataMap.set(key, psd);

          delete cmm[key];
        }
      }

      json = { ...json, contentmultimap: cmm }
    }

    identity = PartialIdentity.fromJson(json as VerusCLIVerusIDJson);

    return new IdentityUpdateRequestDetails({
      identity,
      signDataMap,
      systemID: details?.systemid ? IdentityID.fromAddress(details.systemid) : undefined,
      requestID: details?.requestid,
      expiryHeight: details?.expiryheight ? new BN(details.expiryheight, 10) : undefined,
      responseURIs: details?.responseuris ? details.responseuris.map(x => ResponseUri.fromJson(x)) : undefined,
      txid: details?.txid ? Buffer.from(details.txid, 'hex').reverse() : undefined,
    })
  }
}