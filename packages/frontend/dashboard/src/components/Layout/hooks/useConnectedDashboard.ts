import { useModule } from '@frontend/common/src/di/react';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';
import { generateTraceId } from '@frontend/common/src/utils/traceId';

import { ModuleSubscribeToCurrentDashboard } from '../../../modules/actions/dashboards/currentDashboardSubscription.ts';

export function useConnectedDashboard() {
    const subscribeToCurrentDashboard = useModule(ModuleSubscribeToCurrentDashboard);

    return useNotifiedValueDescriptorObservable(
        subscribeToCurrentDashboard(undefined, { traceId: generateTraceId() }),
    );
}
