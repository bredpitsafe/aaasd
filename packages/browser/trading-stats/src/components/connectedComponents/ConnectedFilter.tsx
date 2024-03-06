import { useLiveUpdates } from '@frontend/common/src/components/hooks/useLiveUpdates';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ETypicalSearchParams } from '@frontend/common/src/modules/router/defs';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type {
    TDailyStats,
    TMonthlyStats,
    TTradingStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import { assert } from '@frontend/common/src/utils/assert';
import { extractValidNumber } from '@frontend/common/src/utils/extract';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { getTimeZoneFullName } from '@frontend/common/src/utils/time';
import { isEqual, isNil, uniqBy } from 'lodash-es';
import { ReactElement, useMemo } from 'react';
import { EMPTY } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { ModuleTradingStatsActions } from '../../modules/actions/module';
import { ETradingStatsRouteParams, ETradingStatsRoutes } from '../../modules/router/defs';
import { ModuleTradingStatsRouter } from '../../modules/router/module';
import { getStrategies } from '../../utils/dailyPnl';
import { getTradingStatsDailyFilter, getTradingStatsMonthlyFilter } from '../../utils/router';
import { TradingStatsFilter } from '../Filter';
import { getDailyStatsFilter, getMonthlyStatsFilter } from './utils';
import { cnTimeZone } from './view.css';

export function ConnectedFilter(): ReactElement {
    const { getSocketAssetsDedobsed$, getSocketInstrumentsDedobsed$ } =
        useModule(ModuleBaseActions);
    const { navigate, state$ } = useModule(ModuleTradingStatsRouter);
    const { subscribeToDailyStats, subscribeToMonthlyStats } = useModule(ModuleTradingStatsActions);

    const [timeZoneInfo] = useTimeZoneInfoSettings(EApplicationName.TradingStats);
    const routeState = useSyncObservable(state$);
    const instruments = useSyncObservable(getSocketInstrumentsDedobsed$());
    const assets = useSyncObservable(getSocketAssetsDedobsed$());
    const exchanges = useMemo(
        () =>
            uniqBy<TExchange>(
                instruments?.map((instrument) => ({
                    name: instrument.exchange,
                })) || [],
                (exc) => exc.name,
            ),
        [instruments],
    );

    const routerFilter$ = useMemo(
        () =>
            state$.pipe(
                map((state) => {
                    if (state.route.name === ETradingStatsRoutes.Daily) {
                        return [
                            ETradingStatsRoutes.Daily,
                            getTradingStatsDailyFilter(timeZoneInfo.timeZone, state.route.params),
                        ] as const;
                    }
                    if (state.route.name === ETradingStatsRoutes.Monthly) {
                        return [
                            ETradingStatsRoutes.Monthly,
                            getTradingStatsMonthlyFilter(timeZoneInfo.timeZone, state.route.params),
                        ] as const;
                    }
                }),
                filter((params): params is Exclude<typeof params, undefined> => !isNil(params)),
                distinctUntilChanged((a, b) => isEqual(a, b)),
            ),
        [state$, timeZoneInfo.timeZone],
    );

    const requestFilter$ = useMemo(() => {
        return routerFilter$.pipe(
            map(([name, params]) => {
                return name === ETradingStatsRoutes.Daily
                    ? ([name, getDailyStatsFilter(params)] as const)
                    : ([name, getMonthlyStatsFilter(params)] as const);
            }),
        );
    }, [routerFilter$]);

    const componentFilter$ = useMemo(
        () =>
            routerFilter$.pipe(
                map(([name, params]): TTradingStatsFilter => {
                    return {
                        ...params,
                        date:
                            name === ETradingStatsRoutes.Daily
                                ? params[ETradingStatsRouteParams.Date]
                                : params[ETradingStatsRouteParams.From],
                    };
                }),
            ),
        [routerFilter$],
    );

    const routerFilter = useSyncObservable(routerFilter$);
    const requestFilter = useSyncObservable(requestFilter$);
    const componentFilter = useSyncObservable(componentFilter$);
    const tradingStats$ = isNil(requestFilter)
        ? EMPTY
        : requestFilter[0] === ETradingStatsRoutes.Daily
          ? subscribeToDailyStats(requestFilter[1], timeZoneInfo.timeZone)
          : subscribeToMonthlyStats(requestFilter[1], timeZoneInfo.timeZone);

    const { value, error, live, toggleLive, updateTime } = useLiveUpdates<
        TDailyStats | TMonthlyStats
    >(tradingStats$);

    const strategies = useMemo(() => getStrategies(value?.balanceStats), [value?.balanceStats]);
    const timeZoneName = useMemo(() => getTimeZoneFullName(timeZoneInfo), [timeZoneInfo]);

    const isDailyStats = routerFilter?.[0] === ETradingStatsRoutes.Daily;
    const isMonthlyStats = routerFilter?.[0] === ETradingStatsRoutes.Monthly;

    const handleSubmit = useFunction((filter: TTradingStatsFilter) => {
        assert(!isNil(routeState), 'RouteState can not be empty');

        const socket = extractRouterParam(routeState.route, 'socket');
        assert(!isNil(socket), 'Socket can not be empty');

        const props = {
            ...routeState.route.params,
            [ETypicalSearchParams.Socket]: socket,
            [ETradingStatsRouteParams.BacktestingId]: extractValidNumber(filter.backtestingId),
            [ETradingStatsRouteParams.BaseAssetsInclude]: filter.baseAssetsInclude,
            [ETradingStatsRouteParams.QuoteAssetsInclude]: filter.quoteAssetsInclude,
            [ETradingStatsRouteParams.AnyAssetsInclude]: filter.anyAssetsInclude,
            [ETradingStatsRouteParams.InstrumentsInclude]: filter.instrumentsInclude,
            [ETradingStatsRouteParams.ExchangesInclude]: filter.exchangesInclude,
            [ETradingStatsRouteParams.StrategiesInclude]: filter.strategiesInclude,
            [ETradingStatsRouteParams.BaseAssetsExclude]: filter.baseAssetsExclude,
            [ETradingStatsRouteParams.QuoteAssetsExclude]: filter.quoteAssetsExclude,
            [ETradingStatsRouteParams.AnyAssetsExclude]: filter.anyAssetsExclude,
            [ETradingStatsRouteParams.InstrumentsExclude]: filter.instrumentsExclude,
            [ETradingStatsRouteParams.ExchangesExclude]: filter.exchangesExclude,
            [ETradingStatsRouteParams.StrategiesExclude]: filter.strategiesExclude,
        };

        if (isDailyStats) {
            return navigate(
                ETradingStatsRoutes.Daily,
                {
                    ...props,
                    [ETradingStatsRouteParams.Date]: filter.date,
                },
                { force: true },
            );
        }

        if (isMonthlyStats) {
            return navigate(
                ETradingStatsRoutes.Monthly,
                {
                    ...props,
                    [ETradingStatsRouteParams.From]: filter.date,
                    [ETradingStatsRouteParams.To]: filter.to,
                },
                { force: true },
            );
        }
    });

    const handleReset = useFunction(() => {
        assert(!isNil(routeState), 'RouteState can not be empty');

        const socket = extractRouterParam(routeState.route, 'socket');
        assert(!isNil(socket), 'Socket can not be empty');

        return navigate(
            isMonthlyStats ? ETradingStatsRoutes.Monthly : ETradingStatsRoutes.Daily,
            { socket },
            { force: true },
        );
    });

    return (
        <>
            <div className={cnTimeZone}>{timeZoneName}</div>
            <TradingStatsFilter
                assets={assets}
                instruments={instruments}
                exchanges={exchanges}
                filter={componentFilter}
                strategies={strategies}
                live={live}
                toggleLive={toggleLive}
                updateTime={updateTime}
                error={error}
                isMonthlyStats={isMonthlyStats}
                timeZone={timeZoneInfo.timeZone}
                onReset={handleReset}
                onSubmit={handleSubmit}
            />
        </>
    );
}
