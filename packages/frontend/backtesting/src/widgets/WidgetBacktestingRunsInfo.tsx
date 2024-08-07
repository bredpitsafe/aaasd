import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { ValueDescriptorsOverlay } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { cnRelative } from '@frontend/common/src/utils/css/common.css';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import {
    distinctValueDescriptorUntilChanged,
    mapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { BacktestingRunsInfo } from '../components/BacktestingRunsInfo/view';
import { useBacktestingRunItems } from '../components/Layout/hooks/useBacktestingRunItems';
import { useConnectedNavigateToBacktestingRun } from '../components/Layout/hooks/useConnectedNavigateToBacktestingRun';
import { useConnectedScoreIndicatorsList } from '../components/Layout/hooks/useConnectedScoreIndicatorsList';
import { ModuleSubscribeToCurrentBacktestingRunId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRunId';
import { ModuleSubscribeToCurrentBacktestingRuns } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRuns';
import { ModuleSubscribeToCurrentBacktestingTask } from '../modules/actions/ModuleSubscribeToCurrentBacktestingTask';

export function WidgetBacktestingRunsInfo(props: TWithClassname): ReactElement | null {
    const traceId = useTraceId();
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const subscribeToCurrentBacktestingTask = useModule(ModuleSubscribeToCurrentBacktestingTask);
    const subscribeToCurrentBacktestingRuns = useModule(ModuleSubscribeToCurrentBacktestingRuns);
    const subscribeToCurrentBacktestingRunId = useModule(ModuleSubscribeToCurrentBacktestingRunId);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const runId = useSyncObservable(subscribeToCurrentBacktestingRunId());
    const stage = useSyncObservable(currentSocketName$);
    const task = useNotifiedValueDescriptorObservable(subscribeToCurrentBacktestingTask(traceId));
    const runs = useNotifiedValueDescriptorObservable(subscribeToCurrentBacktestingRuns(traceId));
    const variableNames = useNotifiedValueDescriptorObservable(
        useMemo(() => {
            return subscribeToCurrentBacktestingRuns(traceId).pipe(
                mapValueDescriptor(({ value: runs }) => {
                    const set = runs.reduce((acc, run) => {
                        if (!isNil(run.variables)) {
                            Object.keys(run.variables).forEach((key) => acc.add(key));
                        }

                        return acc;
                    }, new Set<string>());

                    return createSyncedValueDescriptor(Array.from(set).sort());
                }),
                distinctValueDescriptorUntilChanged(),
            );
        }, [subscribeToCurrentBacktestingRuns, traceId]),
    );

    const {
        scoreIndicatorsList,
        setScoreIndicatorsList,
        updateScoreIndicatorsListInTask,
        descriptors,
    } = useConnectedScoreIndicatorsList(traceId);

    const items = useBacktestingRunItems({
        indicatorNames: scoreIndicatorsList,
        traceId,
    });

    const handleChangeBacktestingRunId = useConnectedNavigateToBacktestingRun(stage, task.value);

    return (
        <div className={cn(cnRelative, props.className)}>
            <ValueDescriptorsOverlay descriptors={[task, runs, variableNames, ...descriptors]}>
                <BacktestingRunsInfo
                    className={props.className}
                    variableNames={variableNames.value ?? EMPTY_ARRAY}
                    runs={items.value ?? EMPTY_ARRAY}
                    scoreIndicatorsList={scoreIndicatorsList}
                    onUpdateScoreIndicatorsList={updateScoreIndicatorsListInTask}
                    setScoreIndicatorsList={setScoreIndicatorsList}
                    activeBacktestingId={runId}
                    onChangeActiveBacktestingId={handleChangeBacktestingRunId}
                    timeZone={timeZone}
                />
            </ValueDescriptorsOverlay>
        </div>
    );
}
