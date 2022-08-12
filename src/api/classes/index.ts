import { GetAddressBalanceRequest } from './GetAddressBalance/GetAddressBalanceRequest'
import { GetAddressBalanceResponse } from './GetAddressBalance/GetAddressBalanceResponse'
import { GetAddressDeltasRequest } from './GetAddressDeltas/GetAddressDeltasRequest'
import { GetAddressDeltasResponse } from './GetAddressDeltas/GetAddressDeltasResponse'
import { GetAddressUtxosRequest } from './GetAddressUtxos/GetAddressUtxosRequest'
import { GetAddressUtxosResponse } from './GetAddressUtxos/GetAddressUtxosResponse'
import { GetBlockRequest } from './GetBlock/GetBlockRequest'
import { GetBlockResponse } from './GetBlock/GetBlockResponse'
import { GetIdentityRequest } from './GetIdentity/GetIdentityRequest'
import { GetIdentityResponse } from './GetIdentity/GetIdentityResponse'
import { GetInfoRequest } from './GetInfo/GetInfoRequest'
import { GetInfoResponse } from './GetInfo/GetInfoResponse'
import { GetOffersRequest } from './GetOffers/GetOffersRequest'
import { GetOffersResponse } from './GetOffers/GetOffersResponse'
import { GetRawTransactionRequest } from './GetRawTransaction/GetRawTransactionRequest'
import { GetRawTransactionResponse } from './GetRawTransaction/GetRawTransactionResponse'
import { MakeOfferRequest } from './MakeOffer/MakeOfferRequest'
import { MakeOfferResponse } from './MakeOffer/MakeOfferResponse'
import { SendRawTransactionRequest } from './SendRawTransaction/SendRawTransactionRequest'
import { SendRawTransactionResponse } from './SendRawTransaction/SendRawTransactionResponse'

export {
  GetAddressBalanceRequest,
  GetAddressBalanceResponse,
  GetAddressDeltasRequest,
  GetAddressDeltasResponse,
  GetAddressUtxosRequest,
  GetAddressUtxosResponse,
  GetBlockRequest,
  GetBlockResponse,
  GetIdentityRequest,
  GetIdentityResponse,
  GetOffersRequest,
  GetOffersResponse,
  GetRawTransactionRequest,
  GetRawTransactionResponse,
  MakeOfferRequest,
  MakeOfferResponse,
  SendRawTransactionRequest,
  SendRawTransactionResponse,
  GetInfoRequest,
  GetInfoResponse
}

export type RpcRequest =
  | typeof MakeOfferRequest
  | typeof GetOffersRequest
  | typeof GetAddressBalanceRequest
  | typeof GetAddressDeltasRequest
  | typeof GetAddressUtxosRequest
  | typeof GetBlockRequest
  | typeof GetInfoRequest
  | typeof GetIdentityRequest
  | typeof SendRawTransactionRequest
  | typeof GetRawTransactionRequest;

export type RpcResponse =
  | typeof MakeOfferResponse
  | typeof GetOffersResponse
  | typeof GetAddressBalanceResponse
  | typeof GetAddressDeltasResponse
  | typeof GetAddressUtxosResponse
  | typeof GetBlockResponse
  | typeof GetInfoResponse
  | typeof GetIdentityResponse
  | typeof SendRawTransactionResponse
  | typeof GetRawTransactionResponse;
