import type { Milliseconds } from '@common/types';
import type { TAssetId, TAssetName } from '@frontend/common/src/types/domain/asset.ts';
import type { TBalanceStatDaily } from '@frontend/common/src/types/domain/tradingStats.ts';

export type TBalancePnlDailyAsset = {
    key: string;
    name: string;
    entityKind: TBalanceStatDaily['entityKind'];
    strategy: string;
    balanceStart: number;
    balanceEnd: number;
    deltaBalance: number;
    deltaBalanceUsd: number | null;
    deltaUsd: number | null;
    isDeltaUsdApproximate: boolean;

    rateStart: number | null;
    rateEnd: number | null;
    rateStartTimestamp: Milliseconds | null;
    rateEndTimestamp: Milliseconds | null;
    deltaRate: number | null;
    deltaRatePercent: number | null;

    priceStart: number | null;
    priceEnd: number | null;
    priceStartTimestamp: Milliseconds | null;
    priceEndTimestamp: Milliseconds | null;
    deltaPrice: number | null;
    deltaPricePercent: number | null;

    assetRateStart: number | null;
    assetRateEnd: number | null;
    assetStartTimestamp: Milliseconds | null;
    assetEndTimestamp: Milliseconds | null;

    multiplier: number | null;
    mvAssetId: TAssetId | null;
    mvAssetName: TAssetName | null;
};
