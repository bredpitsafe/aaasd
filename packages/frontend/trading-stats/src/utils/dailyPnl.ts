import type { ISO, Milliseconds } from '@common/types';
import { iso2milliseconds } from '@common/utils';
import type { TStrategyName, TWithStrategyName } from '@frontend/common/src/types/domain/ownTrades';
import type {
    TBalanceStatDaily,
    TDailyStats,
} from '@frontend/common/src/types/domain/tradingStats';
import { EEntityKind } from '@frontend/common/src/types/domain/tradingStats';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { isEmpty, isUndefined } from 'lodash-es';

import type { TBalancePnlDailyAsset } from '../components/Tables/BalancePnlDaily/types';

export function getPnlAssetsOrInstruments(
    data: TDailyStats['balanceStats'],
): TBalancePnlDailyAsset[] {
    const pnlAssetsOrInstruments = data.map(getAssetOrInstrument);

    return pnlAssetsOrInstruments
        .filter(({ entityKind }) => entityKind === EEntityKind.Asset)
        .concat(
            pnlAssetsOrInstruments.filter(({ entityKind }) => entityKind !== EEntityKind.Asset),
        );
}

export function getStrategies(
    data?: TWithStrategyName[],
): { label: string; value: TStrategyName }[] {
    if (isUndefined(data)) {
        return EMPTY_ARRAY;
    }

    const set = data.reduce((acc, stat) => {
        acc.add(stat.strategy);
        return acc;
    }, new Set<TStrategyName>());

    return Array.from(set)
        .sort()
        .map((strategy) => ({
            label: isEmpty(strategy) ? 'No Strategy' : strategy,
            value: strategy,
        }));
}

function getAssetOrInstrument(stat: TBalanceStatDaily): TBalancePnlDailyAsset {
    return {
        key: `${stat.strategy}_${stat.assetOrInstrumentName}`,
        entityKind: stat.entityKind,
        name: stat.assetOrInstrumentName,
        strategy: stat.strategy || 'No Strategy',
        balanceStart: stat.amountStart,
        balanceEnd: stat.amountEnd,
        deltaBalance: getDeltaBalance(stat),
        deltaBalanceUsd: getDeltaBalanceUsd(stat),
        isDeltaUsdApproximate: getIsDeltaUsdApproximate(stat),
        deltaUsd: getDeltaUsd(stat),

        priceStart: stat.priceStart,
        priceEnd: stat.priceEnd,
        priceStartTimestamp: getTimeStamp(stat.priceStartTs),
        priceEndTimestamp: getTimeStamp(stat.priceEndTs),
        deltaPrice: getDelta(stat.priceStart, stat.priceEnd),
        deltaPricePercent: getDeltaPercent(stat.priceStart, stat.priceEnd),

        rateStart: stat.rateStart,
        rateEnd: stat.rateEnd,
        rateStartTimestamp: getTimeStamp(stat.rateStartTs),
        rateEndTimestamp: getTimeStamp(stat.rateEndTs),
        deltaRate: getDelta(stat.rateStart, stat.rateEnd),
        deltaRatePercent: getDeltaPercent(stat.rateStart, stat.rateEnd),

        assetRateStart: stat.assetRateStart,
        assetRateEnd: stat.assetRateEnd,
        assetStartTimestamp: getTimeStamp(stat.assetStartTs),
        assetEndTimestamp: getTimeStamp(stat.assetEndTs),

        multiplier: stat.multiplier,
        mvAssetId: stat.mvAssetId,
        mvAssetName: stat.mvAssetName,
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

function getDelta(start: number | null, end: number | null): number | null {
    if (start === null || end === null) {
        return null;
    }
    return end - start;
}

function getDeltaPercent(start: number | null, end: number | null): number | null {
    const deltaPrice = getDelta(start, end);

    if (deltaPrice === null || start === null) {
        return null;
    }
    return (deltaPrice / start) * 100;
}

function getTimeStamp(timestamp: ISO | null): Milliseconds | null {
    if (timestamp !== null) {
        return iso2milliseconds(timestamp);
    }

    return timestamp;
}
