import { TStrategyName, TWithStrategyName } from '@frontend/common/src/types/domain/ownTrades';
import { TBalanceStatDaily, TDailyStats } from '@frontend/common/src/types/domain/tradingStats';
import { ISO, Milliseconds } from '@frontend/common/src/types/time';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { iso2milliseconds } from '@frontend/common/src/utils/time';
import { isUndefined } from 'lodash-es';

import { TBalancePnlDailyAsset } from '../components/Tables/BalancePnlDaily/types';

export function getPnlAssets(data: TDailyStats['balanceStats']): TBalancePnlDailyAsset[] {
    return data.map(getAsset);
}

export function getStrategies(data?: TWithStrategyName[]): TStrategyName[] {
    if (isUndefined(data)) {
        return EMPTY_ARRAY;
    }

    const set = data.reduce((acc, stat) => {
        acc.add(stat.strategy);
        return acc;
    }, new Set<TStrategyName>());

    return Array.from(set);
}

function getAsset(stat: TBalanceStatDaily): TBalancePnlDailyAsset {
    return {
        key: `${stat.strategy}_${stat.assetName}`,
        name: stat.assetName,
        strategy: stat.strategy || 'No Strategy',
        balanceStart: stat.amountStart,
        balanceEnd: stat.amountEnd,
        deltaBalance: getDeltaBalance(stat),
        deltaBalanceUsd: getDeltaBalanceUsd(stat),
        isDeltaUsdApproximate: getIsDeltaUsdApproximate(stat),
        deltaUsd: getDeltaUsd(stat),
        deltaPrice: getDeltaPrice(stat),
        deltaPricePercent: getDeltaPricePercent(stat),
        priceStart: stat.rateStart,
        priceEnd: stat.rateEnd,
        priceStartTimestamp: getTimeStamp(stat.rateStartTs),
        priceEndTimestamp: getTimeStamp(stat.rateEndTs),
    };
}

function getDeltaBalance(row: TBalanceStatDaily): TBalancePnlDailyAsset['deltaBalance'] {
    return row.amountEnd - row.amountStart;
}

function getDeltaBalanceUsd(row: TBalanceStatDaily): TBalancePnlDailyAsset['deltaBalanceUsd'] {
    return row.rateEnd !== null ? getDeltaBalance(row) * row.rateEnd : null;
}

function getDeltaUsd(row: TBalanceStatDaily): TBalancePnlDailyAsset['deltaUsd'] {
    if (row.rateStart !== null && row.rateEnd !== null) {
        return row.amountEnd * row.rateEnd - row.rateStart * row.amountStart;
    }
    if (row.rateStart !== null) {
        return row.rateStart * row.amountStart;
    }
    if (row.rateEnd !== null) {
        return row.rateEnd * row.amountEnd;
    }

    return null;
}

function getIsDeltaUsdApproximate(
    row: TBalanceStatDaily,
): TBalancePnlDailyAsset['isDeltaUsdApproximate'] {
    // If both rates are null, even approximate deltaUsd calculation is not possible
    if (row.rateStart === null && row.rateEnd === null) {
        return false;
    }
    return row.rateStart === null || row.rateEnd === null;
}

function getDeltaPrice(row: TBalanceStatDaily): TBalancePnlDailyAsset['deltaPrice'] {
    if (row.rateStart === null || row.rateEnd === null) {
        return null;
    }
    return row.rateEnd - row.rateStart;
}

function getDeltaPricePercent(row: TBalanceStatDaily): TBalancePnlDailyAsset['deltaPricePercent'] {
    const deltaPrice = getDeltaPrice(row);

    if (deltaPrice === null || row.rateStart === null) {
        return null;
    }
    return (deltaPrice / row.rateStart) * 100;
}

function getTimeStamp(timestamp: ISO | null): Milliseconds | null {
    if (timestamp !== null) {
        return iso2milliseconds(timestamp);
    }

    return timestamp;
}
