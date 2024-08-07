import type { ISO } from '@common/types';
import {
    EIndicatorsTabSelectors,
    IndicatorsTabProps,
} from '@frontend/common/e2e/selectors/backtesting/components/indicators-tab/indicators.tab.selectors';
import { useSyncedTableFilter } from '@frontend/common/src/components/AgTable/hooks/useSyncedTableFilter';
import { Error } from '@frontend/common/src/components/Error/view';
import { ConnectedCommonSnapshotIndicators } from '@frontend/common/src/components/Pages/ConnectedCommonSnapshotIndicators';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { EDefaultLayoutComponents } from '../layouts/default';
import { ModuleSubscribeToCurrentBacktestingRunId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRunId';

export const WidgetTableIndicators = memo(({ className }: TWithClassname) => {
    const { upsertTabFrame } = useModule(ModuleLayouts);
    const { currentSocketName$, currentSocketUrl$ } = useModule(ModuleSocketPage);
    const subscribeToCurrentBacktestingRunId = useModule(ModuleSubscribeToCurrentBacktestingRunId);

    const socketUrl = useSyncObservable(currentSocketUrl$);
    const socketName = useSyncObservable(currentSocketName$);
    const backtestingRunId = useSyncObservable(subscribeToCurrentBacktestingRunId());

    const cbDashboardLinkClick = useFunction((url: string, name: string) => {
        upsertTabFrame(EDefaultLayoutComponents.IndicatorsDashboard, name, url, {
            runId: backtestingRunId,
        });
    });

    const [date, setDate] = useSyncedTableFilter<ISO>(ETableIds.AllIndicators, 'date');

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return isNil(socketUrl) || isNil(socketName) ? null : (
        <div className={className} {...IndicatorsTabProps[EIndicatorsTabSelectors.IndicatorsTab]}>
            {isNil(backtestingRunId) ? (
                <Error status="warning" title="Run not selected" />
            ) : (
                <ConnectedCommonSnapshotIndicators
                    socketUrl={socketUrl}
                    socketName={socketName}
                    date={date}
                    onChangeDate={setDate}
                    backtestingRunId={backtestingRunId}
                    onDashboardLinkClick={cbDashboardLinkClick}
                    timeZone={timeZone}
                />
            )}
        </div>
    );
});
