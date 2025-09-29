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

export enum LoginPermissionType {
  REQUIRED_ID = 1,
  REQUIRED_SYSTEM = 2,
  REQUIRED_PARENT = 3
}

export interface LoginPermission {
  type: LoginPermissionType;
  identityid: string;
}

export interface CallbackUri {
  type: CallbackUriType;
  uri: string;
}

export interface LoginRequestDetailsInterface {
  version?: BigNumber;
  challengeId: string;
  flags?: BigNumber;
  requestedAccess?: Array<string> | null;
  permissions?: Array<LoginPermission>; 
  callbackUri?: CallbackUri;
}

export interface LoginRequestDetailsJson {
  version: number;
  challengeid: string;
  flags: number;
  permissions?: Array<LoginPermission>;
  callbackuri?: CallbackUri;
}

export class LoginRequestDetails implements SerializableEntity {
  version: BigNumber = LoginRequestDetails.VERSION_CURRENT;
  challengeId: string;
  flags?: BigNumber;  
  permissions?: Array<LoginPermission>;
  callbackUri?: CallbackUri;

  // Version
  static VERSION_CURRENT = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static FLAG_HAS_PERMISSIONS = new BN(1, 10);
  static FLAG_HAS_CALLBACK_URI = new BN(2, 10);

  constructor(
    challenge: LoginRequestDetailsInterface = { challengeId: ""}
  ) {

    this.challengeId = challenge.challengeId;
    this.flags = challenge?.flags || new BN(0, 10);
    this.permissions = challenge?.permissions || null;
    this.callbackUri = challenge?.callbackUri || null;
    this.version = LoginRequestDetails.VERSION_CURRENT;
  }

  getByteLength(): number {
    this.setFlags(); // Ensure flags are set correctly for length calculation
    let length = 0;

    length += 20; // challengeId hash length
    length += varint.encodingLength(this.flags);

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_PERMISSIONS).eq(LoginRequestDetails.FLAG_HAS_PERMISSIONS)) {

      length += varuint.encodingLength(this.permissions.length);
      if (this.permissions) {
        for (let i = 0; i < this.permissions.length; i++) {
          length += varint.encodingLength(new BN(this.permissions[i].type));
          length += 20; // identityid as hash
        }
      }
    }

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI)) {
      length += varint.encodingLength(new BN(this.callbackUri.type));
      length += varuint.encodingLength(Buffer.from(this.callbackUri.uri, 'utf8').length);
      length += Buffer.from(this.callbackUri.uri, 'utf8').length;
    }

    return length;
  }

  toBuffer(): Buffer {
    this.setFlags();
    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()))

    writer.writeSlice(fromBase58Check(this.challengeId).hash);
    writer.writeVarInt(this.flags);
    
    if (this.flags.and(LoginRequestDetails.FLAG_HAS_PERMISSIONS).eq(LoginRequestDetails.FLAG_HAS_PERMISSIONS)) {
      writer.writeCompactSize(this.permissions.length);
      for (let i = 0; i < this.permissions.length; i++) {
        writer.writeVarInt(new BN(this.permissions[i].type));
        writer.writeSlice(fromBase58Check(this.permissions[i].identityid).hash);
      }
    }

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI)) {
      writer.writeVarInt(new BN(this.callbackUri.type));
      writer.writeVarSlice(Buffer.from(this.callbackUri.uri, 'utf8'));
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);
    if (buffer.length == 0) throw new Error("Cannot create challenge from empty buffer");

    this.challengeId = toBase58Check(reader.readSlice(20), I_ADDR_VERSION); 
    this.flags = reader.readVarInt();

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_PERMISSIONS).eq(LoginRequestDetails.FLAG_HAS_PERMISSIONS)) {
      this.permissions = [];
      const permissionsLength = reader.readCompactSize();
      for (let i = 0; i < permissionsLength; i++) {
        this.permissions.push({
          type: reader.readVarInt().toNumber(),
          identityid: toBase58Check(reader.readSlice(20), I_ADDR_VERSION)
        });
      }
    } 

    if (this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI)) {
      this.callbackUri = {
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
      challengeid: this.challengeId,
      flags: this.flags ? this.flags.toNumber() : 0,
      permissions: this.permissions,
      callbackuri: this.callbackUri
    };
  }

  static fromJson(data: any): LoginRequestDetails {
    return new LoginRequestDetails({
      version: new BN(data?.version || 0),
      challengeId: data.challengeid,
      flags: new BN(data?.flags || 0),
      permissions: data.permissions,
      callbackUri: data.callbackuri
    })
  }


  setFlags() {
    this.flags = new BN(0, 10);
    if (this.permissions) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_PERMISSIONS);
    }
    if (this.callbackUri) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
    }
  }   

  isValid(): boolean {
    let valid = this.challengeId != null && this.challengeId.length > 0;
    valid &&= this.flags != null && this.flags.gte(new BN(0));
    
    // Validate challengeId is a valid base58 address
    try {
      fromBase58Check(this.challengeId);
    } catch {
      valid = false;
    }
    
    return valid;
  }

   toSha256() {
      return createHash("sha256").update(this.toBuffer()).digest();
    }
}