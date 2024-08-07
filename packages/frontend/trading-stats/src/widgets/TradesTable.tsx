import type { CalendarDate, TimeZone } from '@common/types';
import { TimeZoneList } from '@common/types';
import { parseToDayjsInTimeZone } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSocketList } from '@frontend/common/src/modules/socketList';
import type { TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isEmpty, isEqual, isNil, uniq } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { DailyTrades } from '../components/DailyTrades';
import { useInfinityHistoryOwnTrades } from '../hooks/useInfinityHistoryOwnTrades.ts';
import { ModuleExcludedStrategies } from '../modules/actions/ModuleExcludedStrategies.ts';
import type { TTradingStatsDailyRouteParams } from '../modules/router/defs.ts';
import { ETradingStatsRoutes } from '../modules/router/defs.ts';
import { ModuleTradingStatsRouter } from '../modules/router/module.ts';
import { getDailyStatsFilter } from '../utils/getDailyStatsFilter.ts';
import { getTradingStatsDailyFilter } from '../utils/router.ts';

export function WidgetTradesTable(): ReactElement | null {
    const { state$ } = useModule(ModuleTradingStatsRouter);
    const { getSocket$ } = useModule(ModuleSocketList);
    const { subscribeToExcludedStrategies } = useModule(ModuleExcludedStrategies);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const getFilter = useFunction((params: TTradingStatsDailyRouteParams) =>
        getDailyStatsFilter(getTradingStatsDailyFilter(timeZone, params)),
    );

    const filter$ = useMemo(
        () =>
            state$.pipe(
                map((state) => {
                    return state.route.name === ETradingStatsRoutes.Daily
                        ? state.route.params
                        : undefined;
                }),
                filter((params): params is TTradingStatsDailyRouteParams => !isNil(params)),
                switchMap((params) => {
                    return getSocket$(params.socket).pipe(
                        // Manually add any excluded strategies from the global filter to request body
                        switchMap((target) => subscribeToExcludedStrategies(target)),
                        map((excludedStrategies) => {
                            return getFilter(
                                isNil(excludedStrategies) || isEmpty(excludedStrategies)
                                    ? params
                                    : {
                                          ...params,
                                          strategiesExclude: uniq([
                                              ...(params.strategiesExclude ?? EMPTY_ARRAY),
                                              ...excludedStrategies,
                                          ]),
                                      },
                            );
                        }),
                    );
                }),
                distinctUntilChanged<TDailyStatsFilter>(isEqual),
            ),
        [state$, getSocket$, subscribeToExcludedStrategies, getFilter],
    );

    const filterValue = useSyncObservable(filter$);

    if (isNil(filterValue)) {
        return null;
    }

    return <FilledDailyTradesTable filter={filterValue} timeZone={timeZone} />;
}

type TFilledDailyTradesTableProps = {
    filter: TDailyStatsFilter;
    timeZone: TimeZone;
};

function FilledDailyTradesTable(props: TFilledDailyTradesTableProps): ReactElement {
    const { getItems$, updateTrigger$, updateTime, toggleLive } = useInfinityHistoryOwnTrades(
        props.filter,
        props.timeZone,
    );

    const handleTouchTop = useFunction(() => {
        toggleLive(true);
    });

    const handleUnTouchTop = useFunction(() => {
        toggleLive(false);
    });

    const { since, till } = useMemo(() => {
        const original = parseToDayjsInTimeZone(props.filter.date, TimeZoneList.UTC, 'YYYY-MM-DD');
        return {
            since: original.format('YYYY-MM-DD') as CalendarDate,
            till: original.add(1, 'days').format('YYYY-MM-DD') as CalendarDate,
        };
    }, [props.filter.date]);

    return (
        <DailyTrades
            timeZone={props.timeZone}
            since={since}
            till={till}
            getRows={getItems$}
            updateTime={updateTime}
            refreshInfiniteCacheTrigger$={updateTrigger$}
            onTouchTop={handleTouchTop}
            onUnTouchTop={handleUnTouchTop}
        />
    );
}
