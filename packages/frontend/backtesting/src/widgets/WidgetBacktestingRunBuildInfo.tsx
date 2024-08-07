import { ValueDescriptorsOverlay } from '@frontend/common/src/components/ValueDescriptor/ValueDescriptorsOverlay.tsx';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { cnFit, cnRelative } from '@frontend/common/src/utils/css/common.css';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import cn from 'classnames';
import type { ReactElement } from 'react';

import { BacktestingRunBuildInfo } from '../components/BacktestingRunBuildInfo/view';
import { ModuleSubscribeToCurrentBacktestingRunBuildInfo } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRunBuildInfo';

export function WidgetBacktestingRunBuildInfo(props: TWithClassname): ReactElement | null {
    const subscribeToCurrentBacktestingRunBuildInfo = useModule(
        ModuleSubscribeToCurrentBacktestingRunBuildInfo,
    );

    const traceId = useTraceId();
    const buildInfoList = useNotifiedValueDescriptorObservable(
        subscribeToCurrentBacktestingRunBuildInfo(traceId),
    );

    return (
        <div className={cn(cnRelative, props.className)}>
            <ValueDescriptorsOverlay descriptors={[buildInfoList]}>
                <BacktestingRunBuildInfo buildInfo={buildInfoList.value?.[0]} className={cnFit} />
            </ValueDescriptorsOverlay>
        </div>
    );
}
