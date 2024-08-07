import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { ValueDescriptorsOverlay } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsOverlay.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { cnFit, cnRelative } from '@frontend/common/src/utils/css/common.css';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import cn from 'classnames';
import type { ReactElement } from 'react';

import { BacktestingRuns } from '../components/BacktestingRuns/view';
import { useBacktestingRunItems } from '../components/Layout/hooks/useBacktestingRunItems';
import { useConnectedNavigateToBacktestingRun } from '../components/Layout/hooks/useConnectedNavigateToBacktestingRun';
import { useConnectedScoreIndicatorsList } from '../components/Layout/hooks/useConnectedScoreIndicatorsList';
import { useRunActions } from '../hooks/useRunActions';
import { ModuleSubscribeToCurrentBacktestingRunId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRunId';
import { ModuleSubscribeToCurrentBacktestingTask } from '../modules/actions/ModuleSubscribeToCurrentBacktestingTask';

type TConnectedBacktestingRuns = TWithClassname;

export function WidgetBacktestingRuns(props: TConnectedBacktestingRuns): null | ReactElement {
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const stage = useSyncObservable(currentSocketName$);
    const subscribeToCurrentBacktestingTask = useModule(ModuleSubscribeToCurrentBacktestingTask);
    const subscribeToCurrentBacktestingRunId = useModule(ModuleSubscribeToCurrentBacktestingRunId);
    const traceId = useTraceId();
    const runId = useSyncObservable(subscribeToCurrentBacktestingRunId());
    const task = useNotifiedValueDescriptorObservable(subscribeToCurrentBacktestingTask(traceId));

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

    const { pauseRun, resumeRun } = useRunActions();
    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <div className={cn(cnRelative, props.className)}>
            <ValueDescriptorsOverlay descriptors={[items, ...descriptors]}>
                <BacktestingRuns
                    className={cnFit}
                    items={items.value ?? EMPTY_ARRAY}
                    scoreIndicatorsList={scoreIndicatorsList}
                    onUpdateScoreIndicatorsList={updateScoreIndicatorsListInTask}
                    setScoreIndicatorsList={setScoreIndicatorsList}
                    activeBacktestingId={runId}
                    onChangeActiveBacktestingId={handleChangeBacktestingRunId}
                    onPause={pauseRun}
                    onResume={resumeRun}
                    timeZone={timeZone}
                />
            </ValueDescriptorsOverlay>
        </div>
    );
}
