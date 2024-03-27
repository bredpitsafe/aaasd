import { useLiveUpdates } from '@frontend/common/src/components/hooks/useLiveUpdates';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { EApplicationName } from '@frontend/common/src/types/app';
import type {
    TBalanceStatMonthly,
    TMonthlyStats,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import type { TimeZone } from '@frontend/common/src/types/time';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isEqual, isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';
import { EMPTY } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { ModuleTradingStatsActions } from '../../modules/actions/module';
import { ETradingStatsRoutes, TTradingStatsMonthlyRouteParams } from '../../modules/router/defs';
import { ModuleTradingStatsRouter } from '../../modules/router/module';
import { groupMonthlyPnlStats } from '../../utils/groupMonthlyPnlStats';
import { getTradingStatsMonthlyFilter } from '../../utils/router';
import { BalancePnlMonthly } from '../Tables/BalancePnlMonthly/view';
import { getMonthlyStatsFilter } from './utils';

export function ConnectedProfitsTable(): ReactElement | null {
    const { state$ } = useModule(ModuleTradingStatsRouter);
    const { subscribeToMonthlyStats } = useModule(ModuleTradingStatsActions);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingStats);

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
        if (isNil(filterValue)) {
            return EMPTY;
        }

        return subscribeToMonthlyStats(filterValue, timeZone);
    }, [subscribeToMonthlyStats, filterValue, timeZone]);

    const { value } = useLiveUpdates<TMonthlyStats>(tradingStats$);

    if (isNil(filterValue)) {
        return null;
    }

    return (
        <ConnectedProfitsInnerTableProps
            filter={filterValue}
            value={value?.balanceStats}
            timeZone={timeZone}
        />
    );
}

type TConnectedProfitsInnerTableProps = {
    filter: TMonthlyStatsFilter;
    value: TBalanceStatMonthly[] | undefined;
    timeZone: TimeZone;
};

function ConnectedProfitsInnerTableProps(props: TConnectedProfitsInnerTableProps): ReactElement {
    const data = useMemo(
        () => groupMonthlyPnlStats(props.value, props.filter),
        [props.filter, props.value],
    );

    return <BalancePnlMonthly data={data} timeZone={props.timeZone} />;
}
