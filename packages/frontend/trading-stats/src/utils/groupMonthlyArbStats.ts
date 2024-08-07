import type { TStrategyName } from '@frontend/common/src/types/domain/ownTrades';
import type {
    TBaseAssetStatMonthly,
    TMonthlyStats,
} from '@frontend/common/src/types/domain/tradingStats';
import { isNil } from 'lodash-es';

import { EArbStatsBreakdownType } from '../components/Tables/ArbStatsDaily/types';
import type { TArbMonthlyStrategy } from '../components/Tables/ArbStatsMonthly/types';

export function groupMonthlyArbStats(
    propName: Extract<
        keyof TBaseAssetStatMonthly,
        'volumeUsd' | 'makerVolumeUsd' | 'takerVolumeUsd' | 'feeAmountUsd'
    >,
    assetStats: TMonthlyStats['baseAssetStats'] | undefined,
    exchangeStats: TMonthlyStats['exchangeStats'] | undefined,
): TArbMonthlyStrategy[] | undefined {
    if (isNil(assetStats) || isNil(exchangeStats)) {
        return;
    }

    const assets = assetStats.reduce(
        (acc: Record<TStrategyName, Record<number, TArbMonthlyStrategy>>, stat) => {
            const { strategy, date, assetId, assetName } = stat;
            const value = stat[propName];

            if (acc[strategy] === undefined) {
                acc[strategy] = {};
            }

            const strategyAsset = acc[strategy][assetId] ?? {
                key: `${strategy}|${assetId}`,
                strategy,
                name: assetName,
                breakdown: EArbStatsBreakdownType.AssetWise,
                values: {},
                total: 0,
            };

            // Per-day value
            strategyAsset.values[date] = value;

            // Total recalculation
            if (!isNil(strategyAsset.total) && !isNil(value)) {
                strategyAsset.total += value;
            } else {
                strategyAsset.total = null;
            }

            acc[strategy][assetId] = strategyAsset;
            return acc;
        },
        {},
    );

    const exchanges = exchangeStats.reduce(
        (acc: Record<TStrategyName, Record<string, TArbMonthlyStrategy>>, stat) => {
            const { strategy, date, exchangeName } = stat;
            const value = stat[propName];

            if (acc[strategy] === undefined) {
                acc[strategy] = {};
            }

            const strategyExchange = acc[strategy][exchangeName] ?? {
                key: `${strategy}|${exchangeName}`,
                strategy,
                name: exchangeName,
                breakdown: EArbStatsBreakdownType.ExchangeWise,
                values: {},
                total: 0,
            };

            // Per-day value
            strategyExchange.values[date] = value;

            // Total recalculation
            if (!isNil(strategyExchange.total) && !isNil(value)) {
                strategyExchange.total += value;
            } else {
                strategyExchange.total = null;
            }

            acc[strategy][exchangeName] = strategyExchange;
            return acc;
        },
        {},
    );

    return flatten(assets).concat(flatten(exchanges));
}

export function getGroupIncludeTotalFooter(data: TArbMonthlyStrategy[] | undefined): boolean {
    if (isNil(data)) {
        return false;
    }

    return new Set(data.map((item) => item.strategy)).size > 1;
}

function flatten(
    obj: Record<string, Record<string | number, TArbMonthlyStrategy>>,
): TArbMonthlyStrategy[] {
    return Object.values(obj)
        .map((s) => Object.values(s))
        .flat();
}
