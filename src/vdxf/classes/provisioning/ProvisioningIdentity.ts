import bufferutils from "../../../utils/bufferutils";
import { BigNumber } from "../../../utils/types/BigNumber";
import { BN } from "bn.js";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import varuint from "../../../utils/varuint";
import { I_ADDR_VERSION } from '../../../constants/vdxf';
import { fromBase58Check, toBase58Check } from "../../../utils/address";
import varint from "../../../utils/varint";
import { createHash } from "crypto";

export interface ProvisionIdentityInterface {
  version?: BigNumber;
  flags: BigNumber;  
  system_id?: string;
  parent_id?: string;
  identity_id?: string;
  fqn?: string;
  webhook?: string;
}

export class ProvisionIdentity implements SerializableEntity {

  version: BigNumber = ProvisionIdentity.VERSION_CURRENT;
  flags: BigNumber;  
  system_id?: string;
  parent_id: string;
  identity_id?: string;
  fqn?: string;
  webhook?: string;
  
  // Version
  static VERSION_CURRENT = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static FLAG_SYSTEM_AS_SIGNATURE = new BN(1, 10);
  static FLAG_PARENT_AS_FQN = new BN(2, 10);
  static FLAG_HAS_WEBHOOK = new BN(4, 10);
  static FLAG_HAS_IDENTITYID = new BN(8, 10);
  static FLAG_HAS_FQN = new BN(16, 10);

  constructor(
    provisionIdentity: ProvisionIdentityInterface = {
      flags: new BN(0, 10)}
  ) {
    this.version = provisionIdentity.version || ProvisionIdentity.VERSION_CURRENT;
    this.flags = provisionIdentity.flags;
    this.system_id = provisionIdentity?.system_id;
    this.parent_id = provisionIdentity?.parent_id;
    this.identity_id = provisionIdentity?.identity_id;
    this.fqn = provisionIdentity?.fqn;
    this.webhook = provisionIdentity?.webhook;

  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);
    if (!this.flags.and(ProvisionIdentity.FLAG_SYSTEM_AS_SIGNATURE).eq(ProvisionIdentity.FLAG_SYSTEM_AS_SIGNATURE)) {
      length += 20; // system_id as hash
    }

    if (this.flags.and(ProvisionIdentity.FLAG_PARENT_AS_FQN).eq(ProvisionIdentity.FLAG_PARENT_AS_FQN)) {
      length += varuint.encodingLength(this.parent_id ? this.parent_id.length : 0);
      length += this.parent_id ? Buffer.from(this.parent_id, 'utf8').length : 0;
    } else {
      length += 20; // parent_id as hash
    }

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_IDENTITYID).eq(ProvisionIdentity.FLAG_HAS_IDENTITYID)) {
      length += 20; // identity_id as hash
    } 

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_FQN).eq(ProvisionIdentity.FLAG_HAS_FQN)) {
      length += varuint.encodingLength(this.fqn ? this.fqn.length : 0);
      length += this.fqn ? Buffer.from(this.fqn, 'utf8').length : 0;
    }

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_WEBHOOK).eq(ProvisionIdentity.FLAG_HAS_WEBHOOK)) {
      length += varuint.encodingLength(this.webhook ? this.webhook.length : 0);
      length += this.webhook ? Buffer.from(this.webhook, 'utf8').length : 0;
    }

    return length;
  }

  toBuffer(): Buffer {
    this.setFlags();
    const writer = new bufferutils.BufferWriter(Buffer.alloc(this.getByteLength()))

    writer.writeVarInt(this.flags);

    if (!this.flags.and(ProvisionIdentity.FLAG_SYSTEM_AS_SIGNATURE).eq(ProvisionIdentity.FLAG_SYSTEM_AS_SIGNATURE)) {
      writer.writeSlice(fromBase58Check(this.system_id).hash);
    }

    if (this.flags.and(ProvisionIdentity.FLAG_PARENT_AS_FQN).eq(ProvisionIdentity.FLAG_PARENT_AS_FQN)) {
      writer.writeVarSlice(Buffer.from(this.parent_id || '', 'utf8'));
    } else {
      writer.writeSlice(fromBase58Check(this.parent_id).hash);
    }

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_IDENTITYID).eq(ProvisionIdentity.FLAG_HAS_IDENTITYID)) {
      writer.writeSlice(fromBase58Check(this.identity_id).hash);
    }

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_FQN).eq(ProvisionIdentity.FLAG_HAS_FQN)) {
      writer.writeVarSlice(Buffer.from(this.fqn || '', 'utf8'));
    }

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_WEBHOOK).eq(ProvisionIdentity.FLAG_HAS_WEBHOOK)) {
      writer.writeVarSlice(Buffer.from(this.webhook || '', 'utf8'));
    }

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);
    if (buffer.length == 0) throw new Error("Cannot create provision identity from empty buffer");

    this.flags = reader.readVarInt();

    if (!this.flags.and(ProvisionIdentity.FLAG_SYSTEM_AS_SIGNATURE).eq(ProvisionIdentity.FLAG_SYSTEM_AS_SIGNATURE)) {
      this.system_id = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
    }

    if (this.flags.and(ProvisionIdentity.FLAG_PARENT_AS_FQN).eq(ProvisionIdentity.FLAG_PARENT_AS_FQN)) {
      this.parent_id = reader.readVarSlice().toString('utf8');
    } else {
      this.parent_id = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
    }

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_IDENTITYID).eq(ProvisionIdentity.FLAG_HAS_IDENTITYID)) {
      this.identity_id = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);
    }

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_FQN).eq(ProvisionIdentity.FLAG_HAS_FQN)) {
      this.fqn = reader.readVarSlice().toString('utf8');
    }

    if (this.flags.and(ProvisionIdentity.FLAG_HAS_WEBHOOK).eq(ProvisionIdentity.FLAG_HAS_WEBHOOK)) {
      this.webhook = reader.readVarSlice().toString('utf8');
    }

    return reader.offset;
  }

  toJson() {
    this.setFlags();
    return {
      version: this.version ? this.version.toNumber() : 0,
      flags: this.flags ? this.flags.toNumber() : 0,
      system_id: this.system_id,
      parent_id: this.parent_id,
      identity_id: this.identity_id,
      fqn: this.fqn,
      webhook: this.webhook
    };
  }

  static fromJson(data: any): ProvisionIdentity {
    return new ProvisionIdentity({
      version: new BN(data?.version || 0),
      flags: new BN(data?.flags || 0),
      system_id: data.system_id,
      parent_id: data.parent_id,
      identity_id: data.identity_id,
      fqn: data.fqn,
      webhook: data.webhook
    })
  }


  setFlags() {
    this.flags = new BN(0, 10);
    
    if (!this.system_id) {
      this.flags = this.flags.or(ProvisionIdentity.FLAG_SYSTEM_AS_SIGNATURE);
    }
    
    if (this.parent_id) {
      // Check if parent_id is a valid base58 address or should be treated as FQN
      try {
        fromBase58Check(this.parent_id);
        // If it doesn't throw, it's a valid address, don't set FQN flag
      } catch {
        // If it throws, treat as FQN
        this.flags = this.flags.or(ProvisionIdentity.FLAG_PARENT_AS_FQN);
      }
    }
    
    if (this.identity_id) {
      this.flags = this.flags.or(ProvisionIdentity.FLAG_HAS_IDENTITYID);
    }
    
    if (this.fqn) {
      this.flags = this.flags.or(ProvisionIdentity.FLAG_HAS_FQN);
    }
    
    if (this.webhook) {
      this.flags = this.flags.or(ProvisionIdentity.FLAG_HAS_WEBHOOK);
    }
  }   

  isValid(): boolean {
    let valid = this.flags != null && this.flags.gte(new BN(0));
    
    // At minimum, we need either system_id or parent_id
    valid &&= (this.parent_id != null && this.parent_id.length > 0);
    
    return valid;
  }

   toSha256() {
      return createHash("sha256").update(this.toBuffer()).digest();
    }
}