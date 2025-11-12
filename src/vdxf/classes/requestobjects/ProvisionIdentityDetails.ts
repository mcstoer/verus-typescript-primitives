/**
 * ProvisioningIdentity - Class for handling identity provisioning requests
 * 
 * This class is used when an application is requesting the provisioning or creation of a new identity
 * within the Verus blockchain ecosystem. The request includes:
 * - System ID (e.g., VRSC@) defining the blockchain system
 * - Parent ID (e.g., Token@) defining the parent namespace 
 * - Identity ID (e.g., john.VRSC@) defining the full identity to be provisioned
 * - Flags indicating which components are present and required
 * 
 * The user's wallet can use these parameters to understand the complete identity hierarchy
 * and present a clear provisioning request to the user, showing the system context,
 * parent namespace, and the specific identity being created. This enables secure,
 * user-controlled identity provisioning with proper namespace management.
 */

import bufferutils from "../../../utils/bufferutils";
import { BigNumber } from "../../../utils/types/BigNumber";
import { BN } from "bn.js";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { CompactIdAddressObject, CompactIdAddressObjectJson } from "../CompactIdAddressObject";
import varuint from "../../../utils/varuint";

export interface ProvisionIdentityDetailsInterface {
  version?: BigNumber;
  flags: BigNumber;  
  systemID?: CompactIdAddressObject; // system e.g. VRSC@
  parentID?: CompactIdAddressObject; // parent e.g. Token@
  identityID?: CompactIdAddressObject; // Full identity e.g. john.VRSC@
}

export interface ProvisionIdentityDetailsJson {
  version?: number;
  flags: number;  
  systemid?: CompactIdAddressObjectJson;
  parentid?: CompactIdAddressObjectJson;
  identityid?: CompactIdAddressObjectJson;
}

export class ProvisionIdentityDetails implements SerializableEntity {
  version: BigNumber;
  flags: BigNumber;  
  systemID?: CompactIdAddressObject; // system e.g. VRSC@
  parentID?: CompactIdAddressObject; // parent e.g. Token@
  identityID?: CompactIdAddressObject; // Full identity e.g. john.VRSC@
  
  // Version
  static DEFAULT_VERSION = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  // flags include params // parent same as signer
  static FLAG_HAS_SYSTEMID = new BN(1, 10);
  static FLAG_HAS_PARENTID = new BN(2, 10);
  static FLAG_IS_A_DEFINED_NAME_TO_PROVISION = new BN(4, 10);

  constructor(data?: ProvisionIdentityDetailsInterface) {
    this.version = data?.version || ProvisionIdentityDetails.DEFAULT_VERSION;
    this.flags = data?.flags || new BN(0, 10);
    this.systemID = data?.systemID;
    this.parentID = data?.parentID;
    this.identityID = data?.identityID;

    this.setFlags();
  }

  hasSystemId(): boolean {
    return this.flags.and(ProvisionIdentityDetails.FLAG_HAS_SYSTEMID).eq(ProvisionIdentityDetails.FLAG_HAS_SYSTEMID);
  }

  hasParentId(): boolean {
    return this.flags.and(ProvisionIdentityDetails.FLAG_HAS_PARENTID).eq(ProvisionIdentityDetails.FLAG_HAS_PARENTID);
  }

  hasIdentityId(): boolean {
    return this.flags.and(ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION).eq(ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION);
  }

  getByteLength(): number {
    let length = 0;

    length += varuint.encodingLength(this.flags.toNumber());
    if (this.hasSystemId()) {
      length += this.systemID.getByteLength();
    }

    if (this.hasParentId()) {
      length += this.parentID.getByteLength();
    } 

    if (this.hasIdentityId()) {
      length += this.identityID.getByteLength();
    } 

    return length;
  }

  toBuffer(): Buffer {
    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()))

    writer.writeCompactSize(this.flags.toNumber());

    if (this.hasSystemId()) {
      writer.writeSlice(this.systemID.toBuffer());
    }

    if (this.hasParentId()) {
      writer.writeSlice(this.parentID.toBuffer());
    } 

    if (this.hasIdentityId()) {
      writer.writeSlice(this.identityID.toBuffer());
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);
    if (buffer.length == 0) throw new Error("Cannot create provision identity from empty buffer");

    this.flags = new BN(reader.readCompactSize());

    if (this.hasSystemId()) {
      const systemID = new CompactIdAddressObject();
      reader.offset = systemID.fromBuffer(reader.buffer, reader.offset);
      this.systemID = systemID;
    }

    if (this.hasParentId()) {
      const parentID = new CompactIdAddressObject();
      reader.offset = parentID.fromBuffer(reader.buffer, reader.offset);
      this.parentID = parentID;
    }

    if (this.hasIdentityId()) {
      const identityID = new CompactIdAddressObject();
      reader.offset = identityID.fromBuffer(reader.buffer, reader.offset);
      this.identityID = identityID;
    }

    return reader.offset;
  }

  toJson(): ProvisionIdentityDetailsJson {
    const flags = this.calcFlags();
    return {
      version: this.version.toNumber(),
      flags: flags.toNumber(),
      systemid: this.systemID ? this.systemID.toJson() : null,
      parentid: this.parentID ? this.parentID.toJson() : null,
      identityid: this.identityID ? this.identityID.toJson() : null,
    };
  }

  static fromJson(data: any): ProvisionIdentityDetails {

    const provision = new ProvisionIdentityDetails();
    provision.version = new BN(data?.version || 0);
    provision.flags = new BN(data?.flags || 0);

    if (provision.hasSystemId()) {
      provision.systemID = CompactIdAddressObject.fromJson(data.systemid);
    }

    if (provision.hasParentId()) {
      provision.parentID = CompactIdAddressObject.fromJson(data.parentid);
    }

    if (provision.hasIdentityId()) {
      provision.identityID = CompactIdAddressObject.fromJson(data.identityid);
    }

    return provision;
  }

  calcFlags(): BigNumber {
    let flags = new BN(0, 10);

    if (this.systemID) {
      flags = flags.or(ProvisionIdentityDetails.FLAG_HAS_SYSTEMID);
    }

    if (this.parentID) {
      flags = flags.or(ProvisionIdentityDetails.FLAG_HAS_PARENTID);
    }

    if (this.identityID) {
      flags = flags.or(ProvisionIdentityDetails.FLAG_IS_A_DEFINED_NAME_TO_PROVISION);
    }

    return flags;
  }

  setFlags() {
    this.flags = this.calcFlags();
  }


  isValid(): boolean {
    let valid = this.flags != null && this.flags.gte(new BN(0));

    valid &&= this.version != null;
     
    return valid;
  }

}