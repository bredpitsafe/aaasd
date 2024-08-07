import { ConnectedComponentBTRunStates } from '@frontend/common/src/components/connectedComponents/ConnectedComponentBTRunStates';
import { Error as ErrorMessage } from '@frontend/common/src/components/Error/view';
import { Tabs } from '@frontend/common/src/components/Tabs';
import { ValueDescriptorsOverlay } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { cnFit, cnRelative } from '@frontend/common/src/utils/css/common.css';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { ModuleSubscribeToCurrentBacktestingRun } from '../../modules/actions/ModuleSubscribeToCurrentBacktestingRun';
import { ModuleSubscribeToCurrentRunRobots } from '../../modules/actions/ModuleSubscribeToCurrentRunRobots';
import { cnItem, cnTabs } from './WidgetBacktestingRunStates.css';

export const WidgetBacktestingRunStates = memo(({ className }: TWithClassname) => {
    const traceId = useTraceId();
    const subscribeToCurrentBacktestingRun = useModule(ModuleSubscribeToCurrentBacktestingRun);
    const subscribeToCurrentRunRobots = useModule(ModuleSubscribeToCurrentRunRobots);
    const currentBtRunDesc = useNotifiedValueDescriptorObservable(
        subscribeToCurrentBacktestingRun(traceId),
    );
    const currentBtRunRobotsDesc = useNotifiedValueDescriptorObservable(
        subscribeToCurrentRunRobots(traceId),
    );

    const currentBtRun = currentBtRunDesc.value;
    const currentBtRunRobots = currentBtRunRobotsDesc.value;
    const tabs = useMemo(() => {
        if (isNil(currentBtRun) || isNil(currentBtRunRobots)) {
            return undefined;
        }

        return currentBtRunRobots.map((robot) => ({
            key: String(shallowHash(robot.id, currentBtRun.btRunNo)),
            label: robot.name,
            children: (
                <ConnectedComponentBTRunStates
                    className={cnItem}
                    componentId={robot.id}
                    btRunNo={currentBtRun.btRunNo}
                />
            ),
        }));
    }, [currentBtRun, currentBtRunRobots]);

    return (
        <div className={cn(cnRelative, className)}>
            <ValueDescriptorsOverlay descriptors={[currentBtRunDesc, currentBtRunRobotsDesc]}>
                {isEmpty(tabs) ? (
                    <ErrorMessage status="info" title="Run States are not available" />
                ) : (
                    <Tabs className={cn(cnFit, cnTabs)} type="card" size="small" items={tabs} />
                )}
            </ValueDescriptorsOverlay>
        </div>
    );
});
