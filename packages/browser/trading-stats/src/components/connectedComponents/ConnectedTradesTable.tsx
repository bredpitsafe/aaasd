import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import type { TimeZone } from '@frontend/common/src/types/time';
import { CalendarDate, TimeZoneList } from '@frontend/common/src/types/time';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { parseToDayjsInTimeZone } from '@frontend/common/src/utils/time';
import { isEqual, isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { useInfinityHistoryOwnTrades } from '../../hooks/useInfinityHistoryOwnTrades';
import { ETradingStatsRoutes, TTradingStatsDailyRouteParams } from '../../modules/router/defs';
import { ModuleTradingStatsRouter } from '../../modules/router/module';
import { getTradingStatsDailyFilter } from '../../utils/router';
import { DailyTrades } from '../DailyTrades';
import { getDailyStatsFilter } from './utils';

export function ConnectedDailyTradesTable(): ReactElement | null {
    const { state$ } = useModule(ModuleTradingStatsRouter);

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingStats);

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
                map((params) => getFilter(params)),
                distinctUntilChanged<TDailyStatsFilter>(isEqual),
            ),
        [state$, getFilter],
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
