import { assert } from '@common/utils/src/assert.ts';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import type { TMonthlyStatsFilter } from '@frontend/common/src/types/domain/tradingStats.ts';
import { isNil } from 'lodash-es';

import type { TTradingStatsMonthlyRouteParams } from '../modules/router/defs.ts';
import { ETradingStatsRouteParams } from '../modules/router/defs.ts';
import { getFilterProp } from './getFilterProp.ts';

export function getMonthlyStatsFilter(
    filter: TTradingStatsMonthlyRouteParams,
): TMonthlyStatsFilter {
    const from = filter[ETradingStatsRouteParams.From];
    const to = filter[ETradingStatsRouteParams.To];

    assert(!isNil(from), 'From should be provided');
    assert(!isNil(to), 'To should be provided');

    return {
        from,
        to: to || '',
        backtestingId: extractValidNumber(filter[ETradingStatsRouteParams.BacktestingId]),
        include: {
            baseAssets: getFilterProp(filter, ETradingStatsRouteParams.BaseAssetsInclude),
            volumeAssets: getFilterProp(filter, ETradingStatsRouteParams.VolumeAssetsInclude),
            anyAssets: getFilterProp(filter, ETradingStatsRouteParams.AnyAssetsInclude),
            instruments: getFilterProp(filter, ETradingStatsRouteParams.InstrumentsInclude),
            exchanges: getFilterProp(filter, ETradingStatsRouteParams.ExchangesInclude),
            strategies: getFilterProp(filter, ETradingStatsRouteParams.StrategiesInclude),
        },
        exclude: {
            baseAssets: getFilterProp(filter, ETradingStatsRouteParams.BaseAssetsExclude),
            volumeAssets: getFilterProp(filter, ETradingStatsRouteParams.VolumeAssetsExclude),
            anyAssets: getFilterProp(filter, ETradingStatsRouteParams.AnyAssetsExclude),
            instruments: getFilterProp(filter, ETradingStatsRouteParams.InstrumentsExclude),
            exchanges: getFilterProp(filter, ETradingStatsRouteParams.ExchangesExclude),
            strategies: getFilterProp(filter, ETradingStatsRouteParams.StrategiesExclude),
        },
    };
}
