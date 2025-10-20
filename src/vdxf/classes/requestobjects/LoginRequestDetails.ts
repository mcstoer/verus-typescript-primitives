
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

export interface LoginPermissionJson {
  type: number;
  identity: CompactIdAddressObjectJson;
}

export interface CallbackUriJson {
  type: number;
  uri: string;
}
export interface LoginPermission {
  type: BigNumber;
  identity: CompactIdAddressObject;
}

export interface CallbackUri {
  type: BigNumber;
  uri: string;
}

export interface LoginRequestDetailsJson {
  version: number;
  requestid: string;
  flags: number;
  permissions?: Array<LoginPermissionJson>;
  callbackuri?: Array<CallbackUriJson>;
  expirytime?: number;
}

export class LoginRequestDetails implements SerializableEntity {
  version: BigNumber;
  flags?: BigNumber;  
  requestId: string;
  permissions?: Array<LoginPermission>;
  callbackUri?: Array<CallbackUri>;
  expiryTime?: BigNumber;

  // Version
  static DEFAULT_VERSION = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static FLAG_HAS_PERMISSIONS = new BN(1, 10);
  static FLAG_HAS_CALLBACK_URI = new BN(2, 10);
  static FLAG_HAS_EXPIRY_TIME = new BN(4, 10);

  // Permission Types
  static REQUIRED_ID = new BN(1, 10);
  static REQUIRED_SYSTEM = new BN(2, 10);
  static REQUIRED_PARENT = new BN(3, 10);

  // Callback URI Types
  static TYPE_WEBHOOK = new BN(1, 10);
  static TYPE_REDIRECT = new BN(2, 10);
  static TYPE_DEEPLINK = new BN(3, 10);

  constructor(
    request?: LoginRequestDetails 
  ) {

    this.version = request?.version || LoginRequestDetails.DEFAULT_VERSION;
    this.requestId = request?.requestId || '';
    this.flags = request?.flags || new BN(0, 10);
    this.permissions = request?.permissions || null;
    this.callbackUri = request?.callbackUri || null;
    this.expiryTime = request?.expiryTime || null;
  }

  hasPermissions(): boolean {   
      return this.flags.and(LoginRequestDetails.FLAG_HAS_PERMISSIONS).eq(LoginRequestDetails.FLAG_HAS_PERMISSIONS);
  }

  hasCallbackUri(): boolean {
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
          length += varint.encodingLength(new BN(this.permissions[i].type));
          length += this.permissions[i].identity.getByteLength();
        }      
    }

    if (this.hasCallbackUri()) {
      length += varuint.encodingLength(this.callbackUri.length);
        for (let i = 0; i < this.callbackUri.length; i++) {
          length += varint.encodingLength(new BN(this.callbackUri[i].type));
          length += varuint.encodingLength(Buffer.from(this.callbackUri[i].uri, 'utf8').byteLength);
          length += Buffer.from(this.callbackUri[i].uri, 'utf8').byteLength;
        }
    }

    if (this.hasExpiryTime()) {
      length += varint.encodingLength(this.expiryTime);
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
          writer.writeVarInt(new BN(this.permissions[i].type));
          writer.writeSlice(this.permissions[i].identity.toBuffer());
        }
    }

    if (this.hasCallbackUri()) {
      writer.writeCompactSize(this.callbackUri.length);
      for (let i = 0; i < this.callbackUri.length; i++) {
        writer.writeVarInt(new BN(this.callbackUri[i].type));
        writer.writeVarSlice(Buffer.from(this.callbackUri[i].uri, 'utf8'));
      }
    }

    if (this.hasExpiryTime()) {
      writer.writeVarInt(this.expiryTime);
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
        const type = reader.readVarInt();
        const identityOffset = reader.offset;
        reader.offset = compactId.fromBuffer(buffer, identityOffset);
        this.permissions.push({
          type: type,
          identity: compactId
        });
      }
    } 

    if (this.hasCallbackUri()) {
      this.callbackUri = [];
      const callbackUriLength = reader.readCompactSize();
      for (let i = 0; i < callbackUriLength; i++) {
        this.callbackUri.push({
          type: reader.readVarInt(),
          uri: reader.readVarSlice().toString('utf8')
        });
      }
    }

    if (this.hasExpiryTime()) {
      this.expiryTime = reader.readVarInt();
    }

    return reader.offset;
  }

  toJson() {
    this.setFlags();

    const retval = {
      version: this.version.toNumber(),
      flags: this.flags.toNumber(),
      requestid: this.requestId,
      permissions: this.permissions ? this.permissions.map(p => ({type: p.type.toNumber(),
          identity: p.identity.toJson()})) : undefined,
      callbackuri: this.callbackUri ? this.callbackUri : undefined,
      expirytime: this.expiryTime ? this.expiryTime.toNumber() : undefined
    };

    return retval;
  }

  static fromJson(data: LoginRequestDetailsJson): LoginRequestDetails {

    const loginDetails = new LoginRequestDetails();

    loginDetails.version = new BN(data?.version || 0);
    loginDetails.flags = new BN(data?.flags || 0);
    loginDetails.requestId = data.requestid;

    if(loginDetails.hasPermissions() && data.permissions) {      
      loginDetails.permissions = data.permissions.map(p => ({type: new BN(p.type),
        identity: CompactIdAddressObject.fromJson(p.identity)}));
    }

    if(loginDetails.hasCallbackUri() && data.callbackuri) {
      loginDetails.callbackUri = data.callbackuri.map(c => ({type: new BN(c.type),
        uri: c.uri}));
    }

    if(loginDetails.hasExpiryTime() && data.expirytime) {
      loginDetails.expiryTime = new BN(data.expirytime);
    }

    return loginDetails;
  }


  setFlags() {
    this.flags = new BN(0, 10);
    if (this.permissions) {
      this.flags = this.flags.or(LoginRequestDetails.FLAG_HAS_PERMISSIONS);
    }
    if (this.callbackUri) {
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

    if (this.hasCallbackUri()) {
      if (!this.callbackUri || this.callbackUri.length === 0) {
        return false;
      }
    }

    if (this.hasExpiryTime()) {
      if (!this.expiryTime || this.expiryTime.lte(new BN(0))) {
        return false;
      }
    }

    return valid;
  }
}