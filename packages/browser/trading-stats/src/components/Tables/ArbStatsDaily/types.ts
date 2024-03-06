import { Milliseconds } from '@frontend/common/src/types/time';

export enum EArbStatsBreakdownType {
    AssetWise = 'AssetWise',
    ExchangeWise = 'ExchangeWise',
}

export type TArbStatsDailyAsset = {
    key: string;
    breakdown: EArbStatsBreakdownType;
    strategy: string;
    entityName: string;
    tradesToday: number;
    volumeUsdToday: number;
    lastTrade: Milliseconds | null;
    feesUsd: number | null;
    fees: TArbStatsDailyAssetFee[] | null;
    makerVolumeUsd: number | null;
    takerVolumeUsd: number | null;
};

type TArbStatsDailyAssetFee = {
    assetName: string;
    value: number;
};
