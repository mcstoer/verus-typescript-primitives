
/**
 * LoginRequestDetails - Class for handling application login and authentication requests
 * 
 * This class is used when an application is requesting authentication or login from the user,
 * including specific recipientConstraints and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Response URIs for post-authentication redirects
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
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../../constants/vdxf';
import { fromBase58Check, toBase58Check } from "../../../utils/address";
import { CompactAddressObject, CompactAddressObjectJson } from "../CompactAddressObject";
import { ResponseURI, ResponseURIJson } from "../ResponseURI";

export interface LoginRequestDetailsInterface {
  version?: BigNumber;
  flags?: BigNumber;  
  requestID: string;
  recipientConstraints?: Array<RecipientConstraint>;
  responseURIs?: Array<ResponseURI>;
  expiryTime?: BigNumber; // UNIX Timestamp
}

export interface RecipientConstraintJson {
  type: number;
  identity: CompactAddressObjectJson;
}

export interface RecipientConstraint {
  type: number;
  identity: CompactAddressObject;
}

export interface LoginRequestDetailsJson {
  version: number;
  requestid: string;
  flags: number;
  recipientConstraints?: Array<RecipientConstraintJson>;
  responseURIs?: Array<ResponseURIJson>;
  expirytime?: number;
}

export class LoginRequestDetails implements SerializableEntity {
  version: BigNumber;
  flags?: BigNumber;  
  requestID: string;
  recipientConstraints?: Array<RecipientConstraint>;
  responseURIs?: Array<ResponseURI>;
  expiryTime?: BigNumber; // UNIX Timestamp

  // Version
  static DEFAULT_VERSION = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static FLAG_HAS_RECIPIENT_CONSTRAINTS = new BN(1, 10);
  static FLAG_HAS_RESPONSE_URIS = new BN(2, 10);
  static FLAG_HAS_EXPIRY_TIME = new BN(4, 10);

  // Recipient Constraint Types - What types of Identity can login, e.g. REQUIRED_SYSTEM and "VRSC" means only identities on the Verus chain can login
  static REQUIRED_ID = 1;
  static REQUIRED_SYSTEM = 2;
  static REQUIRED_PARENT = 3;

  constructor(
    request?: LoginRequestDetailsInterface 
  ) {
    this.version = request?.version || LoginRequestDetails.DEFAULT_VERSION;
    this.requestID = request?.requestID || '';
    this.flags = request?.flags || new BN(0, 10);
    this.recipientConstraints = request?.recipientConstraints || null;
    this.responseURIs = request?.responseURIs || null;
    this.expiryTime = request?.expiryTime || null;

    this.setFlags();
  }

  hasRecipentConstraints(): boolean {   
    return this.flags.and(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS).eq(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
  }

  hasResponseURIs(): boolean {
    return this.flags.and(LoginRequestDetails.FLAG_HAS_RESPONSE_URIS).eq(LoginRequestDetails.FLAG_HAS_RESPONSE_URIS);
  }

  hasExpiryTime(): boolean {
    return this.flags.and(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME).eq(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
  }

  calcFlags(flags: BigNumber = this.flags): BigNumber {
    if (this.recipientConstraints) {
      flags = flags.or(LoginRequestDetails.FLAG_HAS_RECIPIENT_CONSTRAINTS);
    }
    if (this.responseURIs) {
      flags = flags.or(LoginRequestDetails.FLAG_HAS_RESPONSE_URIS);
    }
    if (this.expiryTime) {
      flags = flags.or(LoginRequestDetails.FLAG_HAS_EXPIRY_TIME);
    } 
    return flags;
  }

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.flags.toNumber());
    length += HASH160_BYTE_LENGTH;

    if (this.hasRecipentConstraints()) {
      length += varuint.encodingLength(this.recipientConstraints.length);      
      for (let i = 0; i < this.recipientConstraints.length; i++) {
        length += varuint.encodingLength(this.recipientConstraints[i].type);
        length += this.recipientConstraints[i].identity.getByteLength();
      }      
    }

    if (this.hasResponseURIs()) {
      length += varuint.encodingLength(this.responseURIs.length);

      for (let i = 0; i < this.responseURIs.length; i++) {
        length += this.responseURIs[i].getByteLength();
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
    writer.writeSlice(fromBase58Check(this.requestID).hash);

    if (this.hasRecipentConstraints()) {
      writer.writeCompactSize(this.recipientConstraints.length);   
      for (let i = 0; i < this.recipientConstraints.length; i++) {
        writer.writeCompactSize(this.recipientConstraints[i].type);
        writer.writeSlice(this.recipientConstraints[i].identity.toBuffer());
      }
    }

    if (this.hasResponseURIs()) {
      writer.writeCompactSize(this.responseURIs.length);

      for (let i = 0; i < this.responseURIs.length; i++) {
        writer.writeSlice(this.responseURIs[i].toBuffer());
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
    this.requestID = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);

    if (this.hasRecipentConstraints()) {
      this.recipientConstraints = [];
      const recipientConstraintsLength = reader.readCompactSize();

      for (let i = 0; i < recipientConstraintsLength; i++) {
        const compactId = new CompactAddressObject();
        const type = reader.readCompactSize();
        const identityOffset = reader.offset;
        reader.offset = compactId.fromBuffer(buffer, identityOffset);
        this.recipientConstraints.push({
          type: type,
          identity: compactId
        });
      }
    } 

    if (this.hasResponseURIs()) {
      this.responseURIs = [];
      const callbackURIsLength = reader.readCompactSize();

      for (let i = 0; i < callbackURIsLength; i++) {
        const newURI = new ResponseURI();
        reader.offset = newURI.fromBuffer(reader.buffer, reader.offset);
        this.responseURIs.push(newURI);
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
      requestid: this.requestID,
      recipientConstraints: this.recipientConstraints ? this.recipientConstraints.map(p => ({type: p.type,
          identity: p.identity.toJson()})) : undefined,
      responseURIs: this.responseURIs ? this.responseURIs.map(x => x.toJson()) : undefined,
      expirytime: this.expiryTime ? this.expiryTime.toNumber() : undefined
    };

    return retval;
  }

  static fromJson(data: LoginRequestDetailsJson): LoginRequestDetails {

    const loginDetails = new LoginRequestDetails();

    loginDetails.version = new BN(data?.version || 0);
    loginDetails.flags = new BN(data?.flags || 0);
    loginDetails.requestID = data.requestid;

    if(loginDetails.hasRecipentConstraints() && data.recipientConstraints) {
      loginDetails.recipientConstraints = data.recipientConstraints.map(p => ({type: p.type,
        identity: CompactAddressObject.fromJson(p.identity)}));
    }

    if(loginDetails.hasResponseURIs() && data.responseURIs) {
      loginDetails.responseURIs = data.responseURIs.map(c => ResponseURI.fromJson(c));
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
    let valid = this.requestID != null && this.requestID.length > 0;
    valid &&= this.flags != null && this.flags.gte(new BN(0));
    
    // Validate requestID is a valid base58 address
    try {
      fromBase58Check(this.requestID);
    } catch {
      valid = false;
    }

    if (this.hasRecipentConstraints()) {
      if (!this.recipientConstraints || this.recipientConstraints.length === 0) {
        return false;
      }
    }

    if (this.hasResponseURIs()) {
      if (!this.responseURIs || this.responseURIs.length === 0) {
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