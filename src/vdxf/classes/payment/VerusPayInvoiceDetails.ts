import varint from '../../../utils/varint'
import varuint from '../../../utils/varuint'
import bufferutils from '../../../utils/bufferutils'
import { BN } from 'bn.js';
import { BigNumber } from '../../../utils/types/BigNumber';
import { TransferDestination, TransferDestinationJson } from '../../../pbaas/TransferDestination';
import { fromBase58Check, toBase58Check } from '../../../utils/address';
import { I_ADDR_VERSION } from '../../../constants/vdxf';
import createHash = require('create-hash');
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
const { BufferReader, BufferWriter } = bufferutils;

export const VERUSPAY_INVALID = new BN(0, 10)
export const VERUSPAY_VALID = new BN(1, 10)
export const VERUSPAY_ACCEPTS_CONVERSION = new BN(2, 10)
export const VERUSPAY_ACCEPTS_NON_VERUS_SYSTEMS = new BN(4, 10)
export const VERUSPAY_EXPIRES = new BN(8, 10)
export const VERUSPAY_ACCEPTS_ANY_DESTINATION = new BN(16, 0)
export const VERUSPAY_ACCEPTS_ANY_AMOUNT = new BN(32, 0)
export const VERUSPAY_EXCLUDES_VERUS_BLOCKCHAIN = new BN(64, 0)
export const VERUSPAY_IS_TESTNET = new BN(128, 0)

export type VerusPayInvoiceDetailsJson = {
  flags?: string,
  amount?: string,
  destination?: TransferDestinationJson,
  requestedcurrencyid: string,
  expiryheight?: string,
  maxestimatedslippage?: string,
  acceptedsystems?: Array<string>,
}

export class VerusPayInvoiceDetails implements SerializableEntity {
  flags: BigNumber;
  amount: BigNumber;
  destination: TransferDestination;
  requestedcurrencyid: string;
  expiryheight: BigNumber;
  maxestimatedslippage: BigNumber;
  acceptedsystems: Array<string>;
  
  constructor (data?: {
    flags?: BigNumber,
    amount?: BigNumber,
    destination?: TransferDestination,
    requestedcurrencyid: string,
    expiryheight?: BigNumber,
    maxestimatedslippage?: BigNumber,
    acceptedsystems?: Array<string>,
  }) {
    this.flags = VERUSPAY_VALID;
    this.amount = null;
    this.destination = null;
    this.requestedcurrencyid = null;
    this.expiryheight = null;
    this.maxestimatedslippage = null;
    this.acceptedsystems = null;

    if (data != null) {
      if (data.flags != null) this.flags = data.flags
      if (data.amount != null) this.amount = data.amount
      if (data.destination != null) this.destination = data.destination
      if (data.requestedcurrencyid != null) this.requestedcurrencyid = data.requestedcurrencyid
      if (data.expiryheight != null) this.expiryheight = data.expiryheight
      if (data.maxestimatedslippage != null) this.maxestimatedslippage = data.maxestimatedslippage
      if (data.acceptedsystems != null) this.acceptedsystems = data.acceptedsystems
    }
  }

  setFlags(flags: {
    acceptsConversion?: boolean,
    acceptsNonVerusSystems?: boolean,
    expires?: boolean,
    acceptsAnyAmount?: boolean,
    acceptsAnyDestination?: boolean,
    excludesVerusBlockchain?: boolean,
    isTestnet?: boolean
  }) {
    if (flags.acceptsConversion) this.flags = this.flags.xor(VERUSPAY_ACCEPTS_CONVERSION);
    if (flags.acceptsNonVerusSystems) this.flags = this.flags.xor(VERUSPAY_ACCEPTS_NON_VERUS_SYSTEMS);
    if (flags.expires) this.flags = this.flags.xor(VERUSPAY_EXPIRES);
    if (flags.acceptsAnyAmount) this.flags = this.flags.xor(VERUSPAY_ACCEPTS_ANY_AMOUNT);
    if (flags.acceptsAnyDestination) this.flags = this.flags.xor(VERUSPAY_ACCEPTS_ANY_DESTINATION);
    if (flags.excludesVerusBlockchain) this.flags = this.flags.xor(VERUSPAY_EXCLUDES_VERUS_BLOCKCHAIN);
    if (flags.isTestnet) this.flags = this.flags.xor(VERUSPAY_IS_TESTNET);
  }

  getFlagsJson(): { [key: string]: boolean } {
    return {
      acceptsConversion: this.acceptsConversion(),
      acceptsNonVerusSystems: this.acceptsNonVerusSystems(),
      expires: this.expires(),
      acceptsAnyAmount: this.acceptsAnyAmount(),
      acceptsAnyDestination: this.acceptsAnyDestination(),
      excludesVerusBlockchain: this.excludesVerusBlockchain(),
      isTestnet: this.isTestnet()
    }
  }

  toSha256() {
    return createHash("sha256").update(this.toBuffer()).digest();
  }

  acceptsConversion() {
    return !!(this.flags.and(VERUSPAY_ACCEPTS_CONVERSION).toNumber())
  }

  acceptsNonVerusSystems() {
    return !!(this.flags.and(VERUSPAY_ACCEPTS_NON_VERUS_SYSTEMS).toNumber())
  }

  acceptsAnyAmount() {
    return !!(this.flags.and(VERUSPAY_ACCEPTS_ANY_AMOUNT).toNumber())
  }

  acceptsAnyDestination() {
    return !!(this.flags.and(VERUSPAY_ACCEPTS_ANY_DESTINATION).toNumber())
  }

  expires() {
    return !!(this.flags.and(VERUSPAY_EXPIRES).toNumber())
  }

  excludesVerusBlockchain() {
    return !!(this.flags.and(VERUSPAY_EXCLUDES_VERUS_BLOCKCHAIN).toNumber())
  }

  isTestnet() {
    return !!(this.flags.and(VERUSPAY_IS_TESTNET).toNumber())
  }

  isValid () {
    return (
      !!(this.flags.and(VERUSPAY_VALID).toNumber())
    )
  }

  getByteLength(): number {
    let length = 0;

    length += varint.encodingLength(this.flags);

    if (!this.acceptsAnyAmount()) {
      length += varint.encodingLength(this.amount);
    }
    
    if (!this.acceptsAnyDestination()) {
      length += this.destination.getByteLength();
    }
    
    length += fromBase58Check(this.requestedcurrencyid).hash.length;

    if (this.expires()) {
      length += varint.encodingLength(this.expiryheight);
    }
    
    if (this.acceptsConversion()) {
      length += varint.encodingLength(this.maxestimatedslippage);
    }

    if (this.acceptsNonVerusSystems()) {
      length += varuint.encodingLength(this.acceptedsystems.length);

      this.acceptedsystems.forEach(() => {
        length += 20
      })
    }

    return length;
  }

  toBuffer () {
    const writer = new BufferWriter(Buffer.alloc(this.getByteLength()));
    
    writer.writeVarInt(this.flags);

    if (!this.acceptsAnyAmount()) writer.writeVarInt(this.amount);
    if (!this.acceptsAnyDestination()) writer.writeSlice(this.destination.toBuffer());

    writer.writeSlice(fromBase58Check(this.requestedcurrencyid).hash);

    if (this.expires()) {
      writer.writeVarInt(this.expiryheight);
    }

    if (this.acceptsConversion()) {
      writer.writeVarInt(this.maxestimatedslippage);
    }

    if (this.acceptsNonVerusSystems()) {
      writer.writeArray(this.acceptedsystems.map(x => fromBase58Check(x).hash));
    }

    return writer.buffer;
  }

  fromBuffer (buffer: Buffer, offset: number = 0) {
    const reader = new BufferReader(buffer, offset);

    this.flags = reader.readVarInt();
    
    if (!this.acceptsAnyAmount()) this.amount = reader.readVarInt();

    if (!this.acceptsAnyDestination()) {
      this.destination = new TransferDestination();
      reader.offset = this.destination.fromBuffer(buffer, reader.offset);
    }
    
    this.requestedcurrencyid = toBase58Check(reader.readSlice(20), I_ADDR_VERSION);

    if (this.expires()) {
      this.expiryheight = reader.readVarInt();
    }

    if (this.acceptsConversion()) {
      this.maxestimatedslippage = reader.readVarInt();
    }

    if (this.acceptsNonVerusSystems()) {
      const acceptedSystemsBuffers = reader.readArray(20);

      this.acceptedsystems = acceptedSystemsBuffers.map(x => toBase58Check(x, I_ADDR_VERSION));
    }

    return reader.offset;
  }

  static fromJson(data: VerusPayInvoiceDetailsJson): VerusPayInvoiceDetails {
    return new VerusPayInvoiceDetails({
      flags: new BN(data.flags),
      amount: data.amount != null ? new BN(data.amount) : undefined,
      destination: data.destination != null ? TransferDestination.fromJson(data.destination) : undefined,
      requestedcurrencyid: data.requestedcurrencyid,
      expiryheight: data.expiryheight != null ? new BN(data.expiryheight) : undefined,
      maxestimatedslippage: data.maxestimatedslippage != null ? new BN(data.maxestimatedslippage) : undefined,
      acceptedsystems: data.acceptedsystems
    })
  }

  toJson(): VerusPayInvoiceDetailsJson {
    return {
      flags: this.flags.toString(),
      amount: this.acceptsAnyAmount() ? undefined : this.amount.toString(),
      destination: this.acceptsAnyDestination() ? undefined : this.destination.toJson(),
      requestedcurrencyid: this.requestedcurrencyid,
      expiryheight: this.expires() ? this.expiryheight.toString() : undefined,
      maxestimatedslippage: this.acceptsConversion() ? this.maxestimatedslippage.toString() : undefined,
      acceptedsystems: this.acceptsNonVerusSystems() ? this.acceptedsystems : undefined,
    }
  }
}