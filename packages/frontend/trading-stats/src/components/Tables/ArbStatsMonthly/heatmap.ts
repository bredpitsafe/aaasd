import type { TStrategyName } from '@frontend/common/src/types/domain/ownTrades';
import { isNil } from 'lodash-es';

import { EArbStatsBreakdownType } from '../ArbStatsDaily/types';
import type { THeatmapBorders } from '../defs.ts';
import type { TArbMonthlyStrategy } from './types';

export function calculateHeatmapBreakdown(
    list: TArbMonthlyStrategy[],
    breakdown: EArbStatsBreakdownType,
): THeatmapBorders {
    const values = list
        .filter((item) => item.breakdown === breakdown)
        .reduce((acc, listItem) => {
            const values = Object.values(listItem.values).reduce((acc, volumeItem) => {
                if (!isNil(volumeItem)) {
                    acc.push(volumeItem);
                }

                return acc;
            }, [] as number[]);

            return acc.concat(values);
        }, [] as number[])
        .sort((a, b) => a - b);

    return { min: values[0] ?? 0, max: values[values.length - 1] ?? 0 };
}

export function calculateHeatmapTotals(list: TArbMonthlyStrategy[]): THeatmapBorders {
    const totalsByStrategy = list.reduce(
        (acc, item) => {
            if (isNil(acc[item.strategy])) {
                acc[item.strategy] = 0;
            }

            if (item.breakdown === EArbStatsBreakdownType.ExchangeWise && !isNil(item.total)) {
                acc[item.strategy] += item.total;
            }

            return acc;
        },
        {} as Record<TStrategyName, number>,
    );

    const totals = Object.values(totalsByStrategy).sort((a, b) => a - b);
    return { min: totals[0] ?? 0, max: totals[totals.length - 1] ?? 0 };
}

export function calculateHeatmapTotalsBreakdown(
    list: TArbMonthlyStrategy[],
    breakdown: EArbStatsBreakdownType,
): THeatmapBorders {
    const totals = list
        .reduce((acc, item) => {
            if (item.breakdown === breakdown && !isNil(item.total)) {
                acc.push(item.total);
            }

            return acc;
        }, [] as number[])
        .sort((a, b) => a - b);

    return { min: totals[0] ?? 0, max: totals[totals.length - 1] ?? 0 };
}

export function calculateHeatmapStrategyByDate(list: TArbMonthlyStrategy[]): THeatmapBorders {
    const objByStrategy = list
        .filter((item) => item.breakdown === EArbStatsBreakdownType.ExchangeWise)
        .reduce((acc: Record<TStrategyName, Record<string, number>>, listItem) => {
            if (isNil(acc[listItem.strategy])) {
                acc[listItem.strategy] = {} as Record<string, number>;
            }
            // Record<date,sum> for a single exchange
            Object.entries(listItem.values).forEach(([date, value]) => {
                if (isNil(acc[listItem.strategy][date])) {
                    acc[listItem.strategy][date] = 0;
                }
                if (!isNil(value)) {
                    acc[listItem.strategy][date] += value;
                }
            });

            return acc;
        }, {});

    const values = Object.values(objByStrategy)
        .reduce((acc, item) => {
            return acc.concat(Object.values(item));
        }, [] as number[])
        .sort((a, b) => a - b);

    return { min: values[0] ?? 0, max: values[values.length - 1] ?? 0 };
}
