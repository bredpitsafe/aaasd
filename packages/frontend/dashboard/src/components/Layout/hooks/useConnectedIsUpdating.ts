import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { useValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { of } from 'rxjs';

import { ModuleUI } from '../../../modules/ui/module';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards';

export function useConnectedIsUpdating(dashboardItemKey: TDashboardItemKey | undefined) {
    const { getDashboardsUpdateProgress } = useModule(ModuleUI);

    const vd = useValueDescriptorObservable(
        useMemo(
            () =>
                isNil(dashboardItemKey)
                    ? of(createSyncedValueDescriptor(false))
                    : getDashboardsUpdateProgress(undefined, { traceId: generateTraceId() }).pipe(
                          mapValueDescriptor(({ value: set }) => {
                              return createSyncedValueDescriptor(
                                  isStorageDashboardItemKey(dashboardItemKey) &&
                                      set.includes(dashboardItemKey.storageId),
                              );
                          }),
                      ),
            [getDashboardsUpdateProgress, dashboardItemKey],
        ),
    );

    return isSyncedValueDescriptor(vd) ? vd.value : false;
}
