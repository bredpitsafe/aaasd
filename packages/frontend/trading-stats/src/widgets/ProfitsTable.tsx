import type { TimeZone } from '@common/types';
import { generateTraceId } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TBalanceStatMonthly,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isEqual, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { BalancePnlMonthly } from '../components/Tables/BalancePnlMonthly/view.tsx';
import { ModuleSubscribeToMonthlyStatsWithExcludedStrategies } from '../modules/actions/ModuleSubscribeToMonthlyStatsWithExcludedStrategies.ts';
import type { TTradingStatsMonthlyRouteParams } from '../modules/router/defs.ts';
import { ETradingStatsRoutes } from '../modules/router/defs.ts';
import { ModuleTradingStatsRouter } from '../modules/router/module.ts';
import { getMonthlyStatsFilter } from '../utils/getMonthlyStatsFilter.ts';
import { groupMonthlyPnlStats } from '../utils/groupMonthlyPnlStats.ts';
import { getTradingStatsMonthlyFilter } from '../utils/router.ts';

export function WidgetProfitsTable(): ReactElement | null {
    const { state$ } = useModule(ModuleTradingStatsRouter);

    const subscribeToTradingStatsMonth = useModule(
        ModuleSubscribeToMonthlyStatsWithExcludedStrategies,
    );
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);
    const [{ timeZone }] = useTimeZoneInfoSettings();
    const url = useSyncObservable(currentSocketStruct$);

    const filter$ = useMemo(
        () =>
            state$.pipe(
                map((state) => {
                    return state.route.name === ETradingStatsRoutes.Monthly
                        ? state.route.params
                        : undefined;
                }),
                filter((params): params is TTradingStatsMonthlyRouteParams => !isNil(params)),
                map((params) =>
                    getMonthlyStatsFilter(getTradingStatsMonthlyFilter(timeZone, params)),
                ),
                distinctUntilChanged<TMonthlyStatsFilter>(isEqual),
            ),
        [state$, timeZone],
    );

    const filterValue = useSyncObservable(filter$);

    const tradingStats$ = useMemo(() => {
        if (isNil(filterValue) || isNil(url)) {
            return EMPTY;
        }

        return subscribeToTradingStatsMonth(
            {
                target: url,
                filters: filterValue,
                timeZone: timeZone,
            },
            { traceId: generateTraceId() },
        );
    }, [filterValue, subscribeToTradingStatsMonth, url, timeZone]);

    const descriptor = useNotifiedValueDescriptorObservable(tradingStats$);

    if (isNil(filterValue)) {
        return null;
    }

    return (
        <ProfitsInnerTable
            filter={filterValue}
            value={descriptor.value?.balanceStats}
            timeZone={timeZone}
        />
    );
}

type TConnectedProfitsInnerTableProps = {
    filter: TMonthlyStatsFilter;
    value: TBalanceStatMonthly[] | undefined;
    timeZone: TimeZone;
};

function ProfitsInnerTable(props: TConnectedProfitsInnerTableProps): ReactElement {
    const data = useMemo(
        () => groupMonthlyPnlStats(props.value, props.filter),
        [props.filter, props.value],
    );

    return <BalancePnlMonthly data={data} timeZone={props.timeZone} />;
}
