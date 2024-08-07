import type { CalendarDate, ISO } from '@common/types';

import type { TAsset, TAssetId, TAssetName } from './asset';
import type { TBacktestingRunId } from './backtestings';
import type { TExchange } from './exchange';
import type { TInstrument, TInstrumentId } from './instrument';
import type { TStrategyName, TTradeFilterParams } from './ownTrades';

export type TTradingStatsFilter = {
    date: CalendarDate;
    to?: CalendarDate;

    backtestingId?: TBacktestingRunId;
    baseAssetsInclude?: TAsset['id'][];
    volumeAssetsInclude?: TAsset['id'][];
    anyAssetsInclude?: TAsset['id'][];
    instrumentsInclude?: TInstrumentId[];
    exchangesInclude?: TExchange['name'][];
    strategiesInclude?: TStrategyName[];
    baseAssetsExclude?: TAsset['id'][];
    volumeAssetsExclude?: TAsset['id'][];
    anyAssetsExclude?: TAsset['id'][];
    instrumentsExclude?: TInstrumentId[];
    exchangesExclude?: TExchange['name'][];
    strategiesExclude?: TStrategyName[];
};

export enum ETradingStatsTimeFormat {
    Time = 'HH:mm:ss',
    DateTime = 'YYYY-MM-DD HH:mm:ss',
    DateTimeSSS = 'YYYY-MM-DD HH:mm:ss.SSS',
    DateTimeWithoutYear = 'DD.MM HH:mm:ss',
}

export type TDailyStatsFilter = {
    date: string;
    include?: TTradeFilterParams;
    exclude?: TTradeFilterParams;
    backtestingId: TBacktestingRunId | undefined;
};

export type TAmountUSD = number | null;

type TArbitrageStatsFee = {
    assetId: TAsset['id'];
    assetName: TAsset['name'];
    amount: number;
    amountUsd: TAmountUSD;
};
type TArbitrageStats = {
    strategy: TStrategyName;
    tradeCount: number;
    volumeUsd: number;
    makerVolumeUsd: number;
    takerVolumeUsd: number;
    lastTradeTime: ISO;
    fees: TArbitrageStatsFee[];
};

export enum EEntityKind {
    Asset = 'Asset',
    Instrument = 'Instrument',
}

export type TBalanceStatDaily = (
    | {
          entityKind: EEntityKind.Asset;
          assetOrInstrumentId: TAssetId;
          assetOrInstrumentName: TAssetName;
      }
    | {
          entityKind: EEntityKind.Instrument;
          assetOrInstrumentId: TInstrumentId;
          assetOrInstrumentName: TInstrument['name'];
      }
) & {
    strategy: TStrategyName;

    amountStart: number;
    amountEnd: number;

    rateStart: number | null;
    rateEnd: number | null;
    rateStartTs: ISO | null;
    rateEndTs: ISO | null;

    priceStart: number | null;
    priceEnd: number | null;
    priceStartTs: ISO | null;
    priceEndTs: ISO | null;

    assetRateStart: number | null;
    assetRateEnd: number | null;
    assetStartTs: ISO | null;
    assetEndTs: ISO | null;

    multiplier: number | null;
    mvAssetId: TAssetId | null;
    mvAssetName: TAssetName | null;
};

export type TExchangeStat = TArbitrageStats & {
    exchangeName: TExchange['name'];
};
export type TBaseAssetStat = TArbitrageStats & {
    assetId: TAsset['id'];
    assetName: TAsset['name'];
};
export type TDailyStats = {
    balanceStats: TBalanceStatDaily[];
    exchangeStats: TExchangeStat[];
    baseAssetStats: TBaseAssetStat[];
};
export type TMonthlyStatsFilter = {
    from: string;
    to: string;
    include?: TTradeFilterParams;
    exclude?: TTradeFilterParams;
    backtestingId: TBacktestingRunId | undefined;
};
export type TBalanceStatMonthly = {
    amountUsd: TAmountUSD;
    date: string;
    strategy: TStrategyName;
    isApprox: boolean;
};
export type TBaseAssetStatMonthly = {
    assetId: TAsset['id'];
    assetName: TAsset['name'];
    date: string;
    strategy: TStrategyName;
    volumeUsd: number;
    makerVolumeUsd: number;
    takerVolumeUsd: number;
    feeAmountUsd: number;
};
export type TExchangeStatMonthly = {
    date: string;
    exchangeName: TExchange['name'];
    strategy: TStrategyName;
    volumeUsd: number;
    makerVolumeUsd: number;
    takerVolumeUsd: number;
    feeAmountUsd: number;
};
export type TMonthlyStats = {
    balanceStats: TBalanceStatMonthly[];
    baseAssetStats: TBaseAssetStatMonthly[];
    exchangeStats: TExchangeStatMonthly[];
};
