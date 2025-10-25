
/**
 * LoginRequestDetails - Class for handling application login and authentication requests
 * 
 * This class is used when an application is requesting authentication or login from the user,
 * including specific permissions and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Callback URIs for post-authentication redirects
 * - Optional expiry time for the authentication session
 * 
 * The user's wallet can use these parameters to present a clear authentication request
 * to the user, showing exactly what permissions are being requested and where they will
 * be redirected after successful authentication. This enables secure, user-controlled
 * authentication flows with granular permission management.
 */

import bufferutils from "../../../utils/bufferutils";
import { BigNumber } from "../../../utils/types/BigNumber";
import { BN } from "bn.js";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import varuint from "../../../utils/varuint";
import { I_ADDR_VERSION } from '../../../constants/vdxf';
import { fromBase58Check, toBase58Check } from "../../../utils/address";
import varint from "../../../utils/varint";
import { CompactIdAddressObject, CompactIdAddressObjectJson } from "../CompactIdAddressObject";

export interface LoginRequestDetailsInterface {
  version?: BigNumber;
  flags?: BigNumber;  
  requestId: string;
  permissions?: Array<LoginPermission>;
  callbackUris?: Array<callbackUris>;
  expiryTime?: number; // UNIX Timestamp
}

export interface LoginPermissionJson {
  type: number;
  identity: CompactIdAddressObjectJson;
}

export interface callbackUrisJson {
  type: number;
  uri: string;
}
export interface LoginPermission {
  type: number;
  identity: CompactIdAddressObject;
}

export interface callbackUris {
  type: number;
  uri: string;
}

export interface LoginRequestDetailsJson {
  version: number;
  requestid: string;
  flags: number;
  permissions?: Array<LoginPermissionJson>;
  callbackUris?: Array<callbackUrisJson>;
  expirytime?: number;
}

export class LoginRequestDetails implements SerializableEntity {
  version: BigNumber;
  flags?: BigNumber;  
  requestId: string;
  permissions?: Array<LoginPermission>;
  callbackUris?: Array<callbackUris>;
  expiryTime?: number; // UNIX Timestamp

  // Version
  static DEFAULT_VERSION = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static FLAG_HAS_PERMISSIONS = new BN(1, 10);
  static FLAG_HAS_CALLBACK_URI = new BN(2, 10);
  static FLAG_HAS_EXPIRY_TIME = new BN(4, 10);

  // Permission Types
  static REQUIRED_ID = 1;
  static REQUIRED_SYSTEM = 2;
  static REQUIRED_PARENT = 3;

  // Callback URI Types
  static TYPE_WEBHOOK = 1;
  static TYPE_REDIRECT = 2;
  static TYPE_DEEPLINK = 3;

  constructor(
    request?: LoginRequestDetailsInterface 
  ) {

    this.version = request?.version || LoginRequestDetails.DEFAULT_VERSION;
    this.requestId = request?.requestId || '';
    this.flags = request?.flags || new BN(0, 10);
    this.permissions = request?.permissions || null;
    this.callbackUris = request?.callbackUris || null;
    this.expiryTime = request?.expiryTime || null;
  }

  hasPermissions(): boolean {   
      return this.flags.and(LoginRequestDetails.FLAG_HAS_PERMISSIONS).eq(LoginRequestDetails.FLAG_HAS_PERMISSIONS);
  }

  hascallbackUris(): boolean {
    return this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
  }

  hasExpiryTime(): boolean {
    return this.flags.and(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME).eq(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
  }

  getByteLength(): number {
    this.setFlags(); // Ensure flags are set correctly for length calculation
    let length = 0;

    length += varint.encodingLength(this.flags);
    length += 20; // requestId hash length

    if (this.hasPermissions()) {

      length += varuint.encodingLength(this.permissions.length);      
        for (let i = 0; i < this.permissions.length; i++) {
          length += varuint.encodingLength(this.permissions[i].type);
          length += this.permissions[i].identity.getByteLength();
        }      
    }

    if (this.hascallbackUris()) {
      length += varuint.encodingLength(this.callbackUris.length);
        for (let i = 0; i < this.callbackUris.length; i++) {
          length += varuint.encodingLength(this.callbackUris[i].type);
          length += varuint.encodingLength(Buffer.from(this.callbackUris[i].uri, 'utf8').byteLength);
          length += Buffer.from(this.callbackUris[i].uri, 'utf8').byteLength;
        }
    }

    if (this.hasExpiryTime()) {
      length += varuint.encodingLength(this.expiryTime);
    }

    return length;
  }

  toBuffer(): Buffer {

    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()))

    writer.writeVarInt(this.flags);
    writer.writeSlice(fromBase58Check(this.requestId).hash);

    if (this.hasPermissions()) {

        writer.writeCompactSize(this.permissions.length);   
        for (let i = 0; i < this.permissions.length; i++) {
          writer.writeCompactSize(this.permissions[i].type);
          writer.writeSlice(this.permissions[i].identity.toBuffer());
        }
    }

    if (this.hascallbackUris()) {
      writer.writeCompactSize(this.callbackUris.length);
      for (let i = 0; i < this.callbackUris.length; i++) {
        writer.writeCompactSize(this.callbackUris[i].type);
        writer.writeVarSlice(Buffer.from(this.callbackUris[i].uri, 'utf8'));
      }
    }

    if (this.hasExpiryTime()) {
      writer.writeCompactSize(this.expiryTime);
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);

    this.flags = reader.readVarInt();
    this.requestId = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);

    if (this.hasPermissions()) {
      this.permissions = [];
      const permissionsLength = reader.readCompactSize();
      for (let i = 0; i < permissionsLength; i++) {
        const compactId = new CompactIdAddressObject();
        const type = reader.readCompactSize();
        const identityOffset = reader.offset;
        reader.offset = compactId.fromBuffer(buffer, identityOffset);
        this.permissions.push({
          type: type,
          identity: compactId
        });
      }
    } 

    if (this.hascallbackUris()) {
      this.callbackUris = [];
      const callbackUrisLength = reader.readCompactSize();
      for (let i = 0; i < callbackUrisLength; i++) {
        this.callbackUris.push({
          type: reader.readCompactSize(),
          uri: reader.readVarSlice().toString('utf8')
        });
      }
    }

    if (this.hasExpiryTime()) {
      this.expiryTime = reader.readCompactSize();
    }

    return reader.offset;
  }

  toJson() {
    this.setFlags();

    const retval = {
      version: this.version.toNumber(),
      flags: this.flags.toNumber(),
      requestid: this.requestId,
      permissions: this.permissions ? this.permissions.map(p => ({type: p.type,
          identity: p.identity.toJson()})) : undefined,
      callbackUris: this.callbackUris ? this.callbackUris : undefined,
      expirytime: this.expiryTime ? this.expiryTime : undefined
    };

    return retval;
  }

  static fromJson(data: LoginRequestDetailsJson): LoginRequestDetails {

    const loginDetails = new LoginRequestDetails();

    loginDetails.version = new BN(data?.version || 0);
    loginDetails.flags = new BN(data?.flags || 0);
    loginDetails.requestId = data.requestid;

    if(loginDetails.hasPermissions() && data.permissions) {      
      loginDetails.permissions = data.permissions.map(p => ({type: p.type,
        identity: CompactIdAddressObject.fromJson(p.identity)}));
    }

    if(loginDetails.hascallbackUris() && data.callbackUris) {
      loginDetails.callbackUris = data.callbackUris.map(c => ({type: c.type,
        uri: c.uri}));
    }

    if(loginDetails.hasExpiryTime() && data.expirytime) {
      loginDetails.expiryTime = data.expirytime;
    }

    return loginDetails;
  }


  setFlags() {
    this.flags = new BN(0, 10);
    if (this.permissions) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_PERMISSIONS);
    }
    if (this.callbackUris) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
    }
    if (this.expiryTime) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
    }
  }   

  isValid(): boolean {
    let valid = this.requestId != null && this.requestId.length > 0;
    valid &&= this.flags != null && this.flags.gte(new BN(0));
    
    // Validate requestId is a valid base58 address
    try {
      fromBase58Check(this.requestId);
    } catch {
      valid = false;
    }

    if (this.hasPermissions()) {
      if (!this.permissions || this.permissions.length === 0) {
        return false;
      }
    }

    if (this.hascallbackUris()) {
      if (!this.callbackUris || this.callbackUris.length === 0) {
        return false;
      }
    }

    if (this.hasExpiryTime()) {
      if (!this.expiryTime || this.expiryTime === 0) {
        return false;
      }
    }

    return valid;
  }
}