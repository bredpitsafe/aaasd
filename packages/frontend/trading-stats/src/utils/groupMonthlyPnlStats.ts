import type { TStrategyName, TWithStrategyName } from '@frontend/common/src/types/domain/ownTrades';
import type {
    TMonthlyStats,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import { isNil } from 'lodash-es';
import memoize from 'memoizee';

import type { TBalancePnlMonthly } from '../components/Tables/BalancePnlMonthly/types';

export function groupMonthlyPnlStats(
    data: TMonthlyStats['balanceStats'] | undefined,
    filter: TMonthlyStatsFilter,
): TBalancePnlMonthly[] | undefined {
    const strategies = data?.reduce((acc: Record<TStrategyName, TBalancePnlMonthly>, stat) => {
        const { strategy, date, amountUsd, isApprox } = stat;

        // TODO: Remove client filter when backend will filter `balanceStats` data by strategy
        // @see https://bhft-company.atlassian.net/browse/PLT-6172
        if (!canIncludeStatByStrategy(stat, filter)) {
            return acc;
        }
        const balancePnl = acc[strategy] ?? {
            name: strategy,
            profit: null,
            isApproximateProfit: false,
            profits: {},
        };

        // Common profit for the strategy from all instruments
        // It'll be calculated only from available values, while skipping all null ones.
        if (amountUsd !== null) {
            if (balancePnl.profit === null) {
                balancePnl.profit = amountUsd;
            } else {
                balancePnl.profit += amountUsd;
            }
        }

        // Strategy profit is marked `approximate` if
        // 1. Any of the day profits are marked approximate
        // 2. Any of the day profits are null or undefined.
        balancePnl.isApproximateProfit ||= isApprox || isNil(amountUsd);

        // Per-day profit
        balancePnl.profits[date] ||= {
            date,
            profit: amountUsd,
            isApproximateProfit: isApprox && amountUsd !== null,
        };

        acc[strategy] = balancePnl;

        return acc;
    }, {});

    return strategies ? Object.values(strategies) : undefined;
}

const canIncludeStatByStrategy = memoize(
    (
        stat: TWithStrategyName,
        filter: Pick<TMonthlyStatsFilter, 'include' | 'exclude'>,
    ): boolean | undefined => {
        const include = filter.include?.strategies;
        const exclude = filter.exclude?.strategies;

        return (
            (include === undefined || include.length === 0 || include.includes(stat.strategy)) &&
            (exclude === undefined || exclude.length === 0 || !exclude.includes(stat.strategy))
        );
    },
    { max: 100 },
);
