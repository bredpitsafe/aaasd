import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { isNil } from 'lodash-es';
import { useMountedState } from 'react-use';

import { ModuleOpenModalChangePermissions } from '../../modules/actions/modals/openModalChangePermissions.tsx';
import type { TDashboardItemKey } from '../../types/fullDashboard';

export function useConnectedOpenShareDialog(
    dashboardItemKey?: TDashboardItemKey,
): [VoidFunction, boolean] {
    const openModalChangePermissions = useModule(ModuleOpenModalChangePermissions);

    const isMounted = useMountedState();

    const [openingShareDialog, setOpeningShareDialog] = useSyncState(false, [dashboardItemKey]);

    const showShareDialog = useFunction(async () => {
        if (isNil(dashboardItemKey)) {
            return;
        }

        setOpeningShareDialog(true);
        try {
            return openModalChangePermissions(dashboardItemKey, {
                traceId: generateTraceId(),
            }).subscribe();
        } finally {
            if (isMounted()) {
                setOpeningShareDialog(false);
            }
        }
    });

    return [showShareDialog, openingShareDialog];
}
