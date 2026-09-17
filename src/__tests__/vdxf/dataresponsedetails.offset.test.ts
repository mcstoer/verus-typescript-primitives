import { DEFAULT_VERUS_CHAINID } from '../../constants/pbaas';
import { DATA_RESPONSE_VDXF_ORDINAL } from '../../constants/ordinals/ordinals';
import { CompactIAddressObject } from '../../vdxf/classes/CompactAddressObject';
import { DataResponseDetails } from '../../vdxf/classes/data/DataResponseDetails';
import { DataResponseOrdinalVDXFObject, OrdinalVDXFObject } from '../../vdxf/classes/ordinals';
import { GenericResponse } from '../../vdxf/classes/response/GenericResponse';

// Encode these descriptors directly: DataDescriptor.toBuffer() omits empty
// label/MIME fields, even though their explicit presence is valid on the wire.
// Each contains version 1, presence flags, four object bytes, and empty strings.
const descriptors = [
  { name: 'empty label', hex: '012004deadbeef00', flags: 0x20, label: '', mimeType: undefined },
  { name: 'empty MIME', hex: '014004deadbeef00', flags: 0x40, label: undefined, mimeType: '' },
  { name: 'empty label and MIME', hex: '016004deadbeef0000', flags: 0x60, label: '', mimeType: '' },
];

function responseBody(descriptor: Buffer, requestID?: CompactIAddressObject): Buffer {
  return Buffer.concat([
    Buffer.from([requestID ? DataResponseDetails.FLAG_HAS_REQUEST_ID.toNumber() : 0]),
    requestID ? requestID.toBuffer() : Buffer.alloc(0),
    descriptor,
  ]);
}

function ordinal(body: Buffer): Buffer {
  // All fixtures fit in one-byte CompactSize type/length fields.
  return Buffer.concat([Buffer.from([DATA_RESPONSE_VDXF_ORDINAL.toNumber(), 1, body.length]), body]);
}

describe.each(descriptors)('DataResponseDetails with $name', ({ hex, flags, label, mimeType }) => {
  const descriptor = Buffer.from(hex, 'hex');

  test.each([
    { name: 'at zero without a request ID', prefix: Buffer.alloc(0), requestID: undefined },
    {
      name: 'after a prefix with a request ID',
      prefix: Buffer.from('aabbcc', 'hex'),
      requestID: CompactIAddressObject.fromAddress(DEFAULT_VERUS_CHAINID),
    },
  ])('returns the consumed absolute offset $name', ({ prefix, requestID }) => {
    const body = responseBody(descriptor, requestID);
    const suffix = Buffer.from('feedface', 'hex');
    const buffer = Buffer.concat([prefix, body, suffix]);
    const decoded = new DataResponseDetails();

    const offset = decoded.fromBuffer(buffer, prefix.length);

    expect(offset).toBe(prefix.length + body.length);
    expect(buffer.subarray(offset)).toEqual(suffix);
    expect(decoded.containsRequestID()).toBe(requestID !== undefined);
    expect(decoded.requestID?.toAddress()).toBe(requestID?.toAddress());
    expect(decoded.data.isValid()).toBe(true);
    expect(decoded.data.flags.toNumber()).toBe(flags);
    expect(decoded.data.objectdata).toEqual(Buffer.from('deadbeef', 'hex'));
    expect(decoded.data.label).toBe(label);
    expect(decoded.data.mimeType).toBe(mimeType);
  });

  test('accepts the complete declared ordinal payload through the factory', () => {
    const wire = ordinal(responseBody(descriptor));

    const { obj, offset } = OrdinalVDXFObject.createFromBuffer(wire);

    expect(offset).toBe(wire.length);
    expect(obj).toBeInstanceOf(DataResponseOrdinalVDXFObject);
    const decoded = (obj as DataResponseOrdinalVDXFObject).data;
    expect(decoded.data.flags.toNumber()).toBe(flags);
    expect(decoded.data.objectdata).toEqual(Buffer.from('deadbeef', 'hex'));
    expect(decoded.data.label).toBe(label);
    expect(decoded.data.mimeType).toBe(mimeType);
  });

  test('still rejects extra bytes inside the declared ordinal payload', () => {
    const body = Buffer.concat([responseBody(descriptor), Buffer.from('ff', 'hex')]);

    expect(() => new DataResponseOrdinalVDXFObject().fromDataBuffer(body))
      .toThrow('Ordinal payload length mismatch');
    expect(() => OrdinalVDXFObject.createFromBuffer(ordinal(body)))
      .toThrow('Ordinal payload length mismatch');
  });

  test('rejects a missing empty-string length byte', () => {
    const body = responseBody(descriptor).subarray(0, -1);

    expect(() => new DataResponseOrdinalVDXFObject().fromDataBuffer(body)).toThrow();
    expect(() => OrdinalVDXFObject.createFromBuffer(ordinal(body))).toThrow();
  });
});

test('GenericResponse accepts explicitly empty metadata and reads the following detail', () => {
  const prefix = Buffer.from('aabbcc', 'hex');
  const suffix = Buffer.from('feedface', 'hex');
  const dataResponse = ordinal(responseBody(Buffer.from('016004deadbeef0000', 'hex')));
  // Authentication-request ordinal 2, version 1, body length 1, flags 0.
  const following = Buffer.from('02010100', 'hex');
  const wire = Buffer.concat([
    Buffer.from([1, GenericResponse.FLAG_MULTI_DETAILS.toNumber(), 2]),
    dataResponse,
    following,
  ]);
  const buffer = Buffer.concat([prefix, wire, suffix]);
  const decoded = new GenericResponse();

  const offset = decoded.fromBuffer(buffer, prefix.length);

  expect(offset).toBe(prefix.length + wire.length);
  expect(buffer.subarray(offset)).toEqual(suffix);
  expect(decoded.details).toHaveLength(2);
  expect(decoded.details[0]).toBeInstanceOf(DataResponseOrdinalVDXFObject);
  const data = (decoded.details[0] as DataResponseOrdinalVDXFObject).data.data;
  expect(data.flags.toNumber()).toBe(0x60);
  expect(data.label).toBe('');
  expect(data.mimeType).toBe('');
  expect(data.objectdata).toEqual(Buffer.from('deadbeef', 'hex'));
  expect(decoded.details[1].toBuffer()).toEqual(following);
});
