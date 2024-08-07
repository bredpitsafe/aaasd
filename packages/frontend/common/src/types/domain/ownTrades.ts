import type { ISO } from '@common/types';

import type { TRealAccount, TVirtualAccount } from './account';
import type { TAsset } from './asset';
import type { TExchange } from './exchange';
import type { TGate } from './gates';
import type { TInstrument, TInstrumentId } from './instrument';
import type { TRobot } from './robots';
import type { TTrade } from './trade';

export type TStrategyName = string;
export type TStrategyOption = {
    label: string;
    value: TStrategyName;
};
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
    volumeAmount: TTrade['volumeAmount'];
    quoteAssetId: TAsset['id'];
    volumeAssetId: TAsset['id'];
    quoteAssetName: TTrade['quoteAsset'];
    volumeAssetName: TTrade['volumeAsset'];
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
    volumeAssets?: TAsset['id'][];
    anyAssets?: TAsset['id'][];
    instruments?: TInstrumentId[];
    exchanges?: TExchange['name'][];
    strategies?: TStrategyName[];
};
