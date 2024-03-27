import { useLiveUpdates } from '@frontend/common/src/components/hooks/useLiveUpdates';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { EApplicationName } from '@frontend/common/src/types/app';
import type {
    TBaseAssetStatMonthly,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import { TMonthlyStats } from '@frontend/common/src/types/domain/tradingStats';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isEqual, isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';
import { EMPTY } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { ModuleTradingStatsActions } from '../../modules/actions/module';
import { ETradingStatsRoutes, TTradingStatsMonthlyRouteParams } from '../../modules/router/defs';
import { ModuleTradingStatsRouter } from '../../modules/router/module';
import { getGroupIncludeTotalFooter, groupMonthlyArbStats } from '../../utils/groupMonthlyArbStats';
import { getTradingStatsMonthlyFilter } from '../../utils/router';
import { ArbStatsMonthly } from '../Tables/ArbStatsMonthly/view';
import { getMonthlyStatsFilter } from './utils';

type TConnectedMonthlyProps = {
    propName: keyof Pick<
        TBaseAssetStatMonthly,
        'volumeUsd' | 'makerVolumeUsd' | 'takerVolumeUsd' | 'feeAmountUsd'
    >;
};

export function ConnectedMonthly(props: TConnectedMonthlyProps): ReactElement | null {
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

    const routerFilter = useSyncObservable(filter$);

    const tradingStats$ = useMemo(() => {
        if (isNil(routerFilter)) {
            return EMPTY;
        }

        return subscribeToMonthlyStats(routerFilter, timeZone);
    }, [routerFilter, subscribeToMonthlyStats, timeZone]);

    const { value } = useLiveUpdates<TMonthlyStats>(tradingStats$);

    const data = useMemo(
        () => groupMonthlyArbStats(props.propName, value?.baseAssetStats, value?.exchangeStats),
        [props.propName, value?.baseAssetStats, value?.exchangeStats],
    );

    const groupIncludeTotalFooter = useMemo(() => getGroupIncludeTotalFooter(data), [data]);

    if (isNil(routerFilter)) {
        return null;
    }

    return (
        <ArbStatsMonthly
            data={data}
            timeZone={timeZone}
            groupIncludeTotalFooter={groupIncludeTotalFooter}
        />
    );
}
