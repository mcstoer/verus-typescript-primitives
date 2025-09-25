import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import varint from '../../../utils/varint';
import varuint from '../../../utils/varuint';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;
import { MMRDescriptor, MMRDescriptorJson } from '../../../pbaas/MMRDescriptor';
import { SignatureData, SignatureJsonDataInterface } from '../../../pbaas/SignatureData';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';

export interface AttestationPairJson {
  mmrdescriptor: MMRDescriptorJson;
  signaturedata: SignatureJsonDataInterface;
}

export interface AttestationDetailsJson {
  version: number;
  flags?: number;
  label?: string;
  id?: string;
  timestamp?: number;
  attestations: AttestationPairJson[];
}

export class AttestationPair implements SerializableEntity {
  mmrDescriptor: MMRDescriptor;
  signatureData: SignatureData;

  constructor(data?: {
    mmrDescriptor?: MMRDescriptor;
    signatureData?: SignatureData;
  }) {
    if (data) {
      this.mmrDescriptor = data.mmrDescriptor || new MMRDescriptor();
      this.signatureData = data.signatureData || new SignatureData();
    } else {
      this.mmrDescriptor = new MMRDescriptor();
      this.signatureData = new SignatureData();
    }
  }

  static fromJson(data: AttestationPairJson): AttestationPair {
    return new AttestationPair({
      mmrDescriptor: MMRDescriptor.fromJson(data.mmrdescriptor),
      signatureData: SignatureData.fromJson(data.signaturedata)
    });
  }

  getByteLength(): number {
    return this.mmrDescriptor.getByteLength() + this.signatureData.getByteLength();
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
    writer.writeSlice(this.mmrDescriptor.toBuffer());
    writer.writeSlice(this.signatureData.toBuffer());
    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);
    
    this.mmrDescriptor = new MMRDescriptor();
    reader.offset = this.mmrDescriptor.fromBuffer(reader.buffer, reader.offset);
    
    this.signatureData = new SignatureData();
    reader.offset = this.signatureData.fromBuffer(reader.buffer, reader.offset);
    
    return reader.offset;
  }

  toJson(): AttestationPairJson {
    return {
      mmrdescriptor: this.mmrDescriptor.toJson(),
      signaturedata: this.signatureData.toJson()
    };
  }
}

export class AttestationDetails implements SerializableEntity {
  static VERSION_INVALID = new BN(0);
  static FIRST_VERSION = new BN(1);
  static LAST_VERSION = new BN(1);
  static DEFAULT_VERSION = new BN(1);

  // Flags
  static FLAG_LABEL = 1;
  static FLAG_ID = 2;
  static FLAG_TIMESTAMP = 4;

  version: BigNumber;
  flags: BigNumber;
  label?: string;
  id?: string;
  timestamp?: BigNumber;
  attestations: AttestationPair[];

  constructor(data?: {
    version?: BigNumber;
    flags?: BigNumber;
    label?: string;
    id?: string;
    timestamp?: BigNumber;
    attestations?: AttestationPair[];
  }) {
    if (data) {
      this.version = data.version || AttestationDetails.DEFAULT_VERSION;
      this.flags = data.flags || new BN(0);
      this.label = data.label;
      this.id = data.id;
      this.timestamp = data.timestamp;
      this.attestations = data.attestations || [];
    } else {
      this.version = AttestationDetails.DEFAULT_VERSION;
      this.flags = new BN(0);
      this.attestations = [];
    }
  }

  static fromJson(data: AttestationDetailsJson): AttestationDetails {
    const newAttestationDetails = new AttestationDetails();

    if (data) {
      if (data.version) newAttestationDetails.version = new BN(data.version);
      if (data.flags !== undefined) newAttestationDetails.flags = new BN(data.flags);
      if (data.label) newAttestationDetails.label = data.label;
      if (data.id) newAttestationDetails.id = data.id;
      if (data.timestamp) newAttestationDetails.timestamp = new BN(data.timestamp);
      
      if (data.attestations) {
        newAttestationDetails.attestations = data.attestations.map(
          attestation => AttestationPair.fromJson(attestation)
        );
      }
    }

    return newAttestationDetails;
  }

  /**
   * Create AttestationDetails from a single Verus node response
   * @param nodeResponse - The JSON object from Verus node: {"signaturedata": ..., "mmrdescriptor": ...}
   * @param options - Optional metadata (label, id, timestamp)
   */
  static fromNodeResponse(
    nodeResponse: { signaturedata: any; mmrdescriptor: any },
    options?: {
      label?: string;
      id?: string;
      timestamp?: number;
    }
  ): AttestationDetails {
    const attestationPair = new AttestationPair({
      mmrDescriptor: MMRDescriptor.fromJson(nodeResponse.mmrdescriptor),
      signatureData: SignatureData.fromJson(nodeResponse.signaturedata)
    });

    const attestationDetails = new AttestationDetails({
      attestations: [attestationPair]
    });

    // Set optional metadata
    if (options?.label) {
      attestationDetails.setLabel(options.label);
    }
    if (options?.id) {
      attestationDetails.setId(options.id);
    }
    if (options?.timestamp) {
      attestationDetails.setTimestamp(new BN(options.timestamp));
    }

    // Update flags based on set metadata
    attestationDetails.setFlags();

    return attestationDetails;
  }

  /**
   * Create AttestationDetails from multiple Verus node responses
   * @param nodeResponses - Array of JSON objects from Verus node
   * @param options - Optional metadata (label, id, timestamp)
   */
  static fromNodeResponses(
    nodeResponses: Array<{ signaturedata: any; mmrdescriptor: any }>,
    options?: {
      label?: string;
      id?: string;
      timestamp?: number;
    }
  ): AttestationDetails {
    const attestationPairs = nodeResponses.map(response => 
      new AttestationPair({
        mmrDescriptor: MMRDescriptor.fromJson(response.mmrdescriptor),
        signatureData: SignatureData.fromJson(response.signaturedata)
      })
    );

    const attestationDetails = new AttestationDetails({
      attestations: attestationPairs
    });

    // Set optional metadata
    if (options?.label) {
      attestationDetails.setLabel(options.label);
    }
    if (options?.id) {
      attestationDetails.setId(options.id);
    }
    if (options?.timestamp) {
      attestationDetails.setTimestamp(new BN(options.timestamp));
    }

    // Update flags based on set metadata
    attestationDetails.setFlags();

    return attestationDetails;
  }

  hasLabel(): boolean {
    return (this.flags.toNumber() & AttestationDetails.FLAG_LABEL) !== 0;
  }

  hasId(): boolean {
    return (this.flags.toNumber() & AttestationDetails.FLAG_ID) !== 0;
  }

  hasTimestamp(): boolean {
    return (this.flags.toNumber() & AttestationDetails.FLAG_TIMESTAMP) !== 0;
  }

  setLabel(label: string): void {
    this.label = label;
  }

  setId(id: string): void {
    this.id = id;
  }

  setTimestamp(timestamp: BigNumber): void {
    this.timestamp = timestamp;
  }

  /**
   * Calculate flags based on the presence of optional fields
   */
  calcFlags(): BigNumber {
    let flags = new BN(0);
    
    if (this.label && this.label.length > 0) {
      flags = flags.or(new BN(AttestationDetails.FLAG_LABEL));
    }
    
    if (this.id && this.id.length > 0) {
      flags = flags.or(new BN(AttestationDetails.FLAG_ID));
    }
    
    if (this.timestamp) {
      flags = flags.or(new BN(AttestationDetails.FLAG_TIMESTAMP));
    }
    
    return flags;
  }

  /**
   * Set the flags based on calculated values from present fields
   */
  setFlags(): void {
    this.flags = this.calcFlags();
  }

  /**
   * Add a new attestation from a Verus node response
   * @param nodeResponse - The JSON object from Verus node: {"signaturedata": ..., "mmrdescriptor": ...}
   */
  addAttestation(nodeResponse: { signaturedata: any; mmrdescriptor: any }): void {
    const attestationPair = new AttestationPair({
      mmrDescriptor: MMRDescriptor.fromJson(nodeResponse.mmrdescriptor),
      signatureData: SignatureData.fromJson(nodeResponse.signaturedata)
    });
    
    this.attestations.push(attestationPair);
  }

  /**
   * Add multiple attestations from Verus node responses
   * @param nodeResponses - Array of JSON objects from Verus node
   */
  addAttestations(nodeResponses: Array<{ signaturedata: any; mmrdescriptor: any }>): void {
    const attestationPairs = nodeResponses.map(response => 
      new AttestationPair({
        mmrDescriptor: MMRDescriptor.fromJson(response.mmrdescriptor),
        signatureData: SignatureData.fromJson(response.signaturedata)
      })
    );
    
    this.attestations.push(...attestationPairs);
  }

  /**
   * Add an existing AttestationPair to this collection
   * @param attestationPair - The AttestationPair to add
   */
  addAttestationPair(attestationPair: AttestationPair): void {
    this.attestations.push(attestationPair);
  }

  /**
   * Get the number of attestations in this collection
   */
  getAttestationCount(): number {
    return this.attestations.length;
  }

  getByteLength(): number {
    this.setFlags();
    let length = 0;

    length += varint.encodingLength(this.version);
    length += varint.encodingLength(this.flags);

    if (this.hasLabel() && this.label) {
      const labelBuffer = Buffer.from(this.label, 'utf8');
      length += varuint.encodingLength(labelBuffer.length);
      length += labelBuffer.length;
    }

    if (this.hasId() && this.id) {
      const idBuffer = Buffer.from(this.id, 'utf8');
      length += varuint.encodingLength(idBuffer.length);
      length += idBuffer.length;
    }

    if (this.hasTimestamp() && this.timestamp) {
      length += varint.encodingLength(this.timestamp);
    }

    length += varuint.encodingLength(this.attestations.length);
    this.attestations.forEach((attestation) => {
      length += attestation.getByteLength();
    });

    return length;
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeVarInt(this.version);
    writer.writeVarInt(this.flags);

    if (this.hasLabel() && this.label) {
      const labelBuffer = Buffer.from(this.label, 'utf8');
      writer.writeVarSlice(labelBuffer);
    }

    if (this.hasId() && this.id) {
      const idBuffer = Buffer.from(this.id, 'utf8');
      writer.writeVarSlice(idBuffer);
    }

    if (this.hasTimestamp() && this.timestamp) {
      writer.writeVarInt(this.timestamp);
    }

    writer.writeCompactSize(this.attestations.length);
    this.attestations.forEach((attestation) => {
      writer.writeSlice(attestation.toBuffer());
    });

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset?: number): number {
    const reader = new BufferReader(buffer, offset);

    this.version = reader.readVarInt();
    this.flags = reader.readVarInt();

    if (this.hasLabel()) {
      this.label = reader.readVarSlice().toString('utf8');
    }

    if (this.hasId()) {
      this.id = reader.readVarSlice().toString('utf8');
    }

    if (this.hasTimestamp()) {
      this.timestamp = reader.readVarInt();
    }

    const attestationsLength = reader.readCompactSize();
    this.attestations = [];
    
    for (let i = 0; i < attestationsLength; i++) {
      const attestation = new AttestationPair();
      reader.offset = attestation.fromBuffer(reader.buffer, reader.offset);
      this.attestations.push(attestation);
    }

    return reader.offset;
  }

  isValid(): boolean {
    return this.version.gte(AttestationDetails.FIRST_VERSION) && 
           this.version.lte(AttestationDetails.LAST_VERSION) &&
           this.attestations.length > 0;
  }

  toJson(): AttestationDetailsJson {
    this.setFlags(); // Ensure flags are set before converting to JSON
    const retval: AttestationDetailsJson = {
      version: this.version.toNumber(),
      attestations: this.attestations.map((attestation) => attestation.toJson())
    };

    if (this.flags.gt(new BN(0))) {
      retval.flags = this.flags.toNumber();
    }

    if (this.hasLabel() && this.label) {
      retval.label = this.label;
    }

    if (this.hasId() && this.id) {
      retval.id = this.id;
    }

    if (this.hasTimestamp() && this.timestamp) {
      retval.timestamp = this.timestamp.toNumber();
    }

    return retval;
  }
}
