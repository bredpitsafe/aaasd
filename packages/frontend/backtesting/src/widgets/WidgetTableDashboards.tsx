import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { ValueDescriptorsOverlay } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsOverlay.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { cnFit, cnRelative } from '@frontend/common/src/utils/css/common.css';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import cn from 'classnames';

import { BacktestingTableDashboards } from '../components/BacktestingTableDashboards/view';
import { EDefaultLayoutComponents } from '../layouts/default';
import { ModuleSubscribeToCurrentBacktestingRunId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRunId';
import { ModuleSubscribeToCurrentRobotDashboards } from '../modules/actions/ModuleSubscribeToCurrentRobotDashboards';

export function WidgetTableDashboards(props: TWithClassname) {
    const traceId = useTraceId();
    const { upsertTabFrame } = useModule(ModuleLayouts);
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const subscribeToCurrentRobotDashboards = useModule(ModuleSubscribeToCurrentRobotDashboards);
    const subscribeToCurrentBacktestingRunId = useModule(ModuleSubscribeToCurrentBacktestingRunId);

    const socketName = useSyncObservable(currentSocketName$);
    const backtestingRunId = useSyncObservable(subscribeToCurrentBacktestingRunId());
    const robotDashboards = useNotifiedValueDescriptorObservable(
        subscribeToCurrentRobotDashboards(traceId),
    );

    const cbDashboardLinkClick = useFunction((url: string, name: string) => {
        upsertTabFrame(EDefaultLayoutComponents.RobotDashboard, name, url, {
            runId: backtestingRunId,
        });
    });

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <div className={cn(cnRelative, props.className)}>
            <ValueDescriptorsOverlay descriptors={[robotDashboards]}>
                <BacktestingTableDashboards
                    className={cnFit}
                    timeZone={timeZone}
                    socketName={socketName}
                    dashboards={robotDashboards.value}
                    onDashboardLinkClick={cbDashboardLinkClick}
                />
            </ValueDescriptorsOverlay>
        </div>
    );
}
