import type { Nil } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TDailyStats,
    TDailyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEqual, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { ModuleSubscribeToDailyStatsWithExcludedStrategies } from '../modules/actions/ModuleSubscribeToDailyStatsWithExcludedStrategies.ts';
import type { TTradingStatsDailyRouteParams } from '../modules/router/defs.ts';
import { ETradingStatsRoutes } from '../modules/router/defs.ts';
import { ModuleTradingStatsRouter } from '../modules/router/module.ts';
import { getDailyStatsFilter } from '../utils/getDailyStatsFilter.ts';
import { getTradingStatsDailyFilter } from '../utils/router.ts';

export type TWidgetDailyStatsProps = {
    children: (
        filter: TDailyStatsFilter | undefined,
        dailyStats: Nil | TDailyStats,
    ) => ReactElement;
};

export function WidgetDailyStats(props: TWidgetDailyStatsProps): ReactElement {
    const { state$ } = useModule(ModuleTradingStatsRouter);
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);
    const [{ timeZone }] = useTimeZoneInfoSettings();
    const subscribeToDailyStats = useModule(ModuleSubscribeToDailyStatsWithExcludedStrategies);

    const filter$ = useMemo(
        () =>
            state$.pipe(
                map((state) => {
                    return state.route.name === ETradingStatsRoutes.Daily
                        ? state.route.params
                        : undefined;
                }),
                filter((params): params is TTradingStatsDailyRouteParams => !isNil(params)),
                map((params) => getDailyStatsFilter(getTradingStatsDailyFilter(timeZone, params))),
                distinctUntilChanged((a, b) => isEqual(a, b)),
            ),
        [state$, timeZone],
    );

    const routerFilter = useSyncObservable(filter$);

    const tradingStats$ = useMemo(
        () =>
            currentSocketStruct$.pipe(
                switchMap((socket) =>
                    isNil(socket) || isNil(routerFilter)
                        ? of(WAITING_VD)
                        : subscribeToDailyStats(
                              {
                                  target: socket,
                                  filters: routerFilter,
                                  timeZone: timeZone,
                              },
                              { traceId: generateTraceId() },
                          ),
                ),
            ),
        [currentSocketStruct$, routerFilter, subscribeToDailyStats, timeZone],
    );
    const descriptor = useNotifiedValueDescriptorObservable(tradingStats$);

    return props.children(routerFilter, descriptor.value);
}
