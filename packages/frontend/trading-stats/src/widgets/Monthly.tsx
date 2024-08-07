import { generateTraceId } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';
import { useModule } from '@frontend/common/src/di/react.tsx';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TBaseAssetStatMonthly,
    TMonthlyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { WAITING_VD } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEqual, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { of, switchMap } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { ArbStatsMonthly } from '../components/Tables/ArbStatsMonthly/view.tsx';
import { ModuleSubscribeToMonthlyStatsWithExcludedStrategies } from '../modules/actions/ModuleSubscribeToMonthlyStatsWithExcludedStrategies.ts';
import type { TTradingStatsMonthlyRouteParams } from '../modules/router/defs.ts';
import { ETradingStatsRoutes } from '../modules/router/defs.ts';
import { ModuleTradingStatsRouter } from '../modules/router/module.ts';
import { getMonthlyStatsFilter } from '../utils/getMonthlyStatsFilter.ts';
import { getGroupIncludeTotalFooter, groupMonthlyArbStats } from '../utils/groupMonthlyArbStats.ts';
import { getTradingStatsMonthlyFilter } from '../utils/router.ts';

type TWidgetMonthlyProps = {
    propName: keyof Pick<
        TBaseAssetStatMonthly,
        'volumeUsd' | 'makerVolumeUsd' | 'takerVolumeUsd' | 'feeAmountUsd'
    >;
};

export function WidgetMonthly(props: TWidgetMonthlyProps): ReactElement | null {
    const { state$ } = useModule(ModuleTradingStatsRouter);
    const [{ timeZone }] = useTimeZoneInfoSettings();
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);
    const subscribeToTradingStatsMonth = useModule(
        ModuleSubscribeToMonthlyStatsWithExcludedStrategies,
    );

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

    const tradingStats$ = useMemo(
        () =>
            currentSocketStruct$.pipe(
                switchMap((socket) =>
                    isNil(socket) || isNil(routerFilter)
                        ? of(WAITING_VD)
                        : subscribeToTradingStatsMonth(
                              {
                                  target: socket,
                                  filters: routerFilter,
                                  timeZone: timeZone,
                              },
                              { traceId: generateTraceId() },
                          ),
                ),
            ),
        [currentSocketStruct$, routerFilter, subscribeToTradingStatsMonth, timeZone],
    );

    const descriptor = useNotifiedValueDescriptorObservable(tradingStats$);

    const data = useMemo(
        () =>
            groupMonthlyArbStats(
                props.propName,
                descriptor.value?.baseAssetStats,
                descriptor.value?.exchangeStats,
            ),
        [descriptor.value?.baseAssetStats, descriptor.value?.exchangeStats, props.propName],
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
