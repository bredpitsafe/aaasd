import {
    TDailyStatsFilter,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import { assert } from '@frontend/common/src/utils/assert';
import { extractValidNumber } from '@frontend/common/src/utils/extract';
import { isEmpty, isNil } from 'lodash-es';

import {
    ETradingStatsRouteParams,
    TTradingStatsDailyRouteParams,
    TTradingStatsMonthlyRouteParams,
} from '../../modules/router/defs';

export function getDailyStatsFilter(filter: TTradingStatsDailyRouteParams): TDailyStatsFilter {
    const date = filter[ETradingStatsRouteParams.Date];

    assert(!isNil(date), 'Date should be provided');

    return {
        date,
        backtestingId: extractValidNumber(filter[ETradingStatsRouteParams.BacktestingId]),
        include: {
            baseAssets: getFilterProp(filter, ETradingStatsRouteParams.BaseAssetsInclude),
            quoteAssets: getFilterProp(filter, ETradingStatsRouteParams.QuoteAssetsInclude),
            anyAssets: getFilterProp(filter, ETradingStatsRouteParams.AnyAssetsInclude),
            instruments: getFilterProp(filter, ETradingStatsRouteParams.InstrumentsInclude),
            exchanges: getFilterProp(filter, ETradingStatsRouteParams.ExchangesInclude),
            strategies: getFilterProp(filter, ETradingStatsRouteParams.StrategiesInclude),
        },
        exclude: {
            baseAssets: getFilterProp(filter, ETradingStatsRouteParams.BaseAssetsExclude),
            quoteAssets: getFilterProp(filter, ETradingStatsRouteParams.QuoteAssetsExclude),
            anyAssets: getFilterProp(filter, ETradingStatsRouteParams.AnyAssetsExclude),
            instruments: getFilterProp(filter, ETradingStatsRouteParams.InstrumentsExclude),
            exchanges: getFilterProp(filter, ETradingStatsRouteParams.ExchangesExclude),
            strategies: getFilterProp(filter, ETradingStatsRouteParams.StrategiesExclude),
        },
    };
}

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
            quoteAssets: getFilterProp(filter, ETradingStatsRouteParams.QuoteAssetsInclude),
            anyAssets: getFilterProp(filter, ETradingStatsRouteParams.AnyAssetsInclude),
            instruments: getFilterProp(filter, ETradingStatsRouteParams.InstrumentsInclude),
            exchanges: getFilterProp(filter, ETradingStatsRouteParams.ExchangesInclude),
            strategies: getFilterProp(filter, ETradingStatsRouteParams.StrategiesInclude),
        },
        exclude: {
            baseAssets: getFilterProp(filter, ETradingStatsRouteParams.BaseAssetsExclude),
            quoteAssets: getFilterProp(filter, ETradingStatsRouteParams.QuoteAssetsExclude),
            anyAssets: getFilterProp(filter, ETradingStatsRouteParams.AnyAssetsExclude),
            instruments: getFilterProp(filter, ETradingStatsRouteParams.InstrumentsExclude),
            exchanges: getFilterProp(filter, ETradingStatsRouteParams.ExchangesExclude),
            strategies: getFilterProp(filter, ETradingStatsRouteParams.StrategiesExclude),
        },
    };
}

function getFilterProp<F, P extends keyof F>(filters: F, prop: P): undefined | F[P] {
    return isEmpty(filters[prop]) ? undefined : filters[prop];
}
