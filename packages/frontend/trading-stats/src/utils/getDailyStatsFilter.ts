import { assert } from '@common/utils/src/assert.ts';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import type { TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats.ts';
import { isNil } from 'lodash-es';

import type { TTradingStatsDailyRouteParams } from '../modules/router/defs.ts';
import { ETradingStatsRouteParams } from '../modules/router/defs.ts';
import { getFilterProp } from './getFilterProp.ts';

export function getDailyStatsFilter(filter: TTradingStatsDailyRouteParams): TDailyStatsFilter {
    const date = filter[ETradingStatsRouteParams.Date];

    assert(!isNil(date), 'Date should be provided');

    return {
        date,
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
