import { ValueDescriptorsOverlay } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsOverlay.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { cnFit, cnRelative } from '@frontend/common/src/utils/css/common.css';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import cn from 'classnames';
import { memo } from 'react';

import { BacktestingRunConfigs } from '../components/BacktestingRunConfigs/view';
import { ModuleSubscribeToCurrentRobotsConfigs } from '../modules/actions/ModuleSubscribeToCurrentRobotsConfigs';
import { ModuleSubscribeToCurrentRunRobots } from '../modules/actions/ModuleSubscribeToCurrentRunRobots';

export const WidgetBacktestingRunConfigs = memo(({ className }: TWithClassname) => {
    const traceId = useTraceId();
    const subscribeToRunRobots = useModule(ModuleSubscribeToCurrentRunRobots);
    const subscribeToCurrentRobotsConfigs = useModule(ModuleSubscribeToCurrentRobotsConfigs);

    const robots = useNotifiedValueDescriptorObservable(subscribeToRunRobots(traceId));
    const configRecord = useNotifiedValueDescriptorObservable(
        subscribeToCurrentRobotsConfigs(traceId),
    );

    return (
        <div className={cn(cnRelative, className)}>
            <ValueDescriptorsOverlay descriptors={[robots, configRecord]}>
                <BacktestingRunConfigs
                    className={cnFit}
                    robots={robots.value}
                    configs={configRecord.value}
                />
            </ValueDescriptorsOverlay>
        </div>
    );
});
