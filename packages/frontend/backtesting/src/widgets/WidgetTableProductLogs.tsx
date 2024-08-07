import { iso2milliseconds } from '@common/utils';
import {
    EProductLogsTabSelectors,
    ProductLogsTabProps,
} from '@frontend/common/e2e/selectors/backtesting/components/product-logs-tab/product-logs.tab.selectors';
import { Error } from '@frontend/common/src/components/Error/view';
import { ConnectedCommonProductLogs } from '@frontend/common/src/components/Pages/ConnectedCommonProductLogs';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { ValueDescriptorsOverlay } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TProductLogSubscriptionFilters } from '@frontend/common/src/modules/actions/productLogs/defs.ts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { cnFit, cnRelative } from '@frontend/common/src/utils/css/common.css';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { ModuleSubscribeToCurrentBacktestingRun } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRun';
import { ModuleSubscribeToCurrentBacktestingTask } from '../modules/actions/ModuleSubscribeToCurrentBacktestingTask';
import { ModuleSubscribeToRouterParams } from '../modules/actions/ModuleSubscribeToRouterParams';

enum ESeedLocalStorageKey {
    Hook = 'SERVER_PRODUCT_LOGS_HOOK_STATE',
    View = 'SERVER_PRODUCT_LOGS_VIEW_STATE',
}

function getLocalStorageKeys(id: string): { hook: string; view: string } {
    return {
        hook: `${ESeedLocalStorageKey.Hook}_${id}`,
        view: `${ESeedLocalStorageKey.View}_${id}`,
    };
}

export const WidgetTableProductLogs = memo(({ className }: { className?: string }) => {
    const traceId = useTraceId();
    const { currentSocketName$, currentSocketUrl$ } = useModule(ModuleSocketPage);
    const subscribeToRouterParams = useModule(ModuleSubscribeToRouterParams);
    const subscribeToCurrentBacktestingRun = useModule(ModuleSubscribeToCurrentBacktestingRun);
    const subscribeToCurrentBacktestingTask = useModule(ModuleSubscribeToCurrentBacktestingTask);

    const socketUrl = useSyncObservable(currentSocketUrl$, null);
    const socketName = useSyncObservable(currentSocketName$, null);
    const params = useSyncObservable(subscribeToRouterParams(['runId']));
    const run = useNotifiedValueDescriptorObservable(subscribeToCurrentBacktestingRun(traceId));
    const task = useNotifiedValueDescriptorObservable(subscribeToCurrentBacktestingTask(traceId));
    const backtestingRunId = params?.runId;

    const storageKeys = useMemo(
        () => getLocalStorageKeys(`server:[${socketName}],backtesting:[${backtestingRunId}]`),
        [socketName, backtestingRunId],
    );

    const startTime = run?.value?.simulationStartTime ?? task?.value?.simulationData.startTime;
    const endTime = run?.value?.simulationEndTime ?? task?.value?.simulationData.endTime;

    const filters = useMemo(
        (): Partial<TProductLogSubscriptionFilters> => ({
            since: startTime === undefined ? undefined : iso2milliseconds(startTime),
            till: endTime === undefined ? undefined : iso2milliseconds(endTime),
            backtestingRunId,
        }),
        [startTime, endTime, backtestingRunId],
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const waitInitializeStates =
        socketUrl === null || socketName === null || backtestingRunId === null;
    const waitRequiredStates = socketUrl === undefined;

    return (
        <div className={cn(cnRelative, className)}>
            <ValueDescriptorsOverlay descriptors={[run, task]}>
                {waitInitializeStates || waitRequiredStates ? null : (
                    <div
                        className={cnFit}
                        {...ProductLogsTabProps[EProductLogsTabSelectors.ProductLogsTab]}
                    >
                        {isNil(backtestingRunId) ? (
                            <Error status="warning" title="Run not selected" />
                        ) : (
                            <ConnectedCommonProductLogs
                                socketUrl={socketUrl}
                                storageKeys={storageKeys}
                                filters={filters}
                                timeZone={timeZone}
                            />
                        )}
                    </div>
                )}
            </ValueDescriptorsOverlay>
        </div>
    );
});
