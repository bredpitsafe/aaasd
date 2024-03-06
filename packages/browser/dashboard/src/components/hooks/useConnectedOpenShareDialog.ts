import { useModule } from '@frontend/common/src/di/react';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isNil } from 'lodash-es';
import { useMountedState } from 'react-use';

import { ModuleDashboardActions } from '../../modules/actions';
import type { TDashboardItemKey } from '../../types/fullDashboard';

export function useConnectedOpenShareDialog(
    dashboardItemKey?: TDashboardItemKey,
): [VoidFunction, boolean] {
    const { openModalChangePermissions } = useModule(ModuleDashboardActions);

    const isMounted = useMountedState();

    const [openingShareDialog, setOpeningShareDialog] = useSyncState(false, [dashboardItemKey]);

    const showShareDialog = useFunction(async () => {
        if (isNil(dashboardItemKey)) {
            return;
        }

        setOpeningShareDialog(true);
        try {
            await openModalChangePermissions(dashboardItemKey, generateTraceId());
        } finally {
            if (isMounted()) {
                setOpeningShareDialog(false);
            }
        }
    });

    return [showShareDialog, openingShareDialog];
}
