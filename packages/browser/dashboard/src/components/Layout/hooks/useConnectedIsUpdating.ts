import { useModule } from '@frontend/common/src/di/react';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModuleUI } from '../../../modules/ui/module';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';

export function useConnectedIsUpdating(dashboardItemKey: TDashboardItemKey | undefined) {
    const { dashboardsUpdatingSet$ } = useModule(ModuleUI);

    return useSyncObservable(
        useMemo(
            () =>
                isNil(dashboardItemKey)
                    ? of(false)
                    : dashboardsUpdatingSet$.pipe(
                          map(
                              (set) =>
                                  isStorageDashboardItemKey(dashboardItemKey) &&
                                  set.has(dashboardItemKey.storageId),
                          ),
                      ),
            [dashboardsUpdatingSet$, dashboardItemKey],
        ),
        false,
    );
}
