import {
    TWithLiveUpdates,
    useLiveUpdates,
} from '@frontend/common/src/components/hooks/useLiveUpdates';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { EApplicationName } from '@frontend/common/src/types/app';
import type {
    TDailyStats,
    TDailyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isEqual, isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';
import { EMPTY } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { ModuleTradingStatsActions } from '../../modules/actions/module';
import { ETradingStatsRoutes, TTradingStatsDailyRouteParams } from '../../modules/router/defs';
import { ModuleTradingStatsRouter } from '../../modules/router/module';
import { getTradingStatsDailyFilter } from '../../utils/router';
import { getDailyStatsFilter } from './utils';

type TConnectedDailyProps = {
    children: (
        filter: TDailyStatsFilter | undefined,
        value: TDailyStats | undefined,
        updates: TWithLiveUpdates,
    ) => ReactElement;
};

export function ConnectedDaily(props: TConnectedDailyProps): ReactElement {
    const { state$ } = useModule(ModuleTradingStatsRouter);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingStats);
    const { subscribeToDailyStats } = useModule(ModuleTradingStatsActions);

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

    const tradingStats$ = useMemo(() => {
        if (isNil(routerFilter)) {
            return EMPTY;
        }

        return subscribeToDailyStats(routerFilter, timeZone);
    }, [routerFilter, subscribeToDailyStats, timeZone]);
    const { value, ...updates } = useLiveUpdates<TDailyStats>(tradingStats$);

    return props.children(routerFilter, value, updates);
}
