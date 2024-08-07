import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleSubscribeToAssetsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToAssetsOnCurrentStage.ts';
import { ModuleSubscribeToInstrumentsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToInstrumentsOnCurrentStage.ts';
import { ETypicalSearchParams } from '@frontend/common/src/modules/router/defs.ts';
import { extractRouterParam } from '@frontend/common/src/modules/router/utils.ts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TExchange } from '@frontend/common/src/types/domain/exchange.ts';
import type { TTradingStatsFilter } from '@frontend/common/src/types/domain/tradingStats.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil, uniqBy } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { of, switchMap } from 'rxjs';

import { TradingStatsFilter } from '../components/Filter';
import { ModuleSubscribeToStrategiesList } from '../modules/actions/ModuleSubscribeToStrategiesList.ts';
import { ModuleSubscribeToTradingStatsFilter } from '../modules/actions/ModuleSubscribeToTradingStatsFilter.ts';
import { ETradingStatsRouteParams, ETradingStatsRoutes } from '../modules/router/defs.ts';
import { ModuleTradingStatsRouter } from '../modules/router/module.ts';

export function WidgetFilter(): ReactElement {
    const { navigate, state$ } = useModule(ModuleTradingStatsRouter);
    const subscribeToAssets = useModule(ModuleSubscribeToAssetsOnCurrentStage);
    const subscribeToInstruments = useModule(ModuleSubscribeToInstrumentsOnCurrentStage);
    const subscribeToStrategiesList = useModule(ModuleSubscribeToStrategiesList);
    const getTradingStatsFilter = useModule(ModuleSubscribeToTradingStatsFilter);
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);

    const [timeZoneInfo] = useTimeZoneInfoSettings();
    const filterData = useSyncObservable(getTradingStatsFilter(timeZoneInfo.timeZone));

    const routeState = useSyncObservable(state$);
    const assets = useNotifiedValueDescriptorObservable(
        subscribeToAssets(undefined, { traceId: generateTraceId() }),
    );
    const instruments = useNotifiedValueDescriptorObservable(
        subscribeToInstruments(undefined, { traceId: generateTraceId() }),
    );
    const exchanges = useMemo(
        () =>
            uniqBy<TExchange>(
                instruments.value?.map((instrument) => ({
                    name: instrument.exchange,
                })) || [],
                (exc) => exc.name,
            ),
        [instruments],
    );

    const strategies$ = useMemo(() => {
        return currentSocketStruct$.pipe(
            switchMap((target) =>
                isNil(target)
                    ? of(WAITING_VD)
                    : subscribeToStrategiesList(
                          {
                              target,
                              timeZone: timeZoneInfo.timeZone,
                              showExcludedStrategies: false,
                          },
                          { traceId: generateTraceId() },
                      ),
            ),
        );
    }, [currentSocketStruct$, subscribeToStrategiesList, timeZoneInfo.timeZone]);

    const descriptor = useNotifiedValueDescriptorObservable(strategies$);

    const isDailyStats = filterData?.route === ETradingStatsRoutes.Daily;
    const isMonthlyStats = filterData?.route === ETradingStatsRoutes.Monthly;

    const handleSubmit = useFunction((filter: TTradingStatsFilter) => {
        assert(!isNil(routeState), 'RouteState can not be empty');

        const socket = extractRouterParam(routeState.route, 'socket');
        assert(!isNil(socket), 'Socket can not be empty');

        const props = {
            ...routeState.route.params,
            [ETypicalSearchParams.Socket]: socket,
            [ETradingStatsRouteParams.BacktestingId]: extractValidNumber(filter.backtestingId),
            [ETradingStatsRouteParams.BaseAssetsInclude]: filter.baseAssetsInclude,
            [ETradingStatsRouteParams.VolumeAssetsInclude]: filter.volumeAssetsInclude,
            [ETradingStatsRouteParams.AnyAssetsInclude]: filter.anyAssetsInclude,
            [ETradingStatsRouteParams.InstrumentsInclude]: filter.instrumentsInclude,
            [ETradingStatsRouteParams.ExchangesInclude]: filter.exchangesInclude,
            [ETradingStatsRouteParams.StrategiesInclude]: filter.strategiesInclude,
            [ETradingStatsRouteParams.BaseAssetsExclude]: filter.baseAssetsExclude,
            [ETradingStatsRouteParams.VolumeAssetsExclude]: filter.volumeAssetsExclude,
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
        <TradingStatsFilter
            assets={assets.value}
            instruments={instruments.value}
            exchanges={exchanges}
            filter={filterData?.componentFilter}
            strategies={descriptor?.value ?? EMPTY_ARRAY}
            isMonthlyStats={isMonthlyStats}
            timeZone={timeZoneInfo.timeZone}
            onReset={handleReset}
            onSubmit={handleSubmit}
        />
    );
}
