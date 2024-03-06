import { Milliseconds } from '@frontend/common/src/types/time';

export type TBalancePnlDailyAsset = {
    key: string;
    name: string;
    strategy: string;
    balanceStart: number;
    balanceEnd: number;
    deltaBalance: number;
    deltaBalanceUsd: number | null;
    deltaUsd: number | null;
    isDeltaUsdApproximate: boolean;
    priceStart: number | null;
    priceEnd: number | null;
    priceStartTimestamp: Milliseconds | null;
    priceEndTimestamp: Milliseconds | null;
    deltaPrice: number | null;
    deltaPricePercent: number | null;
};
