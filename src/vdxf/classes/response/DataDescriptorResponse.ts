


/**
 * DataDescriptorResponse - Class for providing structured responses to various request types
 * 
 * This class serves as a universal response mechanism that can be used to reply to multiple
 * types of requests. It packages response data within a DataDescriptor along with metadata
 * for request tracking and timestamping.
 * 
 * USAGE AS RESPONSE TO DIFFERENT REQUEST TYPES:
 * 
 * 1. AppEncryptionRequestDetails Response:
 *    - The DataDescriptor 'data' field contains the encrypted derived seed
 *    - The requestID references the original AppEncryptionRequestDetails.requestID
 *    - Enables secure delivery of application-specific encrypted keys
 * 
 * 2. UserDataRequestDetails Response:
 *    - The DataDescriptor 'data' field contains requested user data/attestations
 *    - The requestID references the original UserDataRequestDetails.requestID
 *    - Allows selective disclosure of personal information
 * 
 * 3. UserSpecificDataPacketDetails Response:
 *    - The DataDescriptor 'data' field contains the response data or signed content
 *    - The requestID references the original UserSpecificDataPacketDetails.requestID
 *    - Supports bidirectional data exchange with signatures and statements
 * 
 * REQUEST-RESPONSE CORRELATION:
 * Each of the above request types includes its own requestID field. This response object's
 * requestID field can be used to match responses back to their originating requests, enabling
 * proper request-response correlation in asynchronous communication flows.
 * 
 * GENERAL DATA REPLIES:
 * This response format can also be used for other general data replies where:
 * - Structured data needs to be transmitted via DataDescriptor
 * - Request tracking through requestID is desired
 * - Timestamp metadata (createdAt) is needed for the response
 * - Response validation and integrity checking via SHA-256 is required
 */

import { BigNumber } from '../../../utils/types/BigNumber';
import { BN } from 'bn.js';
import varint from '../../../utils/varint';
import bufferutils from '../../../utils/bufferutils';
const { BufferReader, BufferWriter } = bufferutils;
import { decodeSaplingAddress, toBech32 } from '../../../utils/sapling';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { fromBase58Check, toBase58Check } from '../../../utils/address';
import { HASH160_BYTE_LENGTH, I_ADDR_VERSION } from '../../../constants/vdxf';
import { DataDescriptor, DataDescriptorJson } from '../../../pbaas';
import createHash = require("create-hash");

export interface DataDescriptorResponseInterface {
  flags?: BigNumber;
  requestID?: string;              // ID of request, to be referenced in response
  createdAt: BigNumber;              // Unix timestamp of response creation
  data: DataDescriptor;   
}

export interface DataDescriptorResponseJson {
  flags?: number;
  requestid?: string;              // ID of request, to be referenced in response
  createdat: number;              // Unix timestamp of response creation
  data: DataDescriptorJson;   
}

export class DataDescriptorResponse implements SerializableEntity {
  flags?: BigNumber;
  requestID?: string;              // ID of request, to be referenced in response
  createdAt: BigNumber;              // Unix timestamp of response creation
  data: DataDescriptor;    

  static APP_ENCRYPTION_RESPONSE_VALID = new BN(1, 10);
  static APP_ENCRYPTION_RESPONSE_CONTAINS_REQUEST_ID = new BN(2, 10);

  constructor (data?: {
    flags?: BigNumber,
    requestID?: string,
    createdAt: BigNumber,
    data: DataDescriptor
  }) {
    this.flags = data && data.flags ? data.flags : new BN("0", 10);
    this.createdAt = data?.createdAt;

    if (data?.requestID) {
      if (!this.containsRequestID()) this.toggleContainsRequestID();
      this.requestID = data.requestID;
    }

    this.data = data?.data;

  }

  containsRequestID() {
    return !!(this.flags.and(DataDescriptorResponse.APP_ENCRYPTION_RESPONSE_CONTAINS_REQUEST_ID).toNumber());
  }

  toggleContainsRequestID() {
    this.flags = this.flags.xor(DataDescriptorResponse.APP_ENCRYPTION_RESPONSE_CONTAINS_REQUEST_ID);
  }

  toSha256() {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    if (this.containsRequestID()) {
      length += HASH160_BYTE_LENGTH;
    }

    length += varint.encodingLength(this.createdAt);
    length += this.data.getByteLength();

    return length;
  }

  toBuffer() {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));

    writer.writeVarInt(this.flags);

    if (this.containsRequestID()) {
      writer.writeSlice(fromBase58Check(this.requestID).hash);
    }

    writer.writeVarInt(this.createdAt);
    writer.writeSlice(this.data.toBuffer());

    return writer.buffer;
  }

  fromBuffer(buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();

    if (this.containsRequestID()) {
      this.requestID = toBase58Check(reader.readSlice(HASH160_BYTE_LENGTH), I_ADDR_VERSION);
    }

    this.createdAt = reader.readVarInt();

    this.data = new DataDescriptor();
    this.data.fromBuffer(reader.buffer, reader.offset);
    reader.offset += this.data.getByteLength();

    return reader.offset;
  }

  toJson(): DataDescriptorResponseJson {
    return {
      flags: this.flags.toNumber(),
      requestid: this.containsRequestID() ? this.requestID : undefined,
      createdat: this.createdAt.toNumber(),
      data: this.data.toJson()
    }
  }

  static fromJson(json: DataDescriptorResponseJson): DataDescriptorResponse {
    return new DataDescriptorResponse({
      flags: new BN(json.flags, 10),
      requestID: json.requestid,
      createdAt: new BN(json.createdat, 10),
      data: DataDescriptor.fromJson(json.data)
    });
  }
}
