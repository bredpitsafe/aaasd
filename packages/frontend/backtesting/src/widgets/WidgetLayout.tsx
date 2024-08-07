import { useModule } from '@frontend/common/src/di/react';
import { useLayout } from '@frontend/common/src/hooks/layouts/useLayout';
import { ModuleLayouts } from '@frontend/common/src/modules/layouts';
import { ModuleTypicalRouter } from '@frontend/common/src/modules/router';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import cn from 'classnames';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { cnNav, cnRoot } from '../components/Page/view.css';
import { ELayoutIds } from '../layouts';
import { defaultLayoutFactory, getTitleFactory } from '../layouts/default';
import { ModuleSubscribeToCurrentBacktestingRunId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRunId';
import { ModuleSubscribeToCurrentBacktestingTaskId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingTaskId';
import { WidgetNav } from './WidgetNav';

export function WidgetLayout(props: TWithClassname): ReactElement | null {
    const { setParams } = useModule(ModuleTypicalRouter);
    const subscribeToCurrentBacktestingTaskId = useModule(
        ModuleSubscribeToCurrentBacktestingTaskId,
    );
    const subscribeToCurrentBacktestingRunId = useModule(ModuleSubscribeToCurrentBacktestingRunId);
    const { dropDraft } = useModule(ModuleLayouts);

    const backtestingTaskId = useSyncObservable(subscribeToCurrentBacktestingTaskId());
    const backtestingRunId = useSyncObservable(subscribeToCurrentBacktestingRunId());

    const titleFactory = useMemo(
        () => getTitleFactory(backtestingTaskId, backtestingRunId),
        [backtestingTaskId, backtestingRunId],
    );

    const cbSelectTab = useFunction((tab: string) => {
        void setParams({ tab });
    });

    const layout = useLayout({
        layoutId: ELayoutIds.Default,
        factory: defaultLayoutFactory,
        onSelectTab: cbSelectTab,
        titleFactory,
    });

    return (
        <>
            <WidgetNav
                className={cnNav}
                onResetLayout={layout.onResetLayout}
                onResetToSaved={dropDraft}
            />
            <div className={cn(cnRoot, props.className)}>{layout.component}</div>
        </>
    );
}
