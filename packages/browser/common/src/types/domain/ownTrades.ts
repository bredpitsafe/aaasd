import { ISO } from '../time';
import { TRealAccount, TVirtualAccount } from './account';
import { TAsset } from './asset';
import { TExchange } from './exchange';
import { TGate } from './gates';
import { TInstrument, TInstrumentId } from './instrument';
import { TRobot } from './robots';
import { TTrade } from './trade';

export type TStrategyName = string;
export type TWithStrategyName = {
    strategy: TStrategyName;
};

export type TOwnTrade = {
    platformTime: TTrade['platformTime'];
    exchangeTime: TTrade['exchangeTime'];
    exchangeName: TTrade['exchange'];
    isLateTrade: boolean;
    robotId: TRobot['id'];
    robotName: TRobot['name'];
    virtualAccountId: TVirtualAccount['id'];
    virtualAccountName: TTrade['virtualAccount'];
    accountId: TRealAccount['id'];
    accountName: TTrade['account'];
    instrumentId: TInstrument['id'];
    instrumentName: TTrade['instrument'];
    gateId: TGate['id'];
    gateName: TTrade['gate'];
    tradeId: TTrade['id'];
    exchangeTradeId: TTrade['exchangeTradeId'];
    orderId: TTrade['orderId'];
    exchangeOrderId: TTrade['exchangeOrderId'];
    orderTag: TTrade['orderTag'];
    side: TTrade['side'];
    role: TTrade['role'];
    strategy: TStrategyName;
    price: TTrade['price'];
    baseAmount: TTrade['baseAmount'];
    baseAssetId: TAsset['id'];
    baseAssetName: TTrade['baseAsset'];
    quoteAmount: TTrade['quoteAmount'];
    quoteAssetId: TAsset['id'];
    quoteAssetName: TTrade['quoteAsset'];
    feeAmount: TTrade['feeAmount'];
    feeAssetId: TAsset['id'];
    feeAssetName: TTrade['feeAsset'];
    isFeeEvaluated: TTrade['isFeeEvaluated'];
};

export type TOwnTradeFilter = {
    platformTime?: {
        since?: ISO;
        till?: ISO;
    };
};

export type TTradeFilterParams = {
    baseAssets?: TAsset['id'][];
    quoteAssets?: TAsset['id'][];
    anyAssets?: TAsset['id'][];
    instruments?: TInstrumentId[];
    exchanges?: TExchange['name'][];
    strategies?: TStrategyName[];
};
