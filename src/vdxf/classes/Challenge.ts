import {
  LOGIN_CONSENT_CHALLENGE_VDXF_KEY,
  ID_ADDRESS_VDXF_KEY,
  ID_PARENT_VDXF_KEY,
  ID_SYSTEMID_VDXF_KEY,
  Utf8DataVdxfObject,
  VDXFObject,
  Utf8OrBase58Object,
} from "../";
import bufferutils from "../../utils/bufferutils";
import { BigNumber } from "../../utils/types/BigNumber";
import { BN } from "bn.js";
import { SerializableEntity } from "../../utils/types/SerializableEntity";
import varuint from "../../utils/varuint";
import { Context } from "./Context";
import { Hash160 } from "./Hash160";
import { I_ADDR_VERSION } from '../../constants/vdxf';
import { fromBase58Check, toBase58Check } from "../../utils/address";
import varint from "../../utils/varint";
import { createHash } from "crypto";

export class RedirectUri extends VDXFObject {
  uri: string;

  constructor(uri: string = "", vdxfkey: string = "") {
    super(vdxfkey);

    this.uri = uri;
  }

  dataByteLength(): number {
    return this.toDataBuffer().length;
  }

  toDataBuffer(): Buffer {
    return Buffer.from(this.uri, "utf-8");
  }

  fromDataBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);

    this.uri = reader.readVarSlice().toString("utf-8");

    return reader.offset;
  }

  toJson() {
    return {
      uri: this.uri,
      vdxfkey: this.vdxfkey,
    };
  }
}

export class Subject extends Utf8OrBase58Object {
  constructor(data: string = "", vdxfkey: string = "") {
    super(data, vdxfkey, [
      ID_ADDRESS_VDXF_KEY.vdxfid,
      ID_PARENT_VDXF_KEY.vdxfid,
      ID_SYSTEMID_VDXF_KEY.vdxfid,
    ]);
  }
}

export class ProvisioningInfo extends Utf8OrBase58Object {
  constructor(data: string = "", vdxfkey: string = "") {
    super(data, vdxfkey, [
      ID_ADDRESS_VDXF_KEY.vdxfid,
      ID_PARENT_VDXF_KEY.vdxfid,
      ID_SYSTEMID_VDXF_KEY.vdxfid,
    ]);
  }
}

export class RequestedPermission extends Utf8DataVdxfObject {
  constructor(vdxfkey: string = "") {
    super("", vdxfkey);
  }
}

export class Audience extends Utf8DataVdxfObject {}

export class AltAuthFactor extends Utf8DataVdxfObject {}

export class Attestation extends Utf8DataVdxfObject {}

export interface ChallengeInterface {
  // Challenge specific VDXF key
  challenge_id: string;

  // VDXF keys array of access requests
  requested_access?: Array<RequestedPermission> | null;

  // Array of members that will have access to scope
  requested_access_audience?: Array<Audience> | null;

  // Information about the ID you have to log in with, array of VDXF objects
  subject?: Array<Subject>;

  // Information about the provisioning endpoint and ID possibilities, can contain 
  // a webhook, and info regarding what ID will be provisioned to the user if they make a 
  // provisioning request.
  provisioning_info?: Array<ProvisioningInfo>

  // Array of alternate authentication factors required
  alt_auth_factors?: Array<AltAuthFactor> | null;

  // Temporary session VDXF key
  session_id?: string;

  // List of signatures, IDs and trust score objects
  attestations?: Array<Attestation>;

  // Array of VDXF objects defining behaviour on deeplink complete
  redirect_uris?: Array<RedirectUri>;

  // String of unix representation of date string
  created_at: number;

  // Boolean denoting whether or not to attempt to skip over UI based on
  // the user's decision to remember their login (will still be verified by the wallet)
  skip?: boolean;

  // Random hash string
  salt?: string;

  // Context
  context?: Context;
}

export class Challenge extends VDXFObject implements ChallengeInterface {
  challenge_id: string;
  requested_access?: Array<RequestedPermission> | null;
  requested_access_audience?: Array<RequestedPermission> | null;
  subject?: Array<Subject>;
  provisioning_info?: Array<ProvisioningInfo>;
  alt_auth_factors?: Array<AltAuthFactor> | null;
  session_id?: string;
  attestations?: Array<Attestation>;
  redirect_uris?: Array<RedirectUri>;
  created_at: number;
  skip?: boolean;
  salt?: string;
  context?: Context;

  constructor(
    challenge: ChallengeInterface = { challenge_id: "", created_at: 0 },
    vdxfkey: string = LOGIN_CONSENT_CHALLENGE_VDXF_KEY.vdxfid
  ) {
    super(vdxfkey);

    this.challenge_id = challenge.challenge_id;
    this.requested_access = challenge.requested_access
      ? challenge.requested_access.map((x) => new RequestedPermission(x.vdxfkey))
      : challenge.requested_access;
    this.requested_access_audience = challenge.requested_access_audience;
    this.subject = challenge.subject
      ? challenge.subject.map((x) => new Subject(x.data, x.vdxfkey))
      : challenge.subject;
    this.provisioning_info = challenge.provisioning_info
      ? challenge.provisioning_info.map((x) => new ProvisioningInfo(x.data, x.vdxfkey))
      : challenge.provisioning_info;
    this.alt_auth_factors = challenge.alt_auth_factors;
    this.session_id = challenge.session_id;
    this.attestations = challenge.attestations;
    this.redirect_uris = challenge.redirect_uris
      ? challenge.redirect_uris.map((x) => new RedirectUri(x.uri, x.vdxfkey))
      : challenge.redirect_uris;
    this.created_at = challenge.created_at;
    this.salt = challenge.salt;
    this.context = challenge.context
      ? new Context(challenge.context.kv)
      : challenge.context;
    this.skip = challenge.skip ? true : false;
  }

  dataByteLength(): number {
    let length = 0;

    const _challenge_id = Hash160.fromAddress(this.challenge_id, true);
    const _created_at = this.created_at;
    const _salt = this.salt
      ? Hash160.fromAddress(this.salt, true)
      : Hash160.getEmpty();
    const _session_id = this.session_id
      ? Hash160.fromAddress(this.session_id, true)
      : Hash160.getEmpty();
    const _requested_access = this.requested_access
      ? this.requested_access
      : [];
    const _requested_access_audience = [];
    const _subject = this.subject ? this.subject : [];
    const _provisioning_info = this.provisioning_info ? this.provisioning_info : [];
    const _alt_auth_factors = [];
    const _attestations = this.attestations ? this.attestations : [];
    const _redirect_uris = this.redirect_uris ? this.redirect_uris : [];
    const _context = this.context ? this.context : new Context({});

    length += _challenge_id.byteLength();

    length += 8; // created_at

    length += _salt.byteLength();

    if (this.vdxfkey === LOGIN_CONSENT_CHALLENGE_VDXF_KEY.vdxfid) {
      length += 1; // skip

      length += _session_id.byteLength();

      length += varuint.encodingLength(_requested_access.length);
      length += _requested_access.reduce(
        (sum, current) => sum + current.byteLength(),
        0
      );

      length += varuint.encodingLength(_requested_access_audience.length);

      length += varuint.encodingLength(_subject.length);
      length += _subject.reduce(
        (sum, current) => sum + current.byteLength(),
        0
      );

      length += varuint.encodingLength(_provisioning_info.length);
      length += _provisioning_info.reduce(
        (sum, current) => sum + current.byteLength(),
        0
      );

      length += varuint.encodingLength(_alt_auth_factors.length);

      length += varuint.encodingLength(_attestations.length);
      length += _attestations.reduce(
        (sum, current) => sum + current.byteLength(),
        0
      );

      length += varuint.encodingLength(_redirect_uris.length);
      length += _redirect_uris.reduce(
        (sum, current) => sum + current.byteLength(),
        0
      );
    }

    length += _context.byteLength();

    return length;
  }

  toDataBuffer(): Buffer {
    const buffer = Buffer.alloc(this.dataByteLength());
    const writer = new bufferutils.BufferWriter(buffer);

    const _challenge_id = Hash160.fromAddress(this.challenge_id, true);
    const _created_at = this.created_at;
    const _salt = this.salt
      ? Hash160.fromAddress(this.salt, true)
      : Hash160.getEmpty();
    const _session_id = this.session_id
      ? Hash160.fromAddress(this.session_id, true)
      : Hash160.getEmpty();
    const _requested_access = this.requested_access
      ? this.requested_access
      : [];
    const _requested_access_audience = [];
    const _subject = this.subject ? this.subject : [];
    const _provisioning_info = this.provisioning_info ? this.provisioning_info : [];
    const _alt_auth_factors = [];
    const _attestations = this.attestations ? this.attestations : [];
    const _redirect_uris = this.redirect_uris ? this.redirect_uris : [];
    const _context = this.context ? this.context : new Context({});

    writer.writeSlice(_challenge_id.toBuffer());

    writer.writeUInt64(_created_at);

    writer.writeSlice(_salt.toBuffer());

    if (this.vdxfkey === LOGIN_CONSENT_CHALLENGE_VDXF_KEY.vdxfid) {
      writer.writeUInt8(this.skip ? 1 : 0);

      writer.writeSlice(_session_id.toBuffer());

      writer.writeArray(_requested_access.map((x) => x.toBuffer()));

      writer.writeArray(_requested_access_audience.map((x) => x.toBuffer()));

      writer.writeArray(_subject.map((x) => x.toBuffer()));

      writer.writeArray(_provisioning_info.map((x) => x.toBuffer()));

      writer.writeArray(_alt_auth_factors.map((x) => x.toBuffer()));

      writer.writeArray(_attestations.map((x) => x.toBuffer()));

      writer.writeArray(_redirect_uris.map((x) => x.toBuffer()));
    }

    writer.writeSlice(_context.toBuffer());

    return writer.buffer;
  }

  fromDataBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);
    const challengeLength = reader.readCompactSize();

    if (challengeLength == 0) {
      throw new Error("Cannot create challenge from empty buffer");
    } else {
      const _challenge_id = new Hash160();
      reader.offset = _challenge_id.fromBuffer(
        reader.buffer,
        true,
        reader.offset
      );
      this.challenge_id = _challenge_id.toAddress();

      this.created_at = reader.readUInt64();

      const _salt = new Hash160();
      reader.offset = _salt.fromBuffer(reader.buffer, true, reader.offset);
      this.salt = _salt.toAddress();

      if (this.vdxfkey === LOGIN_CONSENT_CHALLENGE_VDXF_KEY.vdxfid) {
        this.skip = reader.readUInt8() === 1 ? true : false;

        const _session_id = new Hash160();
        reader.offset = _session_id.fromBuffer(
          reader.buffer,
          true,
          reader.offset
        );
        this.session_id = _session_id.toAddress();

        this.requested_access = [];
        const requestedAccessLength = reader.readCompactSize();

        for (let i = 0; i < requestedAccessLength; i++) {
          const _perm = new RequestedPermission();
          reader.offset = _perm.fromBuffer(reader.buffer, reader.offset);
          this.requested_access.push(_perm);
        }

        this.requested_access_audience = [];
        const audienceLength = reader.readCompactSize();

        if (audienceLength > 0) {
          throw new Error("Requested access audience currently unsupported");
        }

        this.subject = [];
        const subjectLength = reader.readCompactSize();

        for (let i = 0; i < subjectLength; i++) {
          const _subject = new Subject();
          reader.offset = _subject.fromBuffer(reader.buffer, reader.offset);
          this.subject.push(_subject);
        }

        this.provisioning_info = [];
        const provisioningInfoLength = reader.readCompactSize();

        for (let i = 0; i < provisioningInfoLength; i++) {
          const _provisioning_info = new ProvisioningInfo();
          reader.offset = _provisioning_info.fromBuffer(reader.buffer, reader.offset);
          this.provisioning_info.push(_provisioning_info);
        }

        this.alt_auth_factors = [];
        const altAuthFactorLength = reader.readCompactSize();

        if (altAuthFactorLength > 0) {
          throw new Error("Alt auth factors currently unsupported");
        }

        this.attestations = [];
        const attestationsLength = reader.readCompactSize();

        for (let i = 0; i < attestationsLength; i++) {
          const _att = new Attestation();
          reader.offset = _att.fromBuffer(reader.buffer, reader.offset);
          this.attestations.push(_att);
        }

        this.redirect_uris = [];
        const urisLength = reader.readCompactSize();

        for (let i = 0; i < urisLength; i++) {
          const _redirect_uri = new RedirectUri();
          reader.offset = _redirect_uri.fromBuffer(
            reader.buffer,
            reader.offset
          );
          this.redirect_uris.push(_redirect_uri);
        }
      }

      const _context = new Context();
      reader.offset = _context.fromBuffer(reader.buffer, reader.offset);
      this.context = _context;
    }

    return reader.offset;
  }

  toJson() {
    return {
      vdxfkey: this.vdxfkey,
      challenge_id: this.challenge_id,
      requested_access: this.requested_access,
      requested_access_audience: this.requested_access_audience,
      subject: this.subject,
      provisioning_info: this.provisioning_info,
      alt_auth_factors: this.alt_auth_factors,
      session_id: this.session_id,
      attestations: this.attestations,
      redirect_uris: this.redirect_uris
        ? this.redirect_uris.map((x) => x.toJson())
        : this.redirect_uris,
      created_at: this.created_at,
      salt: this.salt,
      context: this.context,
      skip: this.skip,
    };
  }
}

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
export interface ChallengeV2Interface {
  version?: BigNumber;
  challenge_id: string;
  flags?: BigNumber;
  requested_access?: Array<string> | null;
  requested_access_audience?: Array<string>;
  encryption_details?: EncryptionDetails;
  callback_uri?: CallbackUri;
  created_at: number;
}

export class ChallengeV2 implements SerializableEntity {
  version: BigNumber = ChallengeV2.VERSION_CURRENT;
  challenge_id: string;
  flags?: BigNumber;  
  requested_access_audience?: Array<string>;
  encryption_details?: EncryptionDetails;
  callback_uri?: CallbackUri;
  created_at: number;

  // Version
  static VERSION_CURRENT = new BN(1, 10)
  static VERSION_FIRSTVALID = new BN(1, 10)
  static VERSION_LASTVALID = new BN(1, 10)

  static FLAG_HAS_AUDIENCE = new BN(1, 10);
  static FLAG_HAS_ENCRYPTION_DETAILS = new BN(2, 10);
  static FLAG_HAS_CALLBACK_URI = new BN(4, 10);
  static FLAG_CALLBACK_CLEAR_ENCRYPTION_DATA = new BN(8, 10);

  constructor(
    challenge: ChallengeV2Interface = { challenge_id: "", created_at: 0 }
  ) {

    this.challenge_id = challenge.challenge_id;
    this.created_at = challenge.created_at;
    this.flags = challenge?.flags || new BN(0, 10);
    this.requested_access_audience = challenge?.requested_access_audience || null;
    this.encryption_details = challenge?.encryption_details || null;
    this.callback_uri = challenge?.callback_uri || null;
    this.version = ChallengeV2.VERSION_CURRENT;

  }

  getByteLength(): number {
    let length = 0;

    length += fromBase58Check(this.challenge_id).hash.length;
    length += 8; // created_at uint64
    length += varint.encodingLength(this.flags);

    if (this.flags.and(ChallengeV2.FLAG_HAS_AUDIENCE).eq(ChallengeV2.FLAG_HAS_AUDIENCE)) {
      length += varuint.encodingLength(this.requested_access_audience.length);
      for (let i = 0; i < this.requested_access_audience.length; i++) {
        length += varuint.encodingLength(Buffer.from(this.requested_access_audience[i], 'utf8').length);
        length += Buffer.from(this.requested_access_audience[i], 'utf8').length;
      }
    }

    if (this.flags.and(ChallengeV2.FLAG_HAS_ENCRYPTION_DETAILS).eq(ChallengeV2.FLAG_HAS_ENCRYPTION_DETAILS)) {
      length += varint.encodingLength(new BN(this.encryption_details.type));
      length += varuint.encodingLength(Buffer.from(this.encryption_details.key, 'utf8').length);
      length += Buffer.from(this.encryption_details.key, 'utf8').length;
      length += varint.encodingLength(new BN(this.encryption_details.derivation_number || 0));      
    }

    if (this.flags.and(ChallengeV2.FLAG_HAS_CALLBACK_URI).eq(ChallengeV2.FLAG_HAS_CALLBACK_URI)) {
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
    writer.writeUInt64(this.created_at);
    writer.writeVarInt(this.flags);
    
    if (this.flags.and(ChallengeV2.FLAG_HAS_AUDIENCE).eq(ChallengeV2.FLAG_HAS_AUDIENCE)) {
      writer.writeCompactSize(this.requested_access_audience ? this.requested_access_audience.length : 0);
      for (let i = 0; i < this.requested_access_audience.length; i++) {
        writer.writeVarSlice(Buffer.from(this.requested_access_audience[i], 'utf8'));
      }
    }

    if (this.flags.and(ChallengeV2.FLAG_HAS_ENCRYPTION_DETAILS).eq(ChallengeV2.FLAG_HAS_ENCRYPTION_DETAILS)) {
      writer.writeVarInt(new BN(this.encryption_details.type));
      writer.writeVarSlice(Buffer.from(this.encryption_details.key, 'utf8'));
      writer.writeVarInt(new BN(this.encryption_details.derivation_number || 0));
    }

    if (this.flags.and(ChallengeV2.FLAG_HAS_CALLBACK_URI).eq(ChallengeV2.FLAG_HAS_CALLBACK_URI)) {
      writer.writeVarInt(new BN(this.callback_uri.type));
      writer.writeVarSlice(Buffer.from(this.callback_uri.uri, 'utf8'));
    }



    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new bufferutils.BufferReader(buffer, offset);
    if (buffer.length == 0) throw new Error("Cannot create challenge from empty buffer");

    this.challenge_id = toBase58Check(reader.readSlice(20), I_ADDR_VERSION); 
    this.created_at = reader.readUInt64();
    this.flags = reader.readVarInt();

    if (this.flags.and(ChallengeV2.FLAG_HAS_AUDIENCE).eq(ChallengeV2.FLAG_HAS_AUDIENCE)) {
      this.requested_access_audience = [];
      const audienceLength = reader.readCompactSize();
      for (let i = 0; i < audienceLength; i++) {
        this.requested_access_audience.push(reader.readVarSlice().toString('utf8'));
      }
    }

    if (this.flags.and(ChallengeV2.FLAG_HAS_ENCRYPTION_DETAILS).eq(ChallengeV2.FLAG_HAS_ENCRYPTION_DETAILS)) {
      this.encryption_details = {
        type: reader.readVarInt().toNumber(),
        key: reader.readVarSlice().toString('utf8'),
        derivation_number: reader.readVarInt().toNumber()
      }
    }

    if (this.flags.and(ChallengeV2.FLAG_HAS_CALLBACK_URI).eq(ChallengeV2.FLAG_HAS_CALLBACK_URI)) {
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
      callback_uri: this.callback_uri,
      created_at: this.created_at
    };
  }

  static fromJson(data: any): ChallengeV2 {
    return new ChallengeV2({
      version: new BN(data?.version || 0),
      challenge_id: data.challenge_id,
      flags: new BN(data?.flags || 0),
      requested_access_audience: data.requested_access_audience,
      encryption_details: data.encryption_details,
      callback_uri: data.callback_uri,
      created_at: data.created_at
    })
  }


  setFlags() {
    this.flags = new BN(0, 10);
    if (this.requested_access_audience && this.requested_access_audience.length > 0) {
      this.flags = this.flags.or(ChallengeV2.FLAG_HAS_AUDIENCE);
    }
    if (this.encryption_details) {
      this.flags = this.flags.or(ChallengeV2.FLAG_HAS_ENCRYPTION_DETAILS);
    }
    if (this.callback_uri) {
      this.flags = this.flags.or(ChallengeV2.FLAG_HAS_CALLBACK_URI);
    }
  }   

  isValid(): boolean {
    let valid = this.challenge_id != null && this.challenge_id.length > 0;
    valid &&= this.created_at != null && this.created_at > 0;
    valid &&= this.flags != null && this.flags.gte(new BN(0));
    return valid;
  }

   toSha256() {
      return createHash("sha256").update(this.toBuffer()).digest();
    }
}