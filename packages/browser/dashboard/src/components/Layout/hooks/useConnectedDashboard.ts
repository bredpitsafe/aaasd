import { useModule } from '@frontend/common/src/di/react';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable';

import { ModuleDashboardActions } from '../../../modules/actions';

export function useConnectedDashboard() {
    const { currentDashboard$ } = useModule(ModuleDashboardActions);

    return useNotifiedValueDescriptorObservable(currentDashboard$);
}
