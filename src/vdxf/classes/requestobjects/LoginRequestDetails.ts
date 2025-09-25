import bufferutils from "../../../utils/bufferutils";
import { BigNumber } from "../../../utils/types/BigNumber";
import { BN } from "bn.js";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import varuint from "../../../utils/varuint";
import { I_ADDR_VERSION } from '../../../constants/vdxf';
import { fromBase58Check, toBase58Check } from "../../../utils/address";
import varint from "../../../utils/varint";
import { createHash } from "crypto";



export enum CallbackUriType {
  TYPE_WEBHOOK = 1,
  TYPE_REDIRECT = 2,
  TYPE_DEEPLINK = 3,
  TYPE_OAUTH2 = 4
}

export interface CallbackUri {
  type: CallbackUriType;
  uri: string;
}

export enum EncryptionType {
  TYPE_PUBKEY= 1,
  TYPE_ZADDRESS = 2
}

export interface EncryptionDetails {
  type: EncryptionType;
  key: string;
  derivation_number?: number;
}
export interface LoginRequestDetailsInterface {
  version?: BigNumber;
  challenge_id: string;
  flags?: BigNumber;
  requested_access?: Array<string> | null;
  requested_access_audience?: Array<string>;
  encryption_details?: EncryptionDetails;
  callback_uri?: CallbackUri;
}

export class LoginRequestDetails implements SerializableEntity {
  version: BigNumber = LoginRequestDetails.VERSION_CURRENT;
  challenge_id: string;
  flags?: BigNumber;  
  requested_access_audience?: Array<string>;
  encryption_details?: EncryptionDetails;
  callback_uri?: CallbackUri;

  // Version
  static VERSION_CURRENT = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static FLAG_HAS_AUDIENCE = new BN(1, 10);
  static FLAG_HAS_ENCRYPTION_DETAILS = new BN(2, 10);
  static FLAG_HAS_CALLBACK_URI = new BN(4, 10);
  static FLAG_CALLBACK_CLEAR_ENCRYPTION_DATA = new BN(8, 10);

  constructor(
    challenge: LoginRequestDetailsInterface = { challenge_id: ""}
  ) {

    this.challenge_id = challenge.challenge_id;
    this.flags = challenge?.flags || new BN(0, 10);
    this.requested_access_audience = challenge?.requested_access_audience || null;
    this.encryption_details = challenge?.encryption_details || null;
    this.callback_uri = challenge?.callback_uri || null;
    this.version = LoginRequestDetails.VERSION_CURRENT;

  }

  getByteLength(): number {
    let length = 0;

    length += fromBase58Check(this.challenge_id).hash.length;
    length += varint.encodingLength(this.flags);

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_AUDIENCE).eq(LoginRequestDetails.FLAG_HAS_AUDIENCE)) {
      length += varuint.encodingLength(this.requested_access_audience.length);
      for (let i = 0; i < this.requested_access_audience.length; i++) {
        length += varuint.encodingLength(Buffer.from(this.requested_access_audience[i], 'utf8').length);
        length += Buffer.from(this.requested_access_audience[i], 'utf8').length;
      }
    }

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_ENCRYPTION_DETAILS).eq(LoginRequestDetails.FLAG_HAS_ENCRYPTION_DETAILS)) {
      length += varint.encodingLength(new BN(this.encryption_details.type));
      length += varuint.encodingLength(Buffer.from(this.encryption_details.key, 'utf8').length);
      length += Buffer.from(this.encryption_details.key, 'utf8').length;
      length += varint.encodingLength(new BN(this.encryption_details.derivation_number || 0));      
    }

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI)) {
      length += varint.encodingLength(new BN(this.callback_uri.type));
      length += varuint.encodingLength(Buffer.from(this.callback_uri.uri, 'utf8').length);
      length += Buffer.from(this.callback_uri.uri, 'utf8').length;
    }

    return length;
  }

  toBuffer(): Buffer {
    this.setFlags();
    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()))

    writer.writeSlice(fromBase58Check(this.challenge_id).hash);
    writer.writeVarInt(this.flags);
    
    if (this.flags.and(LoginRequestDetails.FLAG_HAS_AUDIENCE).eq(LoginRequestDetails.FLAG_HAS_AUDIENCE)) {
      writer.writeCompactSize(this.requested_access_audience ? this.requested_access_audience.length : 0);
      for (let i = 0; i < this.requested_access_audience.length; i++) {
        writer.writeVarSlice(Buffer.from(this.requested_access_audience[i], 'utf8'));
      }
    }

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_ENCRYPTION_DETAILS).eq(LoginRequestDetails.FLAG_HAS_ENCRYPTION_DETAILS)) {
      writer.writeVarInt(new BN(this.encryption_details.type));
      writer.writeVarSlice(Buffer.from(this.encryption_details.key, 'utf8'));
      writer.writeVarInt(new BN(this.encryption_details.derivation_number || 0));
    }

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI)) {
      writer.writeVarInt(new BN(this.callback_uri.type));
      writer.writeVarSlice(Buffer.from(this.callback_uri.uri, 'utf8'));
    }



    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);
    if (buffer.length == 0) throw new Error("Cannot create challenge from empty buffer");

    this.challenge_id = toBase58Check(reader.readSlice(20), I_ADDR_VERSION); 
    this.flags = reader.readVarInt();

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_AUDIENCE).eq(LoginRequestDetails.FLAG_HAS_AUDIENCE)) {
      this.requested_access_audience = [];
      const audienceLength = reader.readCompactSize();
      for (let i = 0; i < audienceLength; i++) {
        this.requested_access_audience.push(reader.readVarSlice().toString('utf8'));
      }
    }

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_ENCRYPTION_DETAILS).eq(LoginRequestDetails.FLAG_HAS_ENCRYPTION_DETAILS)) {
      this.encryption_details = {
        type: reader.readVarInt().toNumber(),
        key: reader.readVarSlice().toString('utf8'),
        derivation_number: reader.readVarInt().toNumber()
      }
    }

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI)) {
      this.callback_uri = {
        type: reader.readVarInt().toNumber(),
        uri: reader.readVarSlice().toString('utf8')
      }
    }

    return reader.offset;
  }

  toJson() {
    this.setFlags();
    return {
      version: this.version ? this.version.toNumber() : 0,
      challenge_id: this.challenge_id,
      flags: this.flags ? this.flags.toNumber() : 0,
      requested_access_audience: this.requested_access_audience,
      encryption_details: this.encryption_details,
      callback_uri: this.callback_uri
    };
  }

  static fromJson(data: any): LoginRequestDetails {
    return new LoginRequestDetails({
      version: new BN(data?.version || 0),
      challenge_id: data.challenge_id,
      flags: new BN(data?.flags || 0),
      requested_access_audience: data.requested_access_audience,
      encryption_details: data.encryption_details,
      callback_uri: data.callback_uri
    })
  }


  setFlags() {
    this.flags = new BN(0, 10);
    if (this.requested_access_audience && this.requested_access_audience.length > 0) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_AUDIENCE);
    }
    if (this.encryption_details) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_ENCRYPTION_DETAILS);
    }
    if (this.callback_uri) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
    }
  }   

  isValid(): boolean {
    let valid = this.challenge_id != null && this.challenge_id.length > 0;
    valid &&= this.flags != null && this.flags.gte(new BN(0));
    return valid;
  }

   toSha256() {
      return createHash("sha256").update(this.toBuffer()).digest();
    }
}