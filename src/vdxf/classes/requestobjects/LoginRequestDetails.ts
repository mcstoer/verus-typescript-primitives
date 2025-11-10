
/**
 * LoginRequestDetails - Class for handling application login and authentication requests
 * 
 * This class is used when an application is requesting authentication or login from the user,
 * including specific recipientConstraints and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Callback URIs for post-authentication redirects
 * - Optional expiry time for the authentication session
 * 
 * The user's wallet can use these parameters to present a clear authentication request
 * to the user, showing exactly what recipientConstraints are being requested and where they will
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
  recipientConstraints?: Array<RecipientConstraint>;
  callbackUris?: Array<callbackUris>;
  expiryTime?: BigNumber; // UNIX Timestamp
}

export interface RecipientConstraintJson {
  type: number;
  identity: CompactIdAddressObjectJson;
}

export interface callbackUrisJson {
  type: number;
  uri: string;
}
export interface RecipientConstraint {
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
  recipientConstraints?: Array<RecipientConstraintJson>;
  callbackUris?: Array<callbackUrisJson>;
  expirytime?: number;
}

export class LoginRequestDetails implements SerializableEntity {
  version: BigNumber;
  flags?: BigNumber;  
  requestId: string;
  recipientConstraints?: Array<RecipientConstraint>;
  callbackUris?: Array<callbackUris>;
  expiryTime?: BigNumber; // UNIX Timestamp

  // Version
  static DEFAULT_VERSION = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static FLAG_HAS_RECIPIENT_CONSTRAINTS = new BN(1, 10);
  static FLAG_HAS_CALLBACK_URI = new BN(2, 10);
  static FLAG_HAS_EXPIRY_TIME = new BN(4, 10);

  // Recipient Constraint Types - What types of Identity can login, e.g. REQUIRED_SYSTEM and "VRSC" means only identities on the Verus chain can login
  static REQUIRED_ID = 1;
  static REQUIRED_SYSTEM = 2;
  static REQUIRED_PARENT = 3;

  // Callback URI Types
  static TYPE_WEBHOOK = 1;
  static TYPE_REDIRECT = 2;

  constructor(
    request?: LoginRequestDetailsInterface 
  ) {

    this.version = request?.version || LoginRequestDetails.DEFAULT_VERSION;
    this.requestId = request?.requestId || '';
    this.flags = request?.flags || new BN(0, 10);
    this.recipientConstraints = request?.recipientConstraints || null;
    this.callbackUris = request?.callbackUris || null;
    this.expiryTime = request?.expiryTime || null;

    this.setFlags();
  }

  hasRecipentConstraints(): boolean {   
      return this.flags.and(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS).eq(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
  }

  hascallbackUris(): boolean {
    return this.flags.and(LoginRequestDetails.FLAG_HAS_CALLBACK_URI).eq(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
  }

  hasExpiryTime(): boolean {
    return this.flags.and(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME).eq(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
  }

  calcFlags(flags: BigNumber = this.flags): BigNumber {

    if (this.recipientConstraints) {
      flags = flags.or(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
    }
    if (this.callbackUris) {
      flags = flags.or(LoginRequestDetails.FLAG_HAS_CALLBACK_URI);
    }
    if (this.expiryTime) {
      flags = flags.or(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
    } 
    return flags;
  }

  getByteLength(): number {

    let length = 0;

    length += varuint.encodingLength(this.flags.toNumber());
    length += 20; // requestId hash length

    if (this.hasRecipentConstraints()) {

      length += varuint.encodingLength(this.recipientConstraints.length);      
        for (let i = 0; i < this.recipientConstraints.length; i++) {
          length += varuint.encodingLength(this.recipientConstraints[i].type);
          length += this.recipientConstraints[i].identity.getByteLength();
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
      length += varuint.encodingLength(this.expiryTime.toNumber());
    }

    return length;
  }

  toBuffer(): Buffer {

    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()))

    writer.writeCompactSize(this.flags.toNumber());
    writer.writeSlice(fromBase58Check(this.requestId).hash);

    if (this.hasRecipentConstraints()) {

        writer.writeCompactSize(this.recipientConstraints.length);   
        for (let i = 0; i < this.recipientConstraints.length; i++) {
          writer.writeCompactSize(this.recipientConstraints[i].type);
          writer.writeSlice(this.recipientConstraints[i].identity.toBuffer());
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
      writer.writeCompactSize(this.expiryTime.toNumber());
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);

    this.flags = new BN(reader.readCompactSize());
    this.requestId = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);

    if (this.hasRecipentConstraints()) {
      this.recipientConstraints = [];
      const recipientConstraintsLength = reader.readCompactSize();
      for (let i = 0; i < recipientConstraintsLength; i++) {
        const compactId = new CompactIdAddressObject();
        const type = reader.readCompactSize();
        const identityOffset = reader.offset;
        reader.offset = compactId.fromBuffer(buffer, identityOffset);
        this.recipientConstraints.push({
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
      this.expiryTime = new BN(reader.readCompactSize());
    }

    return reader.offset;
  }

  toJson(): LoginRequestDetailsJson {
    const flags = this.calcFlags();

    const retval = {
      version: this.version.toNumber(),
      flags: flags.toNumber(),
      requestid: this.requestId,
      recipientConstraints: this.recipientConstraints ? this.recipientConstraints.map(p => ({type: p.type,
          identity: p.identity.toJson()})) : undefined,
      callbackUris: this.callbackUris ? this.callbackUris : undefined,
      expirytime: this.expiryTime ? this.expiryTime.toNumber() : undefined
    };

    return retval;
  }

  static fromJson(data: LoginRequestDetailsJson): LoginRequestDetails {

    const loginDetails = new LoginRequestDetails();

    loginDetails.version = new BN(data?.version || 0);
    loginDetails.flags = new BN(data?.flags || 0);
    loginDetails.requestId = data.requestid;

    if(loginDetails.hasRecipentConstraints() && data.recipientConstraints) {
      loginDetails.recipientConstraints = data.recipientConstraints.map(p => ({type: p.type,
        identity: CompactIdAddressObject.fromJson(p.identity)}));
    }

    if(loginDetails.hascallbackUris() && data.callbackUris) {
      loginDetails.callbackUris = data.callbackUris.map(c => ({type: c.type,
        uri: c.uri}));
    }

    if(loginDetails.hasExpiryTime() && data.expirytime) {
      loginDetails.expiryTime = new BN(data.expirytime);
    }

    return loginDetails;
  }

  setFlags() {
    this.flags = this.calcFlags();
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

    if (this.hasRecipentConstraints()) {
      if (!this.recipientConstraints || this.recipientConstraints.length === 0) {
        return false;
      }
    }

    if (this.hascallbackUris()) {
      if (!this.callbackUris || this.callbackUris.length === 0) {
        return false;
      }
    }

    if (this.hasExpiryTime()) {
      if (!this.expiryTime || this.expiryTime.isZero()) {
        return false;
      }
    }

    return valid;
  }
}