/**
 * DataPacketResponse - Class for providing structured responses to various request types
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
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
import { DataDescriptor, DataDescriptorJson } from '../../../pbaas';
export interface DataResponseInterface {
    flags?: BigNumber;
    requestID?: string;
    data: DataDescriptor;
}
export interface DataResponseJson {
    flags?: number;
    requestid?: string;
    data: DataDescriptorJson;
}
export declare class DataPacketResponse implements SerializableEntity {
    flags?: BigNumber;
    requestID?: string;
    data: DataDescriptor;
    static RESPONSE_CONTAINS_REQUEST_ID: import("bn.js");
    constructor(data?: {
        flags?: BigNumber;
        requestID?: string;
        data: DataDescriptor;
    });
    containsRequestID(): boolean;
    toggleContainsRequestID(): void;
    toSha256(): Buffer<ArrayBufferLike>;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): DataResponseJson;
    static fromJson(json: DataResponseJson): DataPacketResponse;
}
